import React from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoardSortableList } from "./BoardSortableList";
import { BoardColumnTitle } from "./BoardColumnTitle";
import { BoardItem, BoardItemViewProps } from "./board_types";
import { AddIcon, Button, CircularProgress, cls, defaultBorderMixin, IconButton } from "@firecms/ui";

export interface BoardColumnProps<M extends Record<string, any>> {
    id: string;
    title: string;
    items: BoardItem<M>[];
    index: number;
    ItemComponent: React.ComponentType<BoardItemViewProps<M>>;
    isDragging: boolean;
    isDragOverColumn: boolean;
    /**
     * Whether column reordering is allowed (shows drag handle)
     */
    allowReorder?: boolean;
    /**
     * Whether items are loading for this column
     */
    loading?: boolean;
    /**
     * Whether there are more items to load
     */
    hasMore?: boolean;
    /**
     * Callback to load more items
     */
    onLoadMore?: () => void;
    /**
     * Callback to add a new item to this column
     */
    onAddItem?: () => void;
    /**
     * Total count of entities in this column
     */
    totalCount?: number;
    style?: React.CSSProperties;
}

export function BoardColumn<M extends Record<string, any>>({
    id,
    title,
    items,
    ItemComponent,
    isDragging,
    isDragOverColumn,
    allowReorder = false,
    loading = false,
    hasMore = false,
    onLoadMore,
    onAddItem,
    totalCount,
    style
}: BoardColumnProps<M>) {
    const {
        setNodeRef,
        attributes,
        listeners,
        isDragging: isColumnBeingDragged,
        transform,
        transition,
    } = useSortable({
        id,
        data: { type: "COLUMN" },
        disabled: !allowReorder
    });

    const combinedStyle = {
        ...style,
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isColumnBeingDragged ? 2 : 1,
    };

    // Only apply drag listeners if reordering is allowed
    const dragListeners = allowReorder ? listeners : {};

    return (
        <div
            ref={setNodeRef}
            style={combinedStyle}
            {...attributes}
            className={cls(
                "border h-full w-80 min-w-80 m-2 flex flex-col rounded-md",
                defaultBorderMixin,
                isColumnBeingDragged ? "ring-2 ring-primary" : ""
            )}
        >
            <div
                {...dragListeners}
                className={cls(
                    "flex items-center justify-between px-2 rounded-t-md transition-colors duration-200 ease-in-out",
                    isColumnBeingDragged
                        ? "bg-surface-100 dark:bg-surface-900"
                        : "bg-surface-50 hover:bg-surface-100 dark:bg-surface-950 dark:hover:bg-surface-900",
                    allowReorder ? "cursor-grab" : ""
                )}
            >
                <div className="flex items-center gap-2">
                    <BoardColumnTitle aria-label={`${title} item list`}>
                        {title}
                    </BoardColumnTitle>
                    {totalCount !== undefined && (
                        <span className="text-xs text-surface-500 dark:text-surface-400">
                            {totalCount}
                        </span>
                    )}
                </div>
                {onAddItem && (
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddItem();
                        }}
                        className="opacity-60 hover:opacity-100"
                    >
                        <AddIcon size="small" />
                    </IconButton>
                )}
            </div>
            <SortableContext
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
            >
                <BoardSortableList
                    columnId={id}
                    items={items}
                    ItemComponent={ItemComponent}
                    isDragging={isDragging}
                    isDragOverColumn={isDragOverColumn}
                />
            </SortableContext>

            {/* Load more / Loading indicator */}
            {(loading || hasMore) && (
                <div className="flex items-center justify-center py-2 px-2 border-t border-surface-200 dark:border-surface-700">
                    {loading ? (
                        <CircularProgress size="smallest" />
                    ) : hasMore && onLoadMore ? (
                        <Button
                            size="small"
                            variant="text"
                            onClick={onLoadMore}
                            className="text-xs w-full"
                        >
                            Load more
                        </Button>
                    ) : null}
                </div>
            )}
        </div>
    );
}
