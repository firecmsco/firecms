import React, { useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CircularProgress, cls } from "@firecms/ui";
import { BoardItem, BoardItemViewProps } from "./board_types";

interface BoardSortableListProps<M extends Record<string, any>> {
    columnId: string;
    items: BoardItem<M>[];
    ItemComponent: React.ComponentType<BoardItemViewProps<M>>;
    isDragging: boolean;
    isDragOverColumn: boolean;
    loading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

export function BoardSortableList<M extends Record<string, any>>({
    columnId,
    items,
    ItemComponent,
    isDragging,
    isDragOverColumn,
    loading = false,
    hasMore = false,
    onLoadMore,
}: BoardSortableListProps<M>) {
    const {
        setNodeRef,
    } = useDroppable({
        id: columnId,
        data: { type: "ITEM-LIST" }
    });

    // Infinite scroll sentinel ref - must be inside scrollable container
    const sentinelRef = useRef<HTMLDivElement>(null);
    const isLoadingRef = useRef(false);
    isLoadingRef.current = loading;
    const lastLoadTimeRef = useRef(0);

    // Set up IntersectionObserver for infinite scroll
    useEffect(() => {
        if (!sentinelRef.current || !hasMore || !onLoadMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const now = Date.now();
                if (
                    entries[0].isIntersecting &&
                    hasMore &&
                    !isLoadingRef.current &&
                    now - lastLoadTimeRef.current > 500
                ) {
                    lastLoadTimeRef.current = now;
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, onLoadMore]);

    return (
        <div
            ref={setNodeRef}
            className={cls(
                "flex flex-col p-4 transition-opacity duration-100 transition-bg ease-linear w-full overflow-y-auto flex-1 rounded-md",
                isDragging && isDragOverColumn
                    ? "bg-surface-accent-200 dark:bg-surface-800"
                    : isDragging
                        ? "bg-surface-50 dark:bg-surface-950 hover:bg-surface-accent-100 dark:hover:bg-surface-800"
                        : "bg-surface-50 dark:bg-surface-950"
            )}
            style={{ minHeight: 80 }}
        >
            {items.length === 0 && !loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs text-surface-400 dark:text-surface-500">
                        No items
                    </span>
                </div>
            ) : (
                <>
                    {items.map((item, index) => (
                        <SortableItem
                            key={item.id}
                            item={item}
                            index={index}
                            columnId={columnId}
                            ItemComponent={ItemComponent}
                        />
                    ))}
                    {/* Infinite scroll sentinel - inside scrollable container */}
                    {(loading || hasMore) && (
                        <div ref={sentinelRef} className="flex items-center justify-center py-2 min-h-6">
                            {loading && <CircularProgress size="smallest" />}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

interface SortableItemProps<M extends Record<string, any>> {
    item: BoardItem<M>;
    index: number;
    columnId: string;
    ItemComponent: React.ComponentType<BoardItemViewProps<M>>;
}

function SortableItem<M extends Record<string, any>>({
    item,
    index,
    columnId,
    ItemComponent,
}: SortableItemProps<M>) {
    const {
        setNodeRef,
        attributes,
        listeners,
        isDragging: isItemBeingDragged,
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
}
