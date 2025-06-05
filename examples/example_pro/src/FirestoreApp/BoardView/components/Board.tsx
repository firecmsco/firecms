import React, { useEffect, useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    pointerWithin,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import Column from "./Column";
import { Item, ItemMap, ItemViewProps } from "./types";
import { cls } from "@firecms/ui";

export interface BoardProps<T extends object, COLUMN extends string> {
    data: Item<T>[];
    columns: COLUMN[];
    className?: string;
    assignColumn: (item: Item<T>) => COLUMN;
    isCombineEnabled?: boolean;
    useClone?: boolean;
    autoScrollerOptions?: any;
    onColumnReorder?: (columns: COLUMN[]) => void;
    onItemsReorder?: (
        items: Item<T>[],
        moveInfo?: {
            itemId: string,
            sourceColumn: COLUMN,
            targetColumn: COLUMN
        }
    ) => void;
    ItemComponent: React.ComponentType<ItemViewProps<T>>;
}

export const Board = <T extends object, COLUMN extends string>({
                                                                   data,
                                                                   columns: columnsProp,
                                                                   className,
                                                                   assignColumn,
                                                                   onColumnReorder,
                                                                   onItemsReorder,
                                                                   ItemComponent,
                                                               }: BoardProps<T, COLUMN>) => {

    const [activeItem, setActiveItem] = useState<Item<T> | null>(null);
    const [activeColumn, setActiveColumn] = useState<COLUMN | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
    const [itemMapState, setItemMapState] = useState<ItemMap<T>>(() => {
        const dataColumnMap: Record<string, COLUMN> = data.reduce((prev, item: Item<T>) => ({
            ...prev,
            [item.id]: assignColumn(item)
        }), {});
        return columnsProp.reduce(
            (previous: ItemMap<T>, column: COLUMN) => ({
                ...previous,
                [column]: data.filter((item: Item<T>) => dataColumnMap[item.id] === column)
            }),
            {}
        );
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    useEffect(() => {
        const dataColumnMap: Record<string, COLUMN> = data.reduce((prev, item) => ({
            ...prev,
            [item.id]: assignColumn(item)
        }), {});

        setItemMapState(() => columnsProp.reduce(
            (previous: ItemMap<T>, column: COLUMN) => ({
                ...previous,
                [column]: data.filter((item: Item<T>) => dataColumnMap[item.id] === column)
            }),
            {}
        ));
    }, [data, columnsProp, assignColumn]);

    const findColumnByItemId = (id: string): string | undefined => {
        return Object.keys(itemMapState).find(col => itemMapState[col]?.some(i => i.id === id));
    };

    const handleDragStart = (event: DragStartEvent) => {
        setIsDragging(true);
        setDragOverColumnId(null);
        const { active } = event;

        if (active.data.current?.type === "COLUMN") {
            const columnId = active.id as string;
            const column = columnsProp.find(col => String(col) === columnId);
            if (column) {
                setActiveColumn(column);
            }
        } else if (active.data.current?.type === "ITEM") {
            const columnId = findColumnByItemId(active.id as string);
            if (columnId) {
                const item = itemMapState[columnId]?.find(i => i.id === active.id);
                setActiveItem(item || null);
            }
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const {
            active,
            over
        } = event;

        if (!over) {
            setDragOverColumnId(null);
            return;
        }

        let currentHoveredColumnId: string | null = null;
        const overId = over.id as string;
        const overDataType = over.data.current?.type as string | undefined;

        if (overDataType === "ITEM-LIST" || overDataType === "COLUMN") {
            currentHoveredColumnId = overId;
        } else if (overDataType === "ITEM") {
            currentHoveredColumnId = findColumnByItemId(overId) || null;
        } else if (columnsProp.includes(overId as COLUMN)) {
            currentHoveredColumnId = overId;
        }

        setDragOverColumnId(currentHoveredColumnId);

        // Skip item reordering if dragging a column
        if (active.data.current?.type !== "ITEM") {
            return;
        }

        const activeId = active.id as string;
        const activeColumn = findColumnByItemId(activeId);
        let overColumnForMove = findColumnByItemId(overId);

        if (!overColumnForMove && overDataType === "ITEM-LIST") {
            overColumnForMove = overId;
        }
        if (!overColumnForMove && columnsProp.includes(overId as COLUMN)) {
            overColumnForMove = overId;
        }

        if (!activeColumn || !overColumnForMove) return;
        if (activeColumn === overColumnForMove && activeId === overId && overDataType !== "ITEM-LIST") return;

        // Prevent moving to a column if item with same ID already exists there
        if (overColumnForMove !== activeColumn &&
            itemMapState[overColumnForMove]?.some(i => i.id === activeId)) {
            return;
        }

        setItemMapState(currentMap => {
            const activeItems = [...(currentMap[activeColumn] || [])];
            const overItems = [...(currentMap[overColumnForMove!] || [])];
            const activeIndex = activeItems.findIndex(i => i.id === activeId);

            if (activeIndex === -1) return currentMap;

            let overIndex;
            if (overDataType === "ITEM-LIST" || (columnsProp.includes(overId as COLUMN) && !findColumnByItemId(overId))) {
                overIndex = overItems.length;
            } else {
                overIndex = overItems.findIndex(i => i.id === overId);
                if (overIndex !== -1) {
                    const { y } = event.delta;
                    const overRect = over.rect;
                    if (overRect) {
                        const threshold = overRect.height / 2;
                        if (y > threshold) {
                            overIndex += 1;
                        }
                    }
                } else {
                    overIndex = overItems.length;
                }
            }

            if (activeColumn === overColumnForMove && activeIndex === overIndex) return currentMap;

            const newItemMap = { ...currentMap };
            if (activeColumn === overColumnForMove) {
                newItemMap[activeColumn] = arrayMove(activeItems, activeIndex, overIndex);
            } else {
                const [moved] = activeItems.splice(activeIndex, 1);
                overItems.splice(overIndex, 0, moved);
                newItemMap[activeColumn] = activeItems;
                newItemMap[overColumnForMove] = overItems;
            }
            return newItemMap;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const {
            active,
            over
        } = event;

        setIsDragging(false);
        setActiveItem(null);
        setActiveColumn(null);
        setDragOverColumnId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (active.data.current?.type === "COLUMN" &&
            over.data.current?.type === "COLUMN" &&
            activeId !== overId) {

            const oldIndex = columnsProp.findIndex(col => String(col) === activeId);
            const newIndex = columnsProp.findIndex(col => String(col) === overId);

            if (oldIndex !== -1 && newIndex !== -1 && onColumnReorder) {
                const newOrder = arrayMove([...columnsProp], oldIndex, newIndex);
                onColumnReorder(newOrder);
            }
       } else if (active.data.current?.type === "ITEM" && onItemsReorder) {
           const activeId = active.id as string;

           // Find the original column assignment from the input data
           const originalColumn = data.find(item => item.id === activeId)
               ? assignColumn(data.find(item => item.id === activeId)!)
               : undefined;

           // Find the current column assignment from our internal state
           const currentColumn = findColumnByItemId(activeId) as COLUMN | undefined;

           // When items have been reordered, convert itemMapState to a flat list
           const allItems: Item<T>[] = [];

           // Collect all items from all columns in their current order
           Object.entries(itemMapState).forEach(([column, columnItems]) => {
               if (columnItems && columnItems.length > 0) {
                   allItems.push(...columnItems);
               }
           });

           // Notify parent component of the change, including column movement information
           if (originalColumn !== currentColumn && originalColumn && currentColumn) {
               // Item has moved between columns - provide this context to parent
               onItemsReorder(allItems, {
                   itemId: activeId,
                   sourceColumn: originalColumn,
                   targetColumn: currentColumn
               });
           } else {
               // Just a reordering within the same column
               onItemsReorder(allItems);
           }
       }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <DragOverlay dropAnimation={{
                duration: 300,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}>
                {activeItem ? (
                    <ItemComponent
                        item={activeItem}
                        isDragging={true}
                        index={-1}
                        style={{
                            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                            opacity: 0.9,
                        }}
                    />
                ) : activeColumn ? (
                    <Column
                        key={String(activeColumn)}
                        index={-1}
                        id={String(activeColumn)}
                        title={String(activeColumn)}
                        items={itemMapState[String(activeColumn)] || []}
                        ItemComponent={ItemComponent}
                        isDragging={true}
                        isDragOverColumn={false}
                    />
                ) : null}
            </DragOverlay>

            <SortableContext
                items={columnsProp.map(String)}
                strategy={horizontalListSortingStrategy}
            >
                <div className={cls("md:p-4 h-full min-w-full inline-flex", className)}>
                    {columnsProp.map((key: COLUMN, index: number) => (
                        <Column
                            key={String(key)}
                            index={index}
                            id={String(key)}
                            title={String(key)}
                            items={itemMapState[String(key)] || []}
                            ItemComponent={ItemComponent}
                            isDragging={isDragging}
                            isDragOverColumn={String(key) === dragOverColumnId}
                            style={{
                                opacity: activeColumn === key ? 0 : 1
                            }}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};
