// examples/example_pro/src/FirestoreApp/BoardView/components/SortableList.tsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cls } from "@firecms/ui";
import type { Item, ItemViewProps } from "./types";

interface SortableListProps {
    columnId: string;
    items: Item[];
    ItemComponent: React.ComponentType<ItemViewProps<object>>;
    isDragging: boolean; // Overall drag operation active
    isDragOverColumn: boolean; // Is this specific column being hovered during drag
}

const SortableList: React.FC<SortableListProps> = ({
                                                       columnId,
                                                       items,
                                                       ItemComponent,
                                                       isDragging,
                                                       isDragOverColumn,
                                                   }) => {
    const {
        setNodeRef,
        // isOver, // We will now use isDragOverColumn for primary styling logic
    } = useDroppable({
        id: columnId,
        data: { type: "ITEM-LIST" }
    });

    return (
        <div
            ref={setNodeRef}
            className={cls(
                "flex flex-col p-4 transition-opacity duration-100 transition-bg ease-linear w-full overflow-y-auto flex-1 rounded-md",
                isDragging && isDragOverColumn
                    ? "bg-surface-accent-200 dark:bg-surface-800" // Highlight when this column is the active drop target
                    : isDragging
                        ? "bg-surface-50 dark:bg-surface-950 hover:bg-surface-accent-100 dark:hover:bg-surface-800" // Hover effect for non-target columns ONLY during drag
                        : "bg-surface-50 dark:bg-surface-950" // Default, no hover when not dragging
            )}
            style={{ minHeight: 80 }}
        >
            {items.map((item, index) => (
                <SortableItem
                    key={item.id}
                    item={item}
                    index={index}
                    columnId={columnId}
                    ItemComponent={ItemComponent}
                />
            ))}
        </div>
    );
};

// SortableItem remains unchanged from your provided code
interface SortableItemProps {
    item: Item;
    index: number;
    columnId: string;
    ItemComponent: React.ComponentType<ItemViewProps<object>>;
}

const SortableItem: React.FC<SortableItemProps> = ({
                                                       item,
                                                       index,
                                                       columnId,
                                                       ItemComponent,
                                                   }) => {
    const {
        setNodeRef,
        attributes,
        listeners,
        isDragging: isItemBeingDragged, // Renamed for clarity
        transform,
        transition,
    } = useSortable({
        id: item.id,
        data: {
            type: "ITEM",
            columnId
        }
    });

    const sortableStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isItemBeingDragged ? 2 : 1,
        opacity: isItemBeingDragged ? 0 : 1,
    };

    return (
        <div ref={setNodeRef} style={sortableStyle} {...attributes} {...listeners}>
            <ItemComponent
                item={item}
                isDragging={isItemBeingDragged}
                index={index}
            />
        </div>
    );
};
export default SortableList;
