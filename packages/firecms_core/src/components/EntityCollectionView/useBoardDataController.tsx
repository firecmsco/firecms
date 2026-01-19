import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Entity, EntityCollection, FilterValues } from "../../types";
import { useDataSource, useFireCMSContext, useNavigationController } from "../../hooks";

const DEFAULT_PAGE_SIZE = 30;

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
                error: undefined
            };
        });
        return initial;
    });

    // Track cleanup functions for subscriptions
    const unsubscribersRef = useRef<Record<string, () => void>>({});

    // Refresh counter to force re-subscription
    const [refreshCounters, setRefreshCounters] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        columns.forEach(col => { initial[col] = 0; });
        return initial;
    });

    // Initialize new columns if columns array changes
    useEffect(() => {
        setColumnItemCounts(prev => {
            const updated = { ...prev };
            columns.forEach(col => {
                if (!(col in updated)) {
                    updated[col] = pageSize;
                }
            });
            return updated;
        });

        setColumnData(prev => {
            const updated = { ...prev };
            columns.forEach(col => {
                if (!(col in updated)) {
                    updated[col] = {
                        entities: [],
                        loading: true,
                        hasMore: true,
                        error: undefined
                    };
                }
            });
            return updated;
        });

        setRefreshCounters(prev => {
            const updated = { ...prev };
            columns.forEach(col => {
                if (!(col in updated)) {
                    updated[col] = 0;
                }
            });
            return updated;
        });
    }, [columns, pageSize]);

    // Cleanup subscriptions on unmount
    useEffect(() => {
        return () => {
            Object.values(unsubscribersRef.current).forEach(unsub => unsub());
        };
    }, []);

    // Create subscription/fetch for each column
    useEffect(() => {
        // Clean up existing subscriptions for columns that are no longer present
        Object.keys(unsubscribersRef.current).forEach(col => {
            if (!columns.includes(col)) {
                unsubscribersRef.current[col]?.();
                delete unsubscribersRef.current[col];
            }
        });

        // Set up subscription for each column
        columns.forEach(column => {
            // Unsubscribe from previous subscription for this column
            unsubscribersRef.current[column]?.();

            const itemCount = columnItemCounts[column] ?? pageSize;

            // Build filter: columnProperty == column value + any additional filters
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

            const onEntitiesUpdate = async (entities: Entity<M>[]) => {
                // Apply onFetch callbacks if defined
                if (collection.callbacks?.onFetch) {
                    try {
                        entities = await Promise.all(
                            entities.map(entity =>
                                collection.callbacks!.onFetch!({
                                    collection,
                                    path: resolvedPath,
                                    entity,
                                    context
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
                        entities,
                        loading: false,
                        hasMore: entities.length >= itemCount,
                        error: undefined
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

            // Use listenCollection for real-time updates if available
            if (dataSource.listenCollection) {
                const unsubscribe = dataSource.listenCollection<M>({
                    path: resolvedPath,
                    collection,
                    onUpdate: onEntitiesUpdate,
                    onError,
                    searchString,
                    filter: columnFilter,
                    limit: itemCount,
                    startAfter: undefined,
                    orderBy: orderProperty,
                    order: "asc"
                });
                unsubscribersRef.current[column] = unsubscribe;
            } else {
                // Fallback to fetchCollection without real-time updates
                dataSource.fetchCollection<M>({
                    path: resolvedPath,
                    collection,
                    searchString,
                    filter: columnFilter,
                    limit: itemCount,
                    startAfter: undefined,
                    orderBy: orderProperty,
                    order: "asc"
                })
                    .then(onEntitiesUpdate)
                    .catch(onError);
            }
        });

        // Cleanup function to unsubscribe all current subscriptions
        return () => {
            Object.values(unsubscribersRef.current).forEach(unsub => unsub?.());
            unsubscribersRef.current = {};
        };
    }, [
        columns.join(","), // Only re-run when columns change
        resolvedPath,
        columnProperty,
        orderProperty,
        searchString,
        JSON.stringify(filterValues),
        JSON.stringify(columnItemCounts),
        JSON.stringify(refreshCounters),
        dataSource,
        collection,
        context,
        pageSize
    ]);

    const loadMoreColumn = useCallback((column: COLUMN) => {
        setColumnItemCounts(prev => ({
            ...prev,
            [column]: (prev[column] ?? pageSize) + pageSize
        }));
    }, [pageSize]);

    const refreshColumn = useCallback((column: COLUMN) => {
        setRefreshCounters(prev => ({
            ...prev,
            [column]: (prev[column] ?? 0) + 1
        }));
    }, []);

    const refreshAll = useCallback(() => {
        setRefreshCounters(prev => {
            const updated = { ...prev };
            columns.forEach(col => {
                updated[col] = (updated[col] ?? 0) + 1;
            });
            return updated;
        });
    }, [columns]);

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
        loading,
        error
    };
}
