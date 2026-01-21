import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Entity, EntityCollection, FilterValues } from "../../types";
import { useDataSource, useFireCMSContext, useNavigationController } from "../../hooks";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Data state for a single board column
 */
export interface BoardColumnData<M extends Record<string, any> = any> {
    /** Entities loaded for this column */
    entities: Entity<M>[];
    /** Whether the column is currently loading data */
    loading: boolean;
    /** Whether there are more items to load */
    hasMore: boolean;
    /** Error if loading failed */
    error?: Error;
    /** Total count of entities in this column */
    totalCount?: number;
}

/**
 * Controller for managing per-column data in a Kanban board
 */
export interface BoardDataController<M extends Record<string, any> = any, COLUMN extends string = string> {
    /** Data state for each column */
    columnData: Record<COLUMN, BoardColumnData<M>>;
    /** Load more items for a specific column */
    loadMoreColumn: (column: COLUMN) => void;
    /** Refresh data for a specific column */
    refreshColumn: (column: COLUMN) => void;
    /** Refresh all columns */
    refreshAll: () => void;
    /** Update counts for columns (for optimistic updates when moving items) */
    updateColumnCounts: (sourceColumn: COLUMN, targetColumn: COLUMN) => void;
    /** Whether any column is loading */
    loading: boolean;
    /** Any error from any column */
    error?: Error;
}

export interface UseBoardDataControllerProps<M extends Record<string, any> = any> {
    /** Full path to the collection */
    fullPath: string;
    /** The entity collection configuration */
    collection: EntityCollection<M>;
    /** Property key used for column assignment */
    columnProperty: string;
    /** Array of column values (enum values from columnProperty) */
    columns: string[];
    /** Property key used for ordering within columns */
    orderProperty?: string;
    /** Number of items to load per page per column */
    pageSize?: number;
    /** Text search string to filter entities */
    searchString?: string;
    /** Additional filter values */
    filterValues?: FilterValues<string>;
}

/**
 * Hook that manages per-column data loading for the Kanban board.
 * Each column gets its own independent query to the data source.
 */
export function useBoardDataController<M extends Record<string, any> = any, COLUMN extends string = string>({
    fullPath,
    collection,
    columnProperty,
    columns,
    orderProperty,
    pageSize = DEFAULT_PAGE_SIZE,
    searchString,
    filterValues
}: UseBoardDataControllerProps<M>): BoardDataController<M, COLUMN> {

    const context = useFireCMSContext();
    const dataSource = useDataSource(collection);
    const navigation = useNavigationController();
    const resolvedPath = useMemo(() => navigation.resolveIdsFrom(fullPath), [fullPath, navigation.resolveIdsFrom]);

    // Stable refs for objects that shouldn't trigger re-subscriptions
    const dataSourceRef = useRef(dataSource);
    const collectionRef = useRef(collection);
    const contextRef = useRef(context);
    dataSourceRef.current = dataSource;
    collectionRef.current = collection;
    contextRef.current = context;

    // Track item count per column for pagination
    const [columnItemCounts, setColumnItemCounts] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        columns.forEach(col => { initial[col] = pageSize; });
        return initial;
    });

    // Per-column data state
    const [columnData, setColumnData] = useState<Record<string, BoardColumnData<M>>>(() => {
        const initial: Record<string, BoardColumnData<M>> = {};
        columns.forEach(col => {
            initial[col] = {
                entities: [],
                loading: true,
                hasMore: true,
                error: undefined,
                totalCount: undefined
            };
        });
        return initial;
    });

    // Track cleanup functions for subscriptions
    const unsubscribersRef = useRef<Record<string, () => void>>({});

    // Stable keys for dependency comparison
    const columnsKey = useMemo(() => [...columns].sort().join(","), [columns]);
    const filterKey = useMemo(() => JSON.stringify(filterValues), [filterValues]);
    const itemCountsKey = useMemo(() => JSON.stringify(columnItemCounts), [columnItemCounts]);

    // Cleanup subscriptions on unmount
    useEffect(() => {
        return () => {
            Object.values(unsubscribersRef.current).forEach(unsub => unsub?.());
        };
    }, []);

    // Single effect for all column subscriptions
    // Only re-runs when query parameters actually change
    useEffect(() => {
        // Clean up all existing subscriptions
        Object.values(unsubscribersRef.current).forEach(unsub => unsub?.());
        unsubscribersRef.current = {};

        const currentDataSource = dataSourceRef.current;
        const currentCollection = collectionRef.current;
        const currentContext = contextRef.current;

        columns.forEach(column => {
            const itemCount = columnItemCounts[column] ?? pageSize;

            // Build filter for this column
            const columnFilter: FilterValues<string> = {
                ...filterValues,
                [columnProperty]: ["==", column]
            };

            // Mark column as loading
            setColumnData(prev => ({
                ...prev,
                [column]: {
                    ...prev[column],
                    loading: true,
                    error: undefined
                }
            }));

            // onUpdate callback
            const onUpdate = async (entities: Entity<M>[]) => {
                // When text search is active, the data source returns ALL matching entities
                // regardless of the column filter. We need to filter in memory to only show
                // entities that belong to this specific column.
                let processed = searchString
                    ? entities.filter(e => e.values?.[columnProperty] === column)
                    : entities;

                // Apply onFetch callbacks if any
                if (currentCollection.callbacks?.onFetch) {
                    try {
                        processed = await Promise.all(
                            processed.map(entity =>
                                currentCollection.callbacks!.onFetch!({
                                    collection: currentCollection,
                                    path: resolvedPath,
                                    entity,
                                    context: currentContext
                                })
                            )
                        );
                    } catch (e) {
                        console.error("Error in onFetch callback:", e);
                    }
                }

                setColumnData(prev => ({
                    ...prev,
                    [column]: {
                        entities: processed,
                        loading: false,
                        hasMore: entities.length >= itemCount,
                        error: undefined,
                        totalCount: prev[column]?.totalCount // Keep existing count
                    }
                }));
            };

            const onError = (error: Error) => {
                console.error(`Error loading column ${column}:`, error);
                setColumnData(prev => ({
                    ...prev,
                    [column]: {
                        ...prev[column],
                        entities: [],
                        loading: false,
                        hasMore: false,
                        error
                    }
                }));
            };

            // Set up listener or fetch
            if (currentDataSource.listenCollection) {
                const unsubscribe = currentDataSource.listenCollection<M>({
                    path: resolvedPath,
                    collection: currentCollection,
                    onUpdate,
                    onError,
                    searchString,
                    filter: columnFilter,
                    limit: itemCount,
                    startAfter: undefined,
                    orderBy: orderProperty,
                    order: orderProperty ? "asc" : undefined
                });
                unsubscribersRef.current[column] = unsubscribe;
            } else {
                currentDataSource.fetchCollection<M>({
                    path: resolvedPath,
                    collection: currentCollection,
                    searchString,
                    filter: columnFilter,
                    limit: itemCount,
                    startAfter: undefined,
                    orderBy: orderProperty,
                    order: orderProperty ? "asc" : undefined
                })
                    .then(onUpdate)
                    .catch(onError);
            }

            // Count query for column (for display in column header)
            if (currentDataSource.countEntities) {
                currentDataSource.countEntities({
                    path: resolvedPath,
                    collection: currentCollection,
                    filter: columnFilter,
                    searchString
                }).then(count => {
                    setColumnData(prev => ({
                        ...prev,
                        [column]: {
                            ...prev[column],
                            totalCount: count
                        }
                    }));
                }).catch(e => {
                    console.warn(`Failed to get count for column ${column}:`, e);
                });
            }
        });

        return () => {
            Object.values(unsubscribersRef.current).forEach(unsub => unsub?.());
            unsubscribersRef.current = {};
        };
    }, [
        columnsKey,
        resolvedPath,
        columnProperty,
        orderProperty,
        searchString,
        filterKey,
        itemCountsKey, // This includes pagination - only changes when user loads more
        pageSize
    ]);

    const loadMoreColumn = useCallback((column: COLUMN) => {
        setColumnItemCounts(prev => ({
            ...prev,
            [column]: (prev[column] ?? pageSize) + pageSize
        }));
    }, [pageSize]);

    const refreshColumn = useCallback((column: COLUMN) => {
        // Force re-subscribe by resetting to initial count
        setColumnItemCounts(prev => ({
            ...prev,
            [column]: pageSize
        }));
    }, [pageSize]);

    const refreshAll = useCallback(() => {
        const reset: Record<string, number> = {};
        columns.forEach(col => { reset[col] = pageSize; });
        setColumnItemCounts(reset);
    }, [columns, pageSize]);

    // Optimistic update for column counts when moving an item between columns
    const updateColumnCounts = useCallback((sourceColumn: COLUMN, targetColumn: COLUMN) => {
        if (sourceColumn === targetColumn) return;

        setColumnData(prev => {
            const updated = { ...prev };

            // Decrease source column count
            if (updated[sourceColumn]?.totalCount !== undefined) {
                updated[sourceColumn] = {
                    ...updated[sourceColumn],
                    totalCount: Math.max(0, (updated[sourceColumn].totalCount ?? 0) - 1)
                };
            }

            // Increase target column count
            if (updated[targetColumn]?.totalCount !== undefined) {
                updated[targetColumn] = {
                    ...updated[targetColumn],
                    totalCount: (updated[targetColumn].totalCount ?? 0) + 1
                };
            }

            return updated;
        });
    }, []);

    // Aggregate loading and error state
    const loading = useMemo(() => {
        return Object.values(columnData).some((col) => col.loading);
    }, [columnData]);

    const error = useMemo(() => {
        const errors = Object.values(columnData)
            .map((col) => col.error)
            .filter(Boolean);
        return errors[0];
    }, [columnData]);

    return {
        columnData: columnData as Record<COLUMN, BoardColumnData<M>>,
        loadMoreColumn,
        refreshColumn,
        refreshAll,
        updateColumnCounts,
        loading,
        error
    };
}
