import React, { memo, useMemo } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoardSortableList } from "./BoardSortableList";
import { BoardColumnTitle } from "./BoardColumnTitle";
import { BoardItem, BoardItemViewProps } from "./board_types";
import { AddIcon, ChipColorKey, ChipColorScheme, cls, defaultBorderMixin, IconButton } from "@firecms/ui";

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
    /**
     * Color of the column header indicator
     */
    color?: ChipColorKey | ChipColorScheme;
    style?: React.CSSProperties;
}

// Memoized to prevent unnecessary re-renders when other columns change
export const BoardColumn = memo(function BoardColumn<M extends Record<string, any>>({
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
                                                                                        color,
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

    // Memoize combined style to avoid object recreation
    const combinedStyle = useMemo(() => ({
        ...style,
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isColumnBeingDragged ? 2 : 1,
    }), [style, transform, transition, isColumnBeingDragged]);

    // Only apply drag listeners if reordering is allowed
    const dragListeners = allowReorder ? listeners : {};

    // Memoize className to avoid recomputation
    const columnClassName = useMemo(() => cls(
        "border h-full w-80 min-w-80 mx-2 flex flex-col rounded-md",
        defaultBorderMixin,
        isColumnBeingDragged ? "ring-2 ring-primary" : ""
    ), [isColumnBeingDragged]);

    const headerClassName = useMemo(() => cls(
        "flex items-center justify-between px-2 rounded-t-md transition-colors duration-200 ease-in-out",
        isColumnBeingDragged
            ? "bg-surface-100 dark:bg-surface-900"
            : "bg-surface-50 hover:bg-surface-100 dark:bg-surface-950 dark:hover:bg-surface-900",
        allowReorder ? "cursor-grab" : ""
    ), [isColumnBeingDragged, allowReorder]);

    // Memoize items IDs array to avoid recreating on each render
    const itemIds = useMemo(() => items.map(i => i.id), [items]);

    return (
        <div
            ref={setNodeRef}
            style={combinedStyle}
            {...attributes}
            className={columnClassName}
        >
            <div
                {...dragListeners}
                className={headerClassName}
            >
                <div className="flex items-center gap-2">
                    <BoardColumnTitle aria-label={`${title} item list`} color={color}>
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
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onAddItem();
                        }}
                        className="opacity-60 hover:opacity-100"
                    >
                        <AddIcon size="small"/>
                    </IconButton>
                )}
            </div>
            <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
            >
                <BoardSortableList
                    columnId={id}
                    items={items}
                    ItemComponent={ItemComponent}
                    isDragging={isDragging}
                    isDragOverColumn={isDragOverColumn}
                    loading={loading}
                    hasMore={hasMore}
                    onLoadMore={onLoadMore}
                />
            </SortableContext>
        </div>
    );
}) as <M extends Record<string, any>>(props: BoardColumnProps<M>) => React.ReactElement;
