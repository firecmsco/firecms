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
    /** Total count of entities in this column (may differ from entities.length if some lack orderProperty) */
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

    // Use refs for objects that change identity frequently but we don't want to trigger re-subscriptions
    const dataSourceRef = useRef(dataSource);
    const collectionRef = useRef(collection);
    const contextRef = useRef(context);
    dataSourceRef.current = dataSource;
    collectionRef.current = collection;
    contextRef.current = context;

    // Track item count per column for pagination
    const [columnItemCounts, setColumnItemCounts] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        columns.forEach(col => {
            initial[col] = pageSize;
        });
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

    // Refresh counter to force re-subscription
    const [refreshCounter, setRefreshCounter] = useState(0);

    // Stable key for columns
    const columnsKey = useMemo(() => [...columns].sort().join(","), [columns]);
    const filterKey = useMemo(() => JSON.stringify(filterValues), [filterValues]);

    // Cleanup subscriptions on unmount
    useEffect(() => {
        return () => {
            Object.values(unsubscribersRef.current).forEach(unsub => unsub?.());
        };
    }, []);

    // Create subscription/fetch for each column - SIMPLE version
    useEffect(() => {
        // Clean up all existing subscriptions first
        Object.values(unsubscribersRef.current).forEach(unsub => unsub?.());
        unsubscribersRef.current = {};

        // Get current values from refs
        const currentDataSource = dataSourceRef.current;
        const currentCollection = collectionRef.current;
        const currentContext = contextRef.current;

        columns.forEach(column => {
            const itemCount = columnItemCounts[column] ?? pageSize;

            // Build filter
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

            // Helper to apply onFetch callbacks
            const applyOnFetch = async (entities: Entity<M>[]): Promise<Entity<M>[]> => {
                if (currentCollection.callbacks?.onFetch) {
                    try {
                        return await Promise.all(
                            entities.map(entity =>
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
                return entities;
            };

            // Merge entities from two queries
            const mergeEntities = (orderedEntities: Entity<M>[], allEntities: Entity<M>[]): Entity<M>[] => {
                const orderedIds = new Set(orderedEntities.map(e => e.id));
                const unorderedEntities = allEntities.filter(e => !orderedIds.has(e.id));
                return [...orderedEntities, ...unorderedEntities];
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

            // Set up queries
            if (orderProperty && currentDataSource.listenCollection) {
                // Real-time with dual queries
                let orderedEntities: Entity<M>[] = [];
                let allEntities: Entity<M>[] = [];
                let orderedLoaded = false;
                let allLoaded = false;

                const updateColumnData = async () => {
                    if (!orderedLoaded || !allLoaded) return;
                    const merged = mergeEntities(orderedEntities, allEntities);
                    const processed = await applyOnFetch(merged);

                    setColumnData(prev => ({
                        ...prev,
                        [column]: {
                            entities: processed,
                            loading: false,
                            hasMore: processed.length >= itemCount,
                            error: undefined,
                            totalCount: allEntities.length
                        }
                    }));
                };

                const unsubOrdered = currentDataSource.listenCollection<M>({
                    path: resolvedPath,
                    collection: currentCollection,
                    onUpdate: (entities) => {
                        orderedEntities = entities;
                        orderedLoaded = true;
                        updateColumnData();
                    },
                    onError,
                    searchString,
                    filter: columnFilter,
                    limit: itemCount,
                    startAfter: undefined,
                    orderBy: orderProperty,
                    order: "asc"
                });

                const unsubAll = currentDataSource.listenCollection<M>({
                    path: resolvedPath,
                    collection: currentCollection,
                    onUpdate: (entities) => {
                        allEntities = entities;
                        allLoaded = true;
                        updateColumnData();
                    },
                    onError,
                    searchString,
                    filter: columnFilter,
                    limit: itemCount,
                    startAfter: undefined
                });

                unsubscribersRef.current[column] = () => {
                    unsubOrdered();
                    unsubAll();
                };
            } else if (orderProperty) {
                // Fetch mode with dual queries
                Promise.all([
                    currentDataSource.fetchCollection<M>({
                        path: resolvedPath,
                        collection: currentCollection,
                        searchString,
                        filter: columnFilter,
                        limit: itemCount,
                        startAfter: undefined,
                        orderBy: orderProperty,
                        order: "asc"
                    }),
                    currentDataSource.fetchCollection<M>({
                        path: resolvedPath,
                        collection: currentCollection,
                        searchString,
                        filter: columnFilter,
                        limit: itemCount,
                        startAfter: undefined
                    })
                ]).then(async ([orderedEntities, allEntities]) => {
                    const merged = mergeEntities(orderedEntities, allEntities);
                    const processed = await applyOnFetch(merged);

                    setColumnData(prev => ({
                        ...prev,
                        [column]: {
                            entities: processed,
                            loading: false,
                            hasMore: processed.length >= itemCount,
                            error: undefined,
                            totalCount: allEntities.length
                        }
                    }));
                }).catch(onError);
            } else {
                // No order property - simple query
                if (currentDataSource.listenCollection) {
                    const unsubscribe = currentDataSource.listenCollection<M>({
                        path: resolvedPath,
                        collection: currentCollection,
                        onUpdate: async (entities) => {
                            const processed = await applyOnFetch(entities);
                            setColumnData(prev => ({
                                ...prev,
                                [column]: {
                                    entities: processed,
                                    loading: false,
                                    hasMore: entities.length >= itemCount,
                                    error: undefined,
                                    totalCount: entities.length
                                }
                            }));
                        },
                        onError,
                        searchString,
                        filter: columnFilter,
                        limit: itemCount,
                        startAfter: undefined
                    });
                    unsubscribersRef.current[column] = unsubscribe;
                } else {
                    currentDataSource.fetchCollection<M>({
                        path: resolvedPath,
                        collection: currentCollection,
                        searchString,
                        filter: columnFilter,
                        limit: itemCount,
                        startAfter: undefined
                    })
                        .then(async (entities) => {
                            const processed = await applyOnFetch(entities);
                            setColumnData(prev => ({
                                ...prev,
                                [column]: {
                                    entities: processed,
                                    loading: false,
                                    hasMore: entities.length >= itemCount,
                                    error: undefined,
                                    totalCount: entities.length
                                }
                            }));
                        })
                        .catch(onError);
                }
            }

            // Count query
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
        refreshCounter,
        pageSize
        // dataSource, collection, context accessed via refs
    ]);

    // Re-run effect when columnItemCounts changes (pagination)
    useEffect(() => {
        // Trigger refresh when item counts change
        setRefreshCounter(c => c + 1);
    }, [JSON.stringify(columnItemCounts)]);

    const loadMoreColumn = useCallback((column: COLUMN) => {
        setColumnItemCounts(prev => ({
            ...prev,
            [column]: (prev[column] ?? pageSize) + pageSize
        }));
    }, [pageSize]);

    const refreshColumn = useCallback((column: COLUMN) => {
        setRefreshCounter(c => c + 1);
    }, []);

    const refreshAll = useCallback(() => {
        setRefreshCounter(c => c + 1);
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
        loading,
        error
    };
}
