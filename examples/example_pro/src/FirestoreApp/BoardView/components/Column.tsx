// examples/example_pro/src/FirestoreApp/BoardView/components/Column.tsx
import React from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SortableList from "./SortableList";
import { ColumnTitle } from "./ColumnTitle";
import type { Item } from "./types";
import { cls, defaultBorderMixin } from "@firecms/ui";

interface ColumnProps {
    id: string;
    title: string;
    items: Item[];
    index: number;
    ItemComponent: React.ComponentType<any>;
    isDragging: boolean; // Prop for overall drag state
    isDragOverColumn: boolean; // Prop to indicate if this column is being hovered over
    style?: React.CSSProperties; // Optional style prop for custom styles
}

const Column: React.FC<ColumnProps> = ({
                                           id,
                                           title,
                                           items,
                                           ItemComponent,
                                           isDragging, // Consumed from Board
                                           isDragOverColumn, // Consumed from Board
                                           style
                                       }) => {
    const {
        setNodeRef,
        attributes,
        listeners,
        isDragging: isColumnBeingDragged, // Renamed to avoid conflict
        transform,
        transition,
    } = useSortable({
        id,
        data: { type: "COLUMN" }
    });

    const combinedStyle = {
        ...style,
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isColumnBeingDragged ? 2 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={combinedStyle}
            {...attributes}
            {...listeners}
            className={cls(
                "border h-full w-80 m-2 flex flex-col rounded-md",
                defaultBorderMixin,
                isColumnBeingDragged ? "ring-2 ring-primary" : ""
            )}
        >
            <div
                className={`flex items-center justify-center rounded-t-md ${
                    isColumnBeingDragged // Style for when the column itself is dragged
                        ? "bg-surface-100 dark:bg-surface-900"
                        : "bg-surface-50 hover:bg-surface-100 dark:bg-surface-950 dark:hover:bg-surface-900"
                } transition-colors duration-200 ease-in-out`}
            >
                <ColumnTitle aria-label={`${title} item list`}>
                    {title}
                </ColumnTitle>
            </div>
            <SortableContext
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
            >
                <SortableList
                    columnId={id}
                    items={items}
                    ItemComponent={ItemComponent}
                    isDragging={isDragging} // Pass down overall drag state
                    isDragOverColumn={isDragOverColumn} // Pass down specific hover state for this column
                />
            </SortableContext>
        </div>
    );
};

export default Column;
