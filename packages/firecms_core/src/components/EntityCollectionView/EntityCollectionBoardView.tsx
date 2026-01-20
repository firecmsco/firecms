import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Entity,
    EntityCollection,
    EntityTableController,
    EnumValueConfig,
    FilterValues,
    ResolvedStringProperty,
    SelectionController
} from "../../types";
import { Board } from "./Board";
import { BoardItem, BoardItemViewProps, ColumnLoadingState } from "./board_types";
import { EntityBoardCard } from "./EntityBoardCard";
import { Button, ChipColorKey, ChipColorScheme, CircularProgress, Dialog, DialogActions, DialogContent, getColorSchemeForSeed, IconButton, RefreshIcon, Tooltip, Typography } from "@firecms/ui";
import {
    getPropertyInPath,
    resolveCollection,
    resolveEnumValues
} from "../../util";
import { saveEntityWithCallbacks, useAuthController, useCustomizationController, useDataSource, useFireCMSContext, useSideEntityController } from "../../hooks";
import { SaveEntityProps } from "../../types/datasource";
import { setIn } from "@firecms/formex";
import { useBoardDataController } from "./useBoardDataController";

export type EntityCollectionBoardViewProps<M extends Record<string, any> = any> = {
    collection: EntityCollection<M>;
    tableController: EntityTableController<M>;
    fullPath: string;
    parentCollectionIds?: string[];
    columnProperty: string;
    onEntityClick?: (entity: Entity<M>) => void;
    selectionController?: SelectionController<M>;
    selectionEnabled?: boolean;
    highlightedEntities?: Entity<M>[];
    emptyComponent?: React.ReactNode;
};

/**
 * Kanban board view for displaying entities grouped by a string enum property.
 */
export function EntityCollectionBoardView<M extends Record<string, any> = any>({
    collection,
    tableController,
    fullPath,
    parentCollectionIds = [],
    columnProperty,
    onEntityClick,
    selectionController,
    selectionEnabled = true,
    highlightedEntities,
    emptyComponent
}: EntityCollectionBoardViewProps<M>) {
    const authController = useAuthController();
    const customizationController = useCustomizationController();
    const context = useFireCMSContext();
    const dataSource = useDataSource(collection);
    const sideEntityController = useSideEntityController();
    const plugins = customizationController.plugins ?? [];

    // State for backfill dialog
    const [showBackfillDialog, setShowBackfillDialog] = useState(false);
    const [backfillLoading, setBackfillLoading] = useState(false);

    const resolvedCollection = useMemo(() => resolveCollection({
        collection,
        path: collection.path,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    }), [collection, customizationController.propertyConfigs, authController]);

    // Get orderProperty from collection config, but validate it exists as a real property
    const rawOrderProperty = collection.orderProperty;
    const orderProperty = useMemo(() => {
        if (!rawOrderProperty) return undefined;
        // Check if the property actually exists in the resolved collection
        const property = getPropertyInPath(resolvedCollection.properties, rawOrderProperty);
        if (!property) {
            console.warn(`orderProperty "${rawOrderProperty}" is defined but does not exist in the collection properties. Treating as unconfigured.`);
            return undefined;
        }
        return rawOrderProperty;
    }, [rawOrderProperty, resolvedCollection.properties]);

    // Get columns from the property's enumValues
    const { enumColumns, columnLabels, columnColors } = useMemo(() => {
        const property = getPropertyInPath(resolvedCollection.properties, columnProperty);
        if (!property || !('dataType' in property) || property.dataType !== "string") {
            return { enumColumns: [] as string[], columnLabels: {} as Record<string, string> };
        }
        const stringProperty = property as ResolvedStringProperty;
        if (!stringProperty.enumValues) {
            return { enumColumns: [] as string[], columnLabels: {} as Record<string, string> };
        }
        const enumValues = resolveEnumValues(stringProperty.enumValues);
        if (!enumValues) {
            return { enumColumns: [] as string[], columnLabels: {} as Record<string, string> };
        }
        const cols = enumValues.map((ev: EnumValueConfig) => String(ev.id));
        const labels = enumValues.reduce((acc: Record<string, string>, ev: EnumValueConfig) => {
            acc[String(ev.id)] = ev.label;
            return acc;
        }, {});
        const colors = enumValues.reduce((acc: Record<string, ChipColorKey | ChipColorScheme | undefined>, ev: EnumValueConfig) => {
            acc[String(ev.id)] = ev.color ?? getColorSchemeForSeed(String(ev.id));
            return acc;
        }, {});
        return { enumColumns: cols, columnLabels: labels, columnColors: colors };
    }, [resolvedCollection, columnProperty]);

    // Track if user has manually reordered columns in this session
    const [hasUserReordered, setHasUserReordered] = useState(false);
    const [localColumnsOrder, setLocalColumnsOrder] = useState<string[]>(() => {
        const configOrder = collection.kanban?.columnsOrder;
        if (configOrder && configOrder.length > 0) {
            const validConfigOrder = configOrder.filter(c => enumColumns.includes(c));
            const missingColumns = enumColumns.filter(c => !validConfigOrder.includes(c));
            return [...validConfigOrder, ...missingColumns];
        }
        return enumColumns;
    });

    useEffect(() => {
        if (!hasUserReordered) {
            const configOrder = collection.kanban?.columnsOrder;
            if (configOrder && configOrder.length > 0) {
                const validConfigOrder = configOrder.filter(c => enumColumns.includes(c));
                const missingColumns = enumColumns.filter(c => !validConfigOrder.includes(c));
                setLocalColumnsOrder([...validConfigOrder, ...missingColumns]);
            } else {
                setLocalColumnsOrder(enumColumns);
            }
        } else {
            const missingColumns = enumColumns.filter(c => !localColumnsOrder.includes(c));
            if (missingColumns.length > 0) {
                setLocalColumnsOrder(prev => [...prev, ...missingColumns]);
            }
        }
    }, [enumColumns, collection.kanban?.columnsOrder, hasUserReordered]);

    const columns = localColumnsOrder;

    // Use the new per-column data controller
    const boardDataController = useBoardDataController<M>({
        fullPath,
        collection,
        columnProperty,
        columns,
        orderProperty,
        pageSize: 30,
        searchString: tableController.searchString,
        filterValues: tableController.filterValues
    });

    // Aggregate loading and error state
    const dataLoading = boardDataController.loading;
    const dataLoadingError = boardDataController.error;

    // Build all entities from all columns for operations that need the full list
    const allEntities = useMemo(() => {
        const entities: Entity<M>[] = [];
        columns.forEach(col => {
            const colData = boardDataController.columnData[col];
            if (colData?.entities) {
                entities.push(...colData.entities);
            }
        });
        return entities;
    }, [boardDataController.columnData, columns]);

    const allowColumnReorder = useMemo(() => {
        return plugins.some(plugin => plugin.collectionView?.onKanbanColumnsReorder);
    }, [plugins]);

    const handleColumnReorder = useCallback((newColumns: string[]) => {
        setHasUserReordered(true);
        setLocalColumnsOrder(newColumns);
        plugins
            .filter(plugin => plugin.collectionView?.onKanbanColumnsReorder)
            .forEach(plugin => {
                plugin.collectionView!.onKanbanColumnsReorder!({
                    fullPath,
                    parentCollectionIds,
                    collection,
                    kanbanColumnProperty: columnProperty,
                    newColumnsOrder: newColumns
                });
            });
    }, [plugins, fullPath, parentCollectionIds, collection, columnProperty]);

    // Collection-level count queries to detect missing order property
    // Just TWO counts: total and ordered (for the entire collection, not per column)
    const [missingOrderCount, setMissingOrderCount] = useState<number>(0);

    // Use refs for objects that shouldn't trigger re-runs
    const dataSourceRef = useRef(dataSource);
    const collectionRef = useRef(collection);
    dataSourceRef.current = dataSource;
    collectionRef.current = collection;

    useEffect(() => {
        const currentDataSource = dataSourceRef.current;
        const currentCollection = collectionRef.current;

        if (!orderProperty || !currentDataSource.countEntities) {
            setMissingOrderCount(0);
            return;
        }

        // Count 1: Total documents in collection
        // Count 2: Documents with orderProperty != null
        let totalCount = 0;
        let orderedCount = 0;
        let completed = 0;

        currentDataSource.countEntities({
            path: fullPath,
            collection: currentCollection
        }).then(count => {
            totalCount = count;
            completed++;
            if (completed === 2) {
                setMissingOrderCount(Math.max(0, totalCount - orderedCount));
            }
        }).catch(e => console.warn("Failed to get total count:", e));

        currentDataSource.countEntities({
            path: fullPath,
            collection: currentCollection,
            filter: { [orderProperty]: ["!=", null] } as FilterValues<string>
        }).then(count => {
            orderedCount = count;
            completed++;
            if (completed === 2) {
                setMissingOrderCount(Math.max(0, totalCount - orderedCount));
            }
        }).catch(e => console.warn("Failed to get ordered count:", e));
    }, [orderProperty, fullPath]); // Only re-run when these primitives change

    // Check if items need backfill (have no orderProperty values)
    const itemsNeedBackfill = useMemo(() => {
        if (!orderProperty || dataLoading) return false;
        // Use collection-level count detection
        if (missingOrderCount > 0) return true;
        // Fallback to checking loaded entities
        return allEntities.some((entity: Entity<M>) => {
            const orderValue = entity.values?.[orderProperty];
            return orderValue === undefined || orderValue === null;
        });
    }, [allEntities, orderProperty, dataLoading, missingOrderCount]);

    // Convert entities to board items per column (data already sorted by orderProperty from controller)
    const boardItems: BoardItem<M>[] = useMemo(() => {
        return allEntities.map((entity: Entity<M>) => ({
            id: entity.id,
            entity
        }));
    }, [allEntities]);

    // Column loading state from the board data controller
    const columnLoadingState: ColumnLoadingState = useMemo(() => {
        const state: ColumnLoadingState = {};
        columns.forEach(col => {
            const colData = boardDataController.columnData[col];
            state[col] = {
                loading: colData?.loading ?? true,
                hasMore: colData?.hasMore ?? false,
                itemCount: colData?.entities?.length ?? 0,
                totalCount: colData?.totalCount
            };
        });
        return state;
    }, [columns, boardDataController.columnData]);

    const assignColumn = useCallback((item: BoardItem<M>): string => {
        const value = item.entity.values?.[columnProperty];
        if (value && columns.includes(String(value))) return String(value);
        return columns[0] || "";
    }, [columnProperty, columns]);

    // Calculate new order value using fractional indexing
    const calculateNewOrder = useCallback((
        items: BoardItem<M>[],
        movedItemId: string,
        targetColumn: string
    ): number => {
        // Get items in target column (sorted by order)
        const columnItems = items
            .filter(item => {
                const col = item.entity.values?.[columnProperty];
                return col === targetColumn || (item.id === movedItemId);
            })
            .filter(item => item.id !== movedItemId)
            .sort((a, b) => {
                const orderA = a.entity.values?.[orderProperty!] ?? 0;
                const orderB = b.entity.values?.[orderProperty!] ?? 0;
                return orderA - orderB;
            });

        // Find the moved item's new position in the column
        const movedItemIndex = items.findIndex(item => item.id === movedItemId);
        const movedItem = items[movedItemIndex];

        if (!movedItem) return 0;

        // Find items before and after in the target column
        let prevOrder: number | null = null;
        let nextOrder: number | null = null;

        // Simple approach: find the item at the new position
        const newColumnItems = items.filter(item => {
            if (item.id === movedItemId) return true;
            const col = item.entity.values?.[columnProperty];
            return col === targetColumn;
        });

        const newIndex = newColumnItems.findIndex(item => item.id === movedItemId);

        if (newIndex > 0) {
            const prevItem = newColumnItems[newIndex - 1];
            prevOrder = prevItem?.entity.values?.[orderProperty!] ?? null;
        }
        if (newIndex < newColumnItems.length - 1) {
            const nextItem = newColumnItems[newIndex + 1];
            nextOrder = nextItem?.entity.values?.[orderProperty!] ?? null;
        }

        // Calculate new order using fractional indexing
        if (prevOrder !== null && nextOrder !== null) {
            return (prevOrder + nextOrder) / 2;
        } else if (prevOrder !== null) {
            return prevOrder + 1;
        } else if (nextOrder !== null) {
            return nextOrder - 1;
        }
        return 0;
    }, [columnProperty, orderProperty]);

    // Handle item reorder and column changes
    const handleItemsReorder = useCallback(async (
        items: BoardItem<M>[],
        moveInfo?: { itemId: string; sourceColumn: string; targetColumn: string; }
    ) => {
        if (!orderProperty) return;

        const entity = items.find(item => item.id === moveInfo?.itemId)?.entity;
        if (!entity) return;

        // Calculate new order value
        const newOrder = calculateNewOrder(items, moveInfo?.itemId ?? "", moveInfo?.targetColumn ?? "");

        // Build updated values
        let updatedValues = { ...entity.values };
        updatedValues = setIn(updatedValues, orderProperty, newOrder);

        // Also update column if it changed
        if (moveInfo && moveInfo.sourceColumn !== moveInfo.targetColumn) {
            updatedValues = setIn(updatedValues, columnProperty, moveInfo.targetColumn);
        }

        const saveProps: SaveEntityProps = {
            path: entity.path,
            entityId: entity.id,
            values: updatedValues as M,
            previousValues: entity.values,
            collection,
            status: "existing"
        };

        try {
            await saveEntityWithCallbacks({
                ...saveProps,
                collection,
                dataSource,
                context,
                onSaveSuccess: () => { },
                onSaveFailure: (e: Error) => console.error("Failed to save entity after reorder:", e),
                onPreSaveHookError: (e: Error) => console.error("Pre-save hook error:", e)
            });
        } catch (e) {
            console.error("Error saving entity:", e);
        }
    }, [collection, columnProperty, orderProperty, context, dataSource, calculateNewOrder]);

    // Backfill order values for all entities
    const handleBackfill = useCallback(async () => {
        console.log("handleBackfill called", { orderProperty });
        if (!orderProperty) {
            console.log("No orderProperty, returning");
            return;
        }
        setBackfillLoading(true);

        try {
            // Fetch ALL documents from collection (not relying on loaded entities)
            console.log("Fetching all documents from collection...");
            const allDocs = await dataSource.fetchCollection<M>({
                path: fullPath,
                collection,
                limit: 10000 // Fetch all
            });
            console.log(`Fetched ${allDocs.length} documents`);

            // Find entities missing order property
            const entitiesToUpdate = allDocs.filter((entity: Entity<M>) => {
                const orderValue = entity.values?.[orderProperty];
                return orderValue === undefined || orderValue === null;
            });
            console.log(`${entitiesToUpdate.length} entities need order values`);

            // Assign sequential order values
            const updates: Promise<void>[] = [];
            entitiesToUpdate.forEach((entity: Entity<M>, index: number) => {
                console.log(`Updating entity ${entity.id} with order ${index}`);
                const updatedValues = setIn({ ...entity.values }, orderProperty, index);

                const saveProps: SaveEntityProps = {
                    path: entity.path,
                    entityId: entity.id,
                    values: updatedValues as M,
                    previousValues: entity.values,
                    collection,
                    status: "existing"
                };

                updates.push(
                    saveEntityWithCallbacks({
                        ...saveProps,
                        collection,
                        dataSource,
                        context,
                        onSaveSuccess: () => { console.log(`Saved entity ${entity.id}`); },
                        onSaveFailure: (e) => console.error("Backfill save failed:", e),
                        onPreSaveHookError: (e) => console.error("Backfill pre-save error:", e)
                    }).then(() => { })
                );
            });

            console.log(`Total updates to run: ${updates.length}`);
            await Promise.all(updates);
            console.log("All updates complete");
            setShowBackfillDialog(false);

            // Reset missing count to hide banner
            setMissingOrderCount(0);

            // Refresh the board data
            boardDataController.refreshAll();
        } catch (e) {
            console.error("Backfill error:", e);
        } finally {
            setBackfillLoading(false);
        }
    }, [orderProperty, fullPath, collection, dataSource, context, boardDataController]);

    const handleEntityClick = useCallback((entity: Entity<M>) => {
        onEntityClick?.(entity);
    }, [onEntityClick]);

    const handleSelectionChange = useCallback((entity: Entity<M>, selected: boolean) => {
        selectionController?.toggleEntitySelection(entity, selected);
    }, [selectionController]);

    const isEntitySelected = useCallback((entity: Entity<M>) => {
        return selectionController?.isEntitySelected(entity) ?? false;
    }, [selectionController]);

    const ItemComponent = useCallback((props: BoardItemViewProps<M>) => {
        return (
            <EntityBoardCard
                {...props}
                collection={collection}
                onClick={handleEntityClick}
                selected={isEntitySelected(props.item.entity)}
                onSelectionChange={handleSelectionChange}
                selectionEnabled={selectionEnabled}
            />
        );
    }, [collection, handleEntityClick, isEntitySelected, handleSelectionChange, selectionEnabled]);

    // Get KanbanSetupComponent from plugins
    const KanbanSetupComponent = useMemo(() => {
        for (const plugin of plugins) {
            if (plugin.collectionView?.KanbanSetupComponent) {
                return plugin.collectionView.KanbanSetupComponent;
            }
        }
        return null;
    }, [plugins]);

    // Get AddKanbanColumnComponent from plugins
    const AddKanbanColumnComponent = useMemo(() => {
        for (const plugin of plugins) {
            if (plugin.collectionView?.AddKanbanColumnComponent) {
                return plugin.collectionView.AddKanbanColumnComponent;
            }
        }
        return null;
    }, [plugins]);

    // Check for loading error
    const hasError = Boolean(dataLoadingError);
    const errorMessage = dataLoadingError?.message || "";
    const indexUrl = errorMessage.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)?.[0];

    // Error: columnProperty not configured or invalid
    if (!columnProperty || enumColumns.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <Typography variant="h6">
                    Kanban view needs configuration
                </Typography>
                <Typography variant="body2" color="secondary" className="text-center max-w-md">
                    {!columnProperty
                        ? "Please select a column property to group entities into columns."
                        : "The selected column property doesn't have enum values or doesn't exist."
                    }
                </Typography>
                {KanbanSetupComponent && (
                    <KanbanSetupComponent
                        collection={collection}
                        fullPath={fullPath}
                        parentCollectionIds={parentCollectionIds}
                    />
                )}
            </div>
        );
    }

    // Error: orderProperty not configured
    if (!orderProperty) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <Typography variant="h6">
                    Kanban view requires an order property
                </Typography>
                <Typography variant="body2" color="secondary" className="text-center max-w-md">
                    Please configure the <code className="bg-surface-200 dark:bg-surface-700 px-1 rounded">orderProperty</code> in
                    your collection config. This should be a numeric property used to persist the order of items.
                </Typography>
                {KanbanSetupComponent && (
                    <KanbanSetupComponent
                        collection={collection}
                        fullPath={fullPath}
                        parentCollectionIds={parentCollectionIds}
                    />
                )}
            </div>
        );
    }

    // Note: Empty state is not shown for Kanban view - we show the board with empty columns instead
    // The emptyComponent is handled per-column in BoardColumn

    // No columns
    if (columns.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Typography variant="label" color="secondary">
                    No enum values configured for property "{columnProperty}"
                </Typography>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Error banner - only show when no data loaded */}
            {hasError && allEntities.length === 0 && (
                <div className="flex items-center gap-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                    <Typography variant="body2" className="text-red-700 dark:text-red-300 flex-1">
                        <strong>Error loading data:</strong>{" "}
                        {indexUrl
                            ? "A Firestore index is required for this query."
                            : errorMessage}
                    </Typography>
                    <Tooltip title="Refresh data">
                        <IconButton
                            size="small"
                            onClick={() => boardDataController.refreshAll()}
                        >
                            <RefreshIcon size="small" />
                        </IconButton>
                    </Tooltip>
                    {indexUrl && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => window.open(indexUrl, "_blank")}
                        >
                            Create Index
                        </Button>
                    )}
                </div>
            )}

            {/* Backfill info bar - non-blocking */}
            {itemsNeedBackfill && !dataLoading && (
                <div className="flex items-center justify-between gap-4 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                    <Typography variant="body2" color="secondary">
                        Some items don't have order values. Initialize to enable drag-and-drop reordering.
                    </Typography>
                    <Button
                        size="small"
                        variant="text"
                        onClick={() => setShowBackfillDialog(true)}
                    >
                        Initialize Order
                    </Button>
                </div>
            )}

            {/* Main board */}
            <div className="flex-1 overflow-auto">
                <Board
                    data={boardItems}
                    columns={columns}
                    columnLabels={columnLabels}
                    columnColors={columnColors}
                    assignColumn={assignColumn}
                    allowColumnReorder={allowColumnReorder}
                    onColumnReorder={handleColumnReorder}
                    onItemsReorder={handleItemsReorder}
                    ItemComponent={ItemComponent}
                    columnLoadingState={columnLoadingState}
                    onLoadMoreColumn={(column) => boardDataController.loadMoreColumn(column)}
                    onAddItemToColumn={(column) => {
                        sideEntityController.open({
                            path: fullPath,
                            collection,
                            entityId: undefined,
                            updateUrl: true,
                            formProps: {
                                initialDirtyValues: {
                                    [columnProperty]: column
                                } as Partial<M>
                            }
                        });
                    }}
                    AddColumnComponent={AddKanbanColumnComponent && (
                        <AddKanbanColumnComponent
                            collection={collection}
                            fullPath={fullPath}
                            parentCollectionIds={parentCollectionIds}
                            columnProperty={columnProperty}
                        />
                    )}
                />
            </div>

            {/* Backfill dialog */}
            <Dialog open={showBackfillDialog} onOpenChange={setShowBackfillDialog}>
                <DialogContent>
                    <Typography variant="h6" className="mb-4">Initialize Kanban Order</Typography>
                    <Typography variant="body2">
                        This will assign sequential order values to all items that don't have one.
                        Items will maintain their current order within each column.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={() => setShowBackfillDialog(false)} disabled={backfillLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleBackfill} disabled={backfillLoading}>
                        {backfillLoading ? <CircularProgress size="smallest" /> : "Initialize"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
