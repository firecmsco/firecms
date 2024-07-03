import React, { Component } from "react";
import type { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { Draggable } from "@hello-pangea/dnd";
import SortableList from "./SortableList";
import { ColumnTitle } from "./ColumnTitle";
import type { Item } from "./types";
import { cls, defaultBorderMixin } from "@firecms/ui";

interface ColumnProps {
    title: string;
    items: Item[];
    index: number;
    isCombineEnabled?: boolean;
    useClone?: boolean;
    ItemComponent: React.ComponentType<any>;
}

export default class Column extends Component<ColumnProps> {
    render() {
        const {
            title,
            items,
            index,
            isCombineEnabled,
            useClone,
            ItemComponent
        } = this.props;
        return (
            <Draggable draggableId={title} index={index}>
                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <div ref={provided.innerRef}
                         {...provided.draggableProps}
                         className={cls("border h-full w-80 m-2 flex flex-col",
                             "rounded-md",
                             defaultBorderMixin,
                             snapshot.isDragging ? "ring-2 ring-primary" : "",)}>
                        <div
                            className={`flex items-center justify-center rounded-t-md ${
                                snapshot.isDragging
                                    ? "bg-gray-100 dark:bg-gray-900"
                                    : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900"
                            } transition-colors duration-200 ease-in-out`}
                            {...provided.dragHandleProps}
                        >
                            <ColumnTitle aria-label={`${title} item list`}>
                                {title}
                            </ColumnTitle>
                        </div>
                        <SortableList
                            listId={title}
                            listType="ITEM"
                            // className={`flex-1 ${snapshot.isDragging ? "bg-slate-50 dark:bg-gray-950 border-2" : ""}`}
                            items={items}
                            isCombineEnabled={isCombineEnabled}
                            isDragging={snapshot.isDragging}
                            useClone={useClone}
                            ItemComponent={ItemComponent}
                        />
                    </div>
                )}
            </Draggable>
        );
    }
}
