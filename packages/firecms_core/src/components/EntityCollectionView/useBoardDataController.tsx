import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Entity, EntityCollection, FilterValues } from "@firecms/types";
import { useDataSource, useFireCMSContext } from "../../hooks";

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
    /** Decrement column counts (for optimistic updates when deleting items) */
    decrementColumnCounts: (columnDeltas: Record<COLUMN, number>) => void;
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
    // v4: use fullPath directly instead of resolveIdsFrom
    const resolvedPath = fullPath;

    // Stable refs for objects that shouldn't trigger re-subscriptions
    const dataSourceRef = useRef(dataSource);
    const collectionRef = useRef(collection);
    const contextRef = useRef(context);
    dataSourceRef.current = dataSource;
    collectionRef.current = collection;
    contextRef.current = context;

    // Store filter/order params in refs so they're accessible without causing re-subscriptions
    const filterValuesRef = useRef(filterValues);
    const columnPropertyRef = useRef(columnProperty);
    const orderPropertyRef = useRef(orderProperty);
    const searchStringRef = useRef(searchString);
    const resolvedPathRef = useRef(resolvedPath);
    filterValuesRef.current = filterValues;
    columnPropertyRef.current = columnProperty;
    orderPropertyRef.current = orderProperty;
    searchStringRef.current = searchString;
    resolvedPathRef.current = resolvedPath;

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

    // Flag to prevent race conditions during cleanup
    const isCleaningUpRef = useRef(false);

    // Stable keys for dependency comparison
    const columnsKey = useMemo(() => [...columns].sort().join(","), [columns]);
    const filterKey = useMemo(() => JSON.stringify(filterValues), [filterValues]);

    // Track previous column item counts to detect which column changed
    const prevColumnItemCountsRef = useRef<Record<string, number>>(columnItemCounts);

    // Version counter to trigger full re-subscription when params change (not just load-more)
    const [subscriptionVersion, setSubscriptionVersion] = useState(0);

    // Trigger full re-subscription when key params change
    useEffect(() => {
        setSubscriptionVersion(v => v + 1);
    }, [columnsKey, resolvedPath, columnProperty, orderProperty, searchString, filterKey, pageSize]);

    // Cleanup subscriptions on unmount
    useEffect(() => {
        return () => {
            isCleaningUpRef.current = true;
            Object.values(unsubscribersRef.current).forEach(unsub => unsub?.());
            unsubscribersRef.current = {};
        };
    }, []);

    // Helper function to subscribe to a single column - uses refs to avoid dependency issues
    const subscribeToColumn = useCallback((column: string, itemCount: number) => {
        // Skip if we're in the middle of cleanup
        if (isCleaningUpRef.current) return;

        const currentDataSource = dataSourceRef.current;
        const currentCollection = collectionRef.current;
        const currentContext = contextRef.current;
        const currentFilterValues = filterValuesRef.current;
        const currentColumnProperty = columnPropertyRef.current;
        const currentOrderProperty = orderPropertyRef.current;
        const currentSearchString = searchStringRef.current;
        const currentResolvedPath = resolvedPathRef.current;

        // Build filter for this column
        const columnFilter: FilterValues<string> = {
            ...currentFilterValues,
            [currentColumnProperty]: ["==", column]
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
            // Skip updates if we're cleaning up
            if (isCleaningUpRef.current) return;

            // When text search is active, the data source returns ALL matching entities
            // regardless of the column filter. We need to filter in memory to only show
            // entities that belong to this specific column.
            let processed = currentSearchString
                ? entities.filter(e => e.values?.[currentColumnProperty] === column)
                : entities;

            // Apply onFetch callbacks if any
            if (currentCollection.callbacks?.onFetch) {
                try {
                    processed = await Promise.all(
                        processed.map(entity =>
                            currentCollection.callbacks!.onFetch!({
                                collection: currentCollection,
                                path: currentResolvedPath,
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
            // Skip error handling if we're cleaning up
            if (isCleaningUpRef.current) return;

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
                path: currentResolvedPath,
                collection: currentCollection,
                onUpdate,
                onError,
                searchString: currentSearchString,
                filter: columnFilter,
                limit: itemCount,
                startAfter: undefined,
                orderBy: currentOrderProperty,
                order: currentOrderProperty ? "asc" : undefined
            });
            unsubscribersRef.current[column] = unsubscribe;
        } else {
            currentDataSource.fetchCollection<M>({
                path: currentResolvedPath,
                collection: currentCollection,
                searchString: currentSearchString,
                filter: columnFilter,
                limit: itemCount,
                startAfter: undefined,
                orderBy: currentOrderProperty,
                order: currentOrderProperty ? "asc" : undefined
            })
                .then(onUpdate)
                .catch(onError);
        }
    }, []); // No dependencies - uses refs for all values

    // Main effect for all column subscriptions - runs when subscriptionVersion changes (i.e., key params change)
    useEffect(() => {
        // Mark that we're setting up new subscriptions
        isCleaningUpRef.current = false;

        // Clean up all existing subscriptions synchronously
        const existingUnsubscribers = { ...unsubscribersRef.current };
        unsubscribersRef.current = {};
        Object.values(existingUnsubscribers).forEach(unsub => {
            try {
                unsub?.();
            } catch (e) {
                // Ignore cleanup errors
            }
        });

        const currentDataSource = dataSourceRef.current;
        const currentCollection = collectionRef.current;
        const currentFilterValues = filterValuesRef.current;
        const currentColumnProperty = columnPropertyRef.current;
        const currentSearchString = searchStringRef.current;
        const currentResolvedPath = resolvedPathRef.current;
        const currentColumns = columns;
        const currentColumnItemCounts = columnItemCounts;

        // Small delay to ensure Firestore has cleaned up previous listeners
        const timeoutId = setTimeout(() => {
            if (isCleaningUpRef.current) return;

            currentColumns.forEach(column => {
                const itemCount = currentColumnItemCounts[column] ?? pageSize;
                subscribeToColumn(column, itemCount);

                // Count query for column (for display in column header)
                if (currentDataSource.countEntities) {
                    const columnFilter: FilterValues<string> = {
                        ...currentFilterValues,
                        [currentColumnProperty]: ["==", column]
                    };
                    currentDataSource.countEntities({
                        path: currentResolvedPath,
                        collection: currentCollection,
                        filter: columnFilter,
                        searchString: currentSearchString
                    }).then(count => {
                        if (isCleaningUpRef.current) return;
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

            // Update the ref after subscribing all
            prevColumnItemCountsRef.current = { ...currentColumnItemCounts };
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            isCleaningUpRef.current = true;
            const unsubscribers = { ...unsubscribersRef.current };
            unsubscribersRef.current = {};
            Object.values(unsubscribers).forEach(unsub => {
                try {
                    unsub?.();
                } catch (e) {
                    // Ignore cleanup errors
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subscriptionVersion, subscribeToColumn, pageSize]);

    // Track which subscription version last updated the counts
    const lastProcessedVersionRef = useRef(subscriptionVersion);

    // Separate effect to handle individual column load-more WITHOUT triggering full re-subscription
    useEffect(() => {
        // If subscriptionVersion changed, the main effect will handle everything
        // Skip this effect to avoid race conditions
        if (subscriptionVersion !== lastProcessedVersionRef.current) {
            lastProcessedVersionRef.current = subscriptionVersion;
            prevColumnItemCountsRef.current = { ...columnItemCounts };
            return;
        }

        const prevCounts = prevColumnItemCountsRef.current;

        columns.forEach(column => {
            const prevCount = prevCounts[column] ?? pageSize;
            const newCount = columnItemCounts[column] ?? pageSize;

            // Only re-subscribe if this specific column's count increased (load more)
            if (newCount > prevCount && !isCleaningUpRef.current) {
                // Unsubscribe only this column
                if (unsubscribersRef.current[column]) {
                    try {
                        unsubscribersRef.current[column]();
                    } catch (e) {
                        // Ignore cleanup errors  
                    }
                    delete unsubscribersRef.current[column];
                }
                // Re-subscribe with new limit after a small delay
                setTimeout(() => {
                    if (!isCleaningUpRef.current) {
                        subscribeToColumn(column, newCount);
                    }
                }, 0);
            }
        });

        // Update the ref
        prevColumnItemCountsRef.current = { ...columnItemCounts };
    }, [columnItemCounts, columns, pageSize, subscribeToColumn, subscriptionVersion]);

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
        columns.forEach(col => {
            reset[col] = pageSize;
        });
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

    // Optimistic update for column counts when deleting items
    const decrementColumnCounts = useCallback((columnDeltas: Record<COLUMN, number>) => {
        setColumnData(prev => {
            const updated = { ...prev };

            for (const [column, delta] of Object.entries(columnDeltas) as [COLUMN, number][]) {
                if (updated[column]?.totalCount !== undefined) {
                    updated[column] = {
                        ...updated[column],
                        totalCount: Math.max(0, (updated[column].totalCount ?? 0) - delta)
                    };
                }
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
        decrementColumnCounts,
        loading,
        error
    };
}
