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
import { Typography } from "@firecms/ui";
import {
    getPropertyInPath,
    resolveCollection,
    resolveEnumValues
} from "../../util";
import { saveEntityWithCallbacks, useAuthController, useCustomizationController, useDataSource, useFireCMSContext } from "../../hooks";
import { SaveEntityProps } from "../../types/datasource";
import { setIn } from "@firecms/formex";

export type EntityCollectionBoardViewProps<M extends Record<string, any> = any> = {
    collection: EntityCollection<M>;
    tableController: EntityTableController<M>;
    /**
     * Full path to the collection (for plugin callbacks)
     */
    fullPath: string;
    /**
     * Parent collection IDs (for plugin callbacks)
     */
    parentCollectionIds?: string[];
    /**
     * The property key to use for Kanban board columns.
     * Must be a string property with enumValues defined.
     */
    columnProperty: string;
    onEntityClick?: (entity: Entity<M>) => void;
    selectionController?: SelectionController<M>;
    selectionEnabled?: boolean;
    highlightedEntities?: Entity<M>[];
    emptyComponent?: React.ReactNode;
};

/**
 * Kanban board view for displaying entities grouped by a string enum property.
 * Entities can be dragged between columns to update the property value.
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
    const plugins = customizationController.plugins ?? [];

    const {
        data,
        dataLoading,
        noMoreToLoad,
        dataLoadingError
    } = tableController;

    // Get itemsPerColumn from collection.kanban config
    const itemsPerColumn = collection.kanban?.itemsPerColumn ?? 50;

    // Resolve collection to get the property with enumValues
    const resolvedCollection = useMemo(() => resolveCollection({
        collection,
        path: collection.path,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    }), [collection, customizationController.propertyConfigs, authController]);

    // Get columns from the property's enumValues
    const { enumColumns, columnLabels } = useMemo(() => {
        const property = getPropertyInPath(resolvedCollection.properties, columnProperty);
        // Check if property exists and is a string property with enumValues
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

    // Determine columns order - use local state if user reordered, otherwise collection config
    const [localColumnsOrder, setLocalColumnsOrder] = useState<string[]>(() => {
        // Start with collection config, fallback to enum order
        const configOrder = collection.kanban?.columnsOrder;
        if (configOrder && configOrder.length > 0) {
            const validConfigOrder = configOrder.filter(c => enumColumns.includes(c));
            const missingColumns = enumColumns.filter(c => !validConfigOrder.includes(c));
            return [...validConfigOrder, ...missingColumns];
        }
        return enumColumns;
    });

    // Update local columns order when enumColumns change (e.g., new enum values added)
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
            // User has reordered, just add any missing columns
            const missingColumns = enumColumns.filter(c => !localColumnsOrder.includes(c));
            if (missingColumns.length > 0) {
                setLocalColumnsOrder(prev => [...prev, ...missingColumns]);
            }
        }
    }, [enumColumns, collection.kanban?.columnsOrder, hasUserReordered]);

    // Use localColumnsOrder directly - it's the source of truth
    const columns = localColumnsOrder;

    // Check if any plugin provides onKanbanColumnsReorder (enables column reordering)
    const allowColumnReorder = useMemo(() => {
        return plugins.some(plugin => plugin.collectionView?.onKanbanColumnsReorder);
    }, [plugins]);

    // Handle column reorder
    const handleColumnReorder = useCallback((newColumns: string[]) => {
        // Mark that user has reordered, so we don't override with props
        setHasUserReordered(true);
        // Update local state for immediate UI feedback
        setLocalColumnsOrder(newColumns);

        // Call each plugin's onKanbanColumnsReorder callback
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

    // Convert entities to board items and limit per column
    const boardItems: BoardItem<M>[] = useMemo(() => {
        return data.map(entity => ({
            id: entity.id,
            entity
        }));
    }, [data]);

    // Group items by column for pagination tracking
    const itemsByColumn = useMemo(() => {
        const grouped: Record<string, BoardItem<M>[]> = {};
        columns.forEach(col => {
            grouped[col] = [];
        });

        boardItems.forEach(item => {
            const value = item.entity.values?.[columnProperty];
            const col = value && columns.includes(String(value)) ? String(value) : columns[0];
            if (grouped[col]) {
                grouped[col].push(item);
            }
        });

        return grouped;
    }, [boardItems, columns, columnProperty]);

    // Create column loading state (limited to itemsPerColumn)
    const columnLoadingState: ColumnLoadingState = useMemo(() => {
        const state: ColumnLoadingState = {};
        columns.forEach(col => {
            const columnItems = itemsByColumn[col] || [];
            state[col] = {
                loading: dataLoading,
                hasMore: columnItems.length >= itemsPerColumn,
                itemCount: columnItems.length
            };
        });
        return state;
    }, [columns, itemsByColumn, dataLoading, itemsPerColumn]);

    // Items limited to itemsPerColumn per column
    const limitedBoardItems = useMemo(() => {
        const limited: BoardItem<M>[] = [];
        const columnCounts: Record<string, number> = {};

        boardItems.forEach(item => {
            const value = item.entity.values?.[columnProperty];
            const col = value && columns.includes(String(value)) ? String(value) : columns[0];

            if (!columnCounts[col]) columnCounts[col] = 0;

            if (columnCounts[col] < itemsPerColumn) {
                limited.push(item);
                columnCounts[col]++;
            }
        });

        return limited;
    }, [boardItems, columns, columnProperty, itemsPerColumn]);

    // Assign items to columns based on their property value
    const assignColumn = useCallback((item: BoardItem<M>): string => {
        const value = item.entity.values?.[columnProperty];
        // If value is not in columns, assign to first column
        if (value && columns.includes(String(value))) {
            return String(value);
        }
        return columns[0] || "";
    }, [columnProperty, columns]);

    // Handle item reorder and column changes
    const handleItemsReorder = useCallback(async (
        items: BoardItem<M>[],
        moveInfo?: {
            itemId: string;
            sourceColumn: string;
            targetColumn: string;
        }
    ) => {
        if (moveInfo) {
            // An item was moved between columns - update the entity
            const entity = items.find(item => item.id === moveInfo.itemId)?.entity;
            if (entity) {
                const updatedValues = setIn({ ...entity.values }, columnProperty, moveInfo.targetColumn);

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
                        onSaveSuccess: () => {
                            // Entity saved successfully
                        },
                        onSaveFailure: (e: Error) => {
                            console.error("Failed to save entity after column change:", e);
                        },
                        onPreSaveHookError: (e: Error) => {
                            console.error("Pre-save hook error:", e);
                        }
                    });
                } catch (e) {
                    console.error("Error saving entity:", e);
                }
            }
        }
        // Note: We don't persist item order within columns currently
    }, [collection, columnProperty, context, dataSource]);

    const handleEntityClick = useCallback((entity: Entity<M>) => {
        onEntityClick?.(entity);
    }, [onEntityClick]);

    const handleSelectionChange = useCallback((entity: Entity<M>, selected: boolean) => {
        selectionController?.toggleEntitySelection(entity, selected);
    }, [selectionController]);

    const isEntitySelected = useCallback((entity: Entity<M>) => {
        return selectionController?.isEntitySelected(entity) ?? false;
    }, [selectionController]);

    // Create the ItemComponent with collection context
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

    // Show empty state
    if (!dataLoading && data.length === 0 && !dataLoadingError) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                {emptyComponent ?? (
                    <Typography variant="label" color="secondary">
                        No entries found
                    </Typography>
                )}
            </div>
        );
    }

    // Show error state
    if (dataLoadingError) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Typography className="text-red-500">
                    Error loading data: {dataLoadingError.message}
                </Typography>
            </div>
        );
    }

    // Show message if no columns configured
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
        <div className="flex-1 overflow-auto">
            <Board
                data={limitedBoardItems}
                columns={columns}
                columnLabels={columnLabels}
                assignColumn={assignColumn}
                allowColumnReorder={allowColumnReorder}
                onColumnReorder={handleColumnReorder}
                onItemsReorder={handleItemsReorder}
                ItemComponent={ItemComponent}
                columnLoadingState={columnLoadingState}
            />
        </div>
    );
}
