import type { EntityCollection } from "../../types/collections";
import type { Property } from "@rebasepro/types";import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Entity, EntityTableController, EnumValueConfig, FilterValues, SaveEntityProps, SelectionController } from "@rebasepro/types";
import { Board } from "./Board";
import { BoardItem, BoardItemViewProps, ColumnLoadingState } from "./board_types";
import { EntityBoardCard } from "./EntityBoardCard";
import {
    Button,
    ChipColorKey,
    ChipColorScheme,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    getColorSchemeForSeed,
    IconButton,
    RefreshIcon,
    Tooltip,
    Typography
} from "@rebasepro/ui";
import { resolveEnumValues } from "@rebasepro/common";
import { getPropertyInPath } from "@rebasepro/core";
import {
    saveEntityWithCallbacks,
    useAuthController,
    useCustomizationController,
    useData,
    useRebaseContext,
    useSideEntityController,
    useTranslation,
    useSlot
} from "@rebasepro/core";
import { useAnalyticsController } from "@rebasepro/core";
import { setIn } from "@rebasepro/formex";
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
    /** Called when entities are deleted - used for optimistic count updates */
    deletedEntities?: Entity<M>[];
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
    emptyComponent,
    deletedEntities
}: EntityCollectionBoardViewProps<M>) {
    const authController = useAuthController();
    const customizationController = useCustomizationController();
    const context = useRebaseContext();
    const dataClient = useData();
    const sideEntityController = useSideEntityController();
    const analyticsController = useAnalyticsController();
    const { t } = useTranslation();
    const plugins = customizationController.plugins ?? [];

    // State for backfill dialog
    const [showBackfillDialog, setShowBackfillDialog] = useState(false);
    const [backfillLoading, setBackfillLoading] = useState(false);

    // v4: use collection directly without resolving

    // Get orderProperty from collection config, but validate it exists as a real property
    const rawOrderProperty = collection.orderProperty;
    const orderProperty = useMemo(() => {
        if (!rawOrderProperty) return undefined;
        // Check if the property actually exists in the collection
        const property = getPropertyInPath(collection.properties, rawOrderProperty);
        if (!property) {
            console.warn(`orderProperty "${rawOrderProperty}" is defined but does not exist in the collection properties. Treating as unconfigured.`);
            return undefined;
        }
        return rawOrderProperty;
    }, [rawOrderProperty, collection.properties]);

    // Get columns from the property's enumValues
    const {
        enumColumns,
        columnLabels,
        columnColors
    } = useMemo(() => {
        const property = getPropertyInPath(collection.properties, columnProperty);
        if (!property || !("type" in property) || property.type !== "string") {
            return {
                enumColumns: [] as string[],
                columnLabels: {} as Record<string, string>
            };
        }
        const stringProperty = property;
        if (!stringProperty.enum) {
            return {
                enumColumns: [] as string[],
                columnLabels: {} as Record<string, string>
            };
        }
        const enumValues = resolveEnumValues(stringProperty.enum);
        if (!enumValues) {
            return {
                enumColumns: [] as string[],
                columnLabels: {} as Record<string, string>
            };
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
        return {
            enumColumns: cols,
            columnLabels: labels,
            columnColors: colors
        };
    }, [collection, columnProperty]);

    // Track if user has manually reordered columns in this session
    const [hasUserReordered, setHasUserReordered] = useState(false);
    // Column order is derived from the property's enumValues order
    // Local state tracks session reordering before it's persisted
    const [localColumnsOrder, setLocalColumnsOrder] = useState<string[]>(enumColumns);

    useEffect(() => {
        if (!hasUserReordered) {
            // Sync with enumColumns when property changes
            setLocalColumnsOrder(enumColumns);
        } else {
            // User has reordered - only add any missing columns
            const missingColumns = enumColumns.filter(c => !localColumnsOrder.includes(c));
            if (missingColumns.length > 0) {
                setLocalColumnsOrder(prev => [...prev, ...missingColumns]);
            }
        }
    }, [enumColumns, hasUserReordered]);

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

    // Track previously processed deleted entities to avoid double-counting
    const processedDeletedRef = useRef<Set<string>>(new Set());

    // Optimistic update for column counts when entities are deleted
    useEffect(() => {
        if (!deletedEntities || deletedEntities.length === 0) return;

        // Calculate column deltas from deleted entities
        const deltas: Record<string, number> = {};
        deletedEntities.forEach(entity => {
            // Skip if we've already processed this entity
            if (processedDeletedRef.current.has(String(entity.id))) return;
            processedDeletedRef.current.add(String(entity.id));

            const col = entity.values?.[columnProperty];
            if (col && typeof col === "string") {
                deltas[col] = (deltas[col] ?? 0) + 1;
            }
        });

        if (Object.keys(deltas).length > 0) {
            boardDataController.decrementColumnCounts(deltas);
        }
    }, [deletedEntities, columnProperty, boardDataController]);

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
        return plugins.some(plugin => plugin.hooks?.onKanbanColumnsReorder);
    }, [plugins]);

    const handleColumnReorder = useCallback((newColumns: string[]) => {
        analyticsController.onAnalyticsEvent?.("kanban_column_reorder", {
            path: fullPath,
            columnProperty
        });
        setHasUserReordered(true);
        setLocalColumnsOrder(newColumns);
        plugins
            .filter(plugin => plugin.hooks?.onKanbanColumnsReorder)
            .forEach(plugin => {
                plugin.hooks!.onKanbanColumnsReorder!({
                    fullPath,
                    parentCollectionIds,
                    collection,
                    kanbanColumnProperty: columnProperty,
                    newColumnsOrder: newColumns
                });
            });
    }, [plugins, fullPath, parentCollectionIds, collection, columnProperty, analyticsController]);

    // Collection-level count queries to detect missing order property
    // Just TWO counts: total and ordered (for the entire collection, not per column)
    const [missingOrderCount, setMissingOrderCount] = useState<number>(0);

    const dataClientRef = useRef(dataClient);
    const collectionRef = useRef(collection);
    dataClientRef.current = dataClient;
    collectionRef.current = collection;

    useEffect(() => {
        const currentDataClient = dataClientRef.current;
        const currentCollection = collectionRef.current;
        const accessor = currentDataClient.collection(fullPath);

        if (!orderProperty || !accessor.count) {
            setMissingOrderCount(0);
            return;
        }

        // Count 1: Total documents in collection
        // Count 2: Documents with orderProperty != null
        let totalCount = 0;
        let orderedCount = 0;
        let completed = 0;

        accessor.count().then(count => {
            totalCount = count;
            completed++;
            if (completed === 2) {
                setMissingOrderCount(Math.max(0, totalCount - orderedCount));
            }
        }).catch(e => console.warn("Failed to get total count:", e));

        accessor.count({
            where: { [orderProperty]: "neq.null" }
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

    // Create a lookup map of entity ID → column from boardDataController data
    // This ensures items stay in the column they were fetched for, not re-evaluated from entity.values
    const entityColumnMap = useMemo(() => {
        const map: Record<string, string> = {};
        columns.forEach(col => {
            const colData = boardDataController.columnData[col];
            if (colData?.entities) {
                colData.entities.forEach((entity: Entity<M>) => {
                    map[String(entity.id)] = col;
                });
            }
        });
        return map;
    }, [columns, boardDataController.columnData]);

    // Convert entities to board items per column (data already sorted by orderProperty from controller)
    const boardItems: BoardItem<M>[] = useMemo(() => {
        return allEntities.map((entity: Entity<M>) => ({
            id: String(entity.id),
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

    // Use the lookup map to assign columns - ensures items stay in the column they were fetched for
    const assignColumn = useCallback((item: BoardItem<M>): string => {
        const column = entityColumnMap[item.id];
        if (column) return column;
        // Fallback: read from entity values (for newly created items or edge cases)
        const value = item.entity.values?.[columnProperty];
        if (value && columns.includes(String(value))) return String(value);
        return columns[0] || "";
    }, [entityColumnMap, columnProperty, columns]);

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
        const entity = items.find(item => item.id === moveInfo?.itemId)?.entity;
        if (!entity) return;

        analyticsController.onAnalyticsEvent?.("kanban_card_moved", {
            path: fullPath,
            entityId: entity.id,
            sourceColumn: moveInfo?.sourceColumn,
            targetColumn: moveInfo?.targetColumn
        });

        const isColumnChange = moveInfo && moveInfo.sourceColumn !== moveInfo.targetColumn;

        // If no orderProperty and not a column change, nothing to do
        if (!orderProperty && !isColumnChange) return;

        // Optimistic update: update column counts immediately when moving between columns
        if (isColumnChange) {
            boardDataController.updateColumnCounts(moveInfo.sourceColumn, moveInfo.targetColumn);
        }

        // Build updated values
        let updatedValues = { ...entity.values };

        // Calculate and set new order value (only if orderProperty is configured)
        if (orderProperty) {
            const newOrder = calculateNewOrder(items, moveInfo?.itemId ?? "", moveInfo?.targetColumn ?? "");
            updatedValues = setIn(updatedValues, orderProperty, newOrder) as M;
        }

        // Update column if it changed
        if (isColumnChange) {
            updatedValues = setIn(updatedValues, columnProperty, moveInfo.targetColumn) as M;
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
                data: dataClient,
                context,
                afterSave: () => {
                },
                afterSaveError: (e: Error) => console.error("Failed to save entity after reorder:", e)
            });
        } catch (e) {
            console.error("Error saving entity:", e);
        }
    }, [collection, columnProperty, orderProperty, context, dataClient, calculateNewOrder, boardDataController, analyticsController, fullPath]);

    // Backfill order values for all entities
    const handleBackfill = useCallback(async () => {
        console.log("handleBackfill called", { orderProperty });
        if (!orderProperty) {
            console.log("No orderProperty, returning");
            return;
        }
        analyticsController.onAnalyticsEvent?.("kanban_backfill_order", {
            path: fullPath
        });
        setBackfillLoading(true);

        try {
            // Fetch ALL documents from collection (not relying on loaded entities)
            console.log("Fetching all documents from collection...");
            const allDocsRes = await dataClient.collection(fullPath).find({
                limit: 10000 // Fetch all
            });
            const allDocs = allDocsRes.data;
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
                        data: dataClient,
                        context,
                        afterSave: () => {
                            console.log(`Saved entity ${entity.id}`);
                        },
                        afterSaveError: (e) => console.error("Backfill save failed:", e)
                    }).then(() => {
                    })
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
    }, [orderProperty, fullPath, collection, dataClient, context, boardDataController, analyticsController]);

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

    // Get KanbanSetupComponent from plugin slots
    const kanbanSetupSlots = useSlot("kanban.setup", {
        collection,
        fullPath,
        parentCollectionIds
    });
    const KanbanSetupComponent = kanbanSetupSlots.length > 0 ? () => <>{kanbanSetupSlots[0]}</> : null;

    // Get AddKanbanColumnComponent from plugin slots
    const addKanbanColumnSlots = useSlot("kanban.add-column", {
        collection,
        fullPath,
        parentCollectionIds,
        columnProperty
    });
    const AddKanbanColumnComponent = addKanbanColumnSlots.length > 0 ? () => <>{addKanbanColumnSlots[0]}</> : null;

    // Check for loading error
    const hasError = Boolean(dataLoadingError);
    const errorMessage = dataLoadingError?.message || "";
    const indexUrl = errorMessage.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)?.[0];

    // Error: no enum properties available for Kanban columns
    if (!columnProperty || enumColumns.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <Typography variant="h6">
                    {t("kanban_view_not_available")}
                </Typography>
                <Typography variant="body2" color="secondary" className="text-center max-w-md">
                    {t("kanban_view_requires_enum")}
                </Typography>
                {kanbanSetupSlots.length > 0 && kanbanSetupSlots[0]}
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
                    {t("no_enum_values_configured", { property: columnProperty })}
                </Typography>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Error banner - only show when no data loaded */}
            {hasError && allEntities.length === 0 && (
                <div
                    className="flex items-center gap-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                    <Typography variant="body2" className="text-red-700 dark:text-red-300 flex-1">
                        <strong>Error:</strong>{" "}
                        {indexUrl
                            ? "A Firestore index is required for this query."
                            : errorMessage}
                    </Typography>
                    <Tooltip title={t("refresh_data")}>
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
                            variant="filled"
                            color="error"
                            onClick={() => window.open(indexUrl, "_blank")}
                        >
                            {t("create_index")}
                        </Button>
                    )}
                </div>
            )}

            {/* Backfill info bar - non-blocking */}
            {itemsNeedBackfill && !dataLoading && (
                <div
                    className="flex items-center justify-between gap-4 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                    <Typography variant="body2" color="secondary">
                        {t("items_need_backfill")}
                    </Typography>
                    <Button
                        size="small"
                        variant="text"
                        onClick={() => setShowBackfillDialog(true)}
                    >
                        {t("initialize")}
                    </Button>
                </div>
            )}

            {/* Main board */}
            <div className="flex-1 overflow-auto no-scrollbar">
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
                        analyticsController.onAnalyticsEvent?.("kanban_new_entity_in_column", {
                            path: fullPath,
                            column
                        });
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
                    AddColumnComponent={addKanbanColumnSlots.length > 0 ? addKanbanColumnSlots[0] : undefined}
                />
            </div>

            {/* Backfill dialog */}
            <Dialog open={showBackfillDialog} onOpenChange={setShowBackfillDialog}>
                <DialogContent>
                    <Typography variant="h6" className="mb-4">{t("initialize_kanban_order")}</Typography>
                    <Typography variant="body2">
                        {t("initialize_kanban_order_desc")}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={() => setShowBackfillDialog(false)} disabled={backfillLoading}>
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleBackfill} disabled={backfillLoading}>
                        {backfillLoading ? <CircularProgress size="smallest" /> : t("initialize")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
