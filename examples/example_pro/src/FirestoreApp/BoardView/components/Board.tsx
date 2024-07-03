import React, { useState } from "react";
import type { DraggableLocation, DroppableProvided, DropResult } from "@hello-pangea/dnd";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import Column from "./Column";
import reorder, { reorderItemMap } from "./reorder";
import { Item, ItemMap, ItemViewProps } from "./types";
import { cls } from "@firecms/ui";

export interface BoardProps<T extends object, COLUMN extends string> {
    data: Item<T>[];
    columns: COLUMN[]
    className?: string;
    assignColumn: (item: Item<T>) => COLUMN;
    isCombineEnabled?: boolean;
    useClone?: boolean;
    autoScrollerOptions?: any;
    onColumnReorder?: (columns: COLUMN[]) => void;
    ItemComponent: React.ComponentType<ItemViewProps<T>>;
}

export const Board = <T extends object, COLUMN extends string>({
                                                                   data,
                                                                   columns: columnsProp,
                                                                   className,
                                                                   assignColumn,
                                                                   isCombineEnabled = false,
                                                                   useClone,
                                                                   autoScrollerOptions,
                                                                   onColumnReorder,
                                                                   ItemComponent
                                                               }: BoardProps<T, COLUMN>) => {

    const dataColumnMap: Record<string, COLUMN> = data.reduce((prev, item: Item<T>) => ({
        ...prev,
        [item.id]: assignColumn(item)
    }), {});

    const itemMap: ItemMap<T> = columnsProp.reduce(
        (previous: ItemMap<T>, column: COLUMN) => ({
            ...previous,
            [column]: data.filter((item: Item<T>) => dataColumnMap[item.id] === column)
        }),
        {}
    );

    const [itemMapState, setItemMapState] = useState<ItemMap<T>>(itemMap);
    const [ordered, setOrdered] = useState<COLUMN[]>(columnsProp);

    const onDragEnd = (result: DropResult): void => {
        if (result.combine) {
            if (result.type === "COLUMN") {
                const shallowCopiedOrdered = [...ordered];
                shallowCopiedOrdered.splice(result.source.index, 1);
                setOrdered(shallowCopiedOrdered);
                onColumnReorder?.(shallowCopiedOrdered);
                return;
            }

            const column: Item<T>[] = itemMapState[result.source.droppableId];
            const withItemRemoved: Item<T>[] = [...column];
            withItemRemoved.splice(result.source.index, 1);
            const newColumns: ItemMap<T> = {
                ...itemMapState,
                [result.source.droppableId]: withItemRemoved,
            };
            setItemMapState(newColumns);
        } else if (!result.destination) {
            // return;
        } else {
            const source: DraggableLocation = result.source;
            const destination: DraggableLocation = result.destination;

            if (
                source.droppableId === destination.droppableId &&
                source.index === destination.index
            ) {
                return;
            }

            // Reorder logic for columns or items
            let newState;
            if (result.type === "COLUMN") {
                newState = reorder(
                    ordered,
                    source.index,
                    destination.index,
                );
                setOrdered(newState);
            } else {
                const data = reorderItemMap({
                    itemMap: itemMapState,
                    source,
                    destination,
                });
                setItemMapState(data.itemMap);
            }
        }
    };

    const board = (
        <Droppable droppableId="board"
                   type="COLUMN"
                   direction="horizontal"
                   isCombineEnabled={isCombineEnabled}>
            {(provided: DroppableProvided) => (
                <div ref={provided.innerRef}
                     {...provided.droppableProps}
                     className={cls("md:p-4 h-full min-w-full inline-flex", className)}>
                    {ordered.map((key: string, index: number) => (
                        <Column key={key}
                                index={index}
                                title={key}
                                items={itemMapState[key]}
                                ItemComponent={ItemComponent}
                                isCombineEnabled={isCombineEnabled}
                                useClone={useClone}/>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd} autoScrollerOptions={autoScrollerOptions}>
                {board}
            </DragDropContext>
        </>
    );
};
