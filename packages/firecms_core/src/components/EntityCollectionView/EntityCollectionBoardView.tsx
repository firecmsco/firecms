import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Entity,
    EntityCollection,
    EntityTableController,
    EnumValueConfig,
    ResolvedStringProperty,
    SelectionController
} from "../../types";
import { Board } from "./Board";
import { BoardItem, BoardItemViewProps, ColumnLoadingState } from "./board_types";
import { EntityBoardCard } from "./EntityBoardCard";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, Typography } from "@firecms/ui";
import {
    getPropertyInPath,
    resolveCollection,
    resolveEnumValues
} from "../../util";
import { saveEntityWithCallbacks, useAuthController, useCustomizationController, useDataSource, useFireCMSContext, useSideEntityController } from "../../hooks";
import { SaveEntityProps } from "../../types/datasource";
import { setIn } from "@firecms/formex";

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
    const orderProperty = collection.orderProperty;

    // State for backfill dialog
    const [showBackfillDialog, setShowBackfillDialog] = useState(false);
    const [backfillLoading, setBackfillLoading] = useState(false);

    const resolvedCollection = useMemo(() => resolveCollection({
        collection,
        path: collection.path,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    }), [collection, customizationController.propertyConfigs, authController]);

    // Get columns from the property's enumValues
    const { enumColumns, columnLabels } = useMemo(() => {
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
        return { enumColumns: cols, columnLabels: labels };
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

    // Use tableController data directly
    const { data, dataLoading, dataLoadingError } = tableController;

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

    // Check if items need backfill (have no orderProperty values)
    const itemsNeedBackfill = useMemo(() => {
        if (!orderProperty || dataLoading) return false;
        return data.some((entity: Entity<M>) => {
            const orderValue = entity.values?.[orderProperty];
            return orderValue === undefined || orderValue === null;
        });
    }, [data, orderProperty, dataLoading]);

    // Convert entities to board items, sorted by orderProperty
    const boardItems: BoardItem<M>[] = useMemo(() => {
        const items = data.map((entity: Entity<M>) => ({
            id: entity.id,
            entity
        }));

        // Sort by orderProperty if configured
        if (orderProperty) {
            items.sort((a, b) => {
                const orderA = a.entity.values?.[orderProperty] ?? Infinity;
                const orderB = b.entity.values?.[orderProperty] ?? Infinity;
                return orderA - orderB;
            });
        }

        return items;
    }, [data, orderProperty]);

    // Group items by column for pagination tracking
    const itemsByColumn = useMemo(() => {
        const grouped: Record<string, BoardItem<M>[]> = {};
        columns.forEach(col => { grouped[col] = []; });
        boardItems.forEach(item => {
            const value = item.entity.values?.[columnProperty];
            const col = value && columns.includes(String(value)) ? String(value) : columns[0];
            if (grouped[col]) grouped[col].push(item);
        });
        return grouped;
    }, [boardItems, columns, columnProperty]);

    // Column loading state
    const columnLoadingState: ColumnLoadingState = useMemo(() => {
        const state: ColumnLoadingState = {};
        columns.forEach(col => {
            const columnItems = itemsByColumn[col] || [];
            state[col] = {
                loading: dataLoading,
                hasMore: false, // No pagination - all data loaded
                itemCount: columnItems.length
            };
        });
        return state;
    }, [columns, itemsByColumn, dataLoading]);

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
        if (!orderProperty) return;
        setBackfillLoading(true);

        try {
            // Group entities by column and assign sequential order values
            const updates: Promise<void>[] = [];

            columns.forEach(col => {
                const columnEntities = data.filter((entity: Entity<M>) => {
                    const value = entity.values?.[columnProperty];
                    return String(value) === col;
                });

                columnEntities.forEach((entity: Entity<M>, index: number) => {
                    const currentOrder = entity.values?.[orderProperty];
                    if (currentOrder === undefined || currentOrder === null) {
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
                                onSaveSuccess: () => { },
                                onSaveFailure: (e) => console.error("Backfill save failed:", e),
                                onPreSaveHookError: (e) => console.error("Backfill pre-save error:", e)
                            }).then(() => { })
                        );
                    }
                });
            });

            await Promise.all(updates);
            setShowBackfillDialog(false);
        } catch (e) {
            console.error("Backfill error:", e);
        } finally {
            setBackfillLoading(false);
        }
    }, [data, columns, columnProperty, orderProperty, collection, dataSource, context]);

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

    // Empty state
    if (!dataLoading && data.length === 0 && !hasError) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                {emptyComponent ?? (
                    <Typography variant="label" color="secondary">No entries found</Typography>
                )}
            </div>
        );
    }

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
            {hasError && data.length === 0 && (
                <div className="flex items-center gap-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                    <Typography variant="body2" className="text-red-700 dark:text-red-300 flex-1">
                        <strong>Error loading data:</strong>{" "}
                        {indexUrl
                            ? "A Firestore index is required for this query."
                            : errorMessage}
                    </Typography>
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
                    assignColumn={assignColumn}
                    allowColumnReorder={allowColumnReorder}
                    onColumnReorder={handleColumnReorder}
                    onItemsReorder={handleItemsReorder}
                    ItemComponent={ItemComponent}
                    columnLoadingState={columnLoadingState}
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
