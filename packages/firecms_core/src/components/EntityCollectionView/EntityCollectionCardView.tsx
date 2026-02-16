import React, { useCallback, useEffect, useRef } from "react";
import { CollectionSize, Entity, EntityCollection, EntityTableController, SelectionController } from "../../types";
import { EntityCard } from "./EntityCard";
import { CircularProgress, cls, Typography } from "@firecms/ui";
import { useAuthController, useCustomizationController } from "../../hooks";

export type EntityCollectionCardViewProps<M extends Record<string, any> = any> = {
    collection: EntityCollection<M>;
    tableController: EntityTableController<M>;
    onEntityClick?: (entity: Entity<M>) => void;
    selectionController?: SelectionController<M>;
    selectionEnabled?: boolean;
    highlightedEntities?: Entity<M>[];
    emptyComponent?: React.ReactNode;
    onScroll?: (props: {
        scrollDirection: "forward" | "backward";
        scrollOffset: number;
        scrollUpdateWasRequested: boolean;
    }) => void;
    initialScroll?: number;
    /**
     * Size of the cards in the grid view.
     * - "xs": Extra small cards, most cards per row
     * - "s": Small cards
     * - "m": Medium cards (default)
     * - "l": Large cards
     * - "xl": Extra large cards, fewest cards per row
     */
    size?: CollectionSize;
};

/**
 * Get grid column classes based on the size.
 * Smaller size = more columns (smaller cards)
 * Larger size = fewer columns (larger cards)
 */
function getGridColumnsClass(size: CollectionSize): string {
    switch (size) {
        case "xs":
            // Compact: many small cards
            return "grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10";
        case "s":
            // Small: more cards per row
            return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8";
        case "m":
            // Medium: balanced (default)
            return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
        case "l":
            // Large: fewer, bigger cards
            return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4";
        case "xl":
            // Extra large: fewest, biggest cards
            return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
        default:
            return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
    }
}

/**
 * Card grid view for displaying entities with infinite scroll.
 * Alternative to the EntityCollectionTable for visual browsing.
 */
export function EntityCollectionCardView<M extends Record<string, any> = any>({
                                                                                  collection,
                                                                                  tableController,
                                                                                  onEntityClick,
                                                                                  selectionController,
                                                                                  selectionEnabled = true,
                                                                                  highlightedEntities,
                                                                                  emptyComponent,
                                                                                  onScroll,
                                                                                  initialScroll,
                                                                                  size = "m"
                                                                              }: EntityCollectionCardViewProps<M>) {
    const authController = useAuthController();
    const customizationController = useCustomizationController();

    const containerRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const hasRestoredScroll = useRef(false);

    const {
        data,
        dataLoading,
        noMoreToLoad,
        dataLoadingError,
        itemCount,
        setItemCount,
        pageSize = 50,
        paginationEnabled
    } = tableController;

    // Track if we're currently loading to prevent multiple simultaneous load requests
    const isLoadingMore = useRef(false);

    // Infinite scroll with Intersection Observer
    useEffect(() => {
        if (!paginationEnabled || noMoreToLoad || dataLoading) {
            return;
        }

        // Reset loading flag when dataLoading becomes false
        if (!dataLoading) {
            isLoadingMore.current = false;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !dataLoading && !noMoreToLoad && !isLoadingMore.current) {
                    // Prevent multiple load requests
                    isLoadingMore.current = true;
                    // Load more items
                    setItemCount?.((itemCount ?? pageSize) + pageSize);
                }
            },
            {
                root: containerRef.current, // Use the scroll container, not viewport
                rootMargin: "400px",
                threshold: 0
            }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [paginationEnabled, noMoreToLoad, dataLoading, itemCount, pageSize, setItemCount]);

    // Scroll restoration: restore initial scroll position
    useEffect(() => {
        if (containerRef.current && initialScroll && !hasRestoredScroll.current && data.length > 0) {
            containerRef.current.scrollTop = initialScroll;
            hasRestoredScroll.current = true;
        }
    }, [initialScroll, data.length]);

    // Scroll tracking: call onScroll when user scrolls
    const lastScrollOffset = useRef(0);
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !onScroll) return;

        const handleScroll = () => {
            const currentOffset = container.scrollTop;
            const direction = currentOffset > lastScrollOffset.current ? "forward" : "backward";
            lastScrollOffset.current = currentOffset;
            onScroll({
                scrollDirection: direction,
                scrollOffset: currentOffset,
                scrollUpdateWasRequested: false
            });
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [onScroll]);

    const handleEntityClick = useCallback((entity: Entity<M>) => {
        onEntityClick?.(entity);
    }, [onEntityClick]);

    const handleSelectionChange = useCallback((entity: Entity<M>, selected: boolean) => {
        selectionController?.toggleEntitySelection(entity, selected);
    }, [selectionController]);

    const isEntitySelected = useCallback((entity: Entity<M>) => {
        return selectionController?.isEntitySelected(entity) ?? false;
    }, [selectionController]);

    const isEntityHighlighted = useCallback((entity: Entity<M>) => {
        return highlightedEntities?.some(e => e.id === entity.id && e.path === entity.path) ?? false;
    }, [highlightedEntities]);

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

    const gridColumnsClass = getGridColumnsClass(size);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-auto p-4"
        >
            {/* Card Grid with max-width container */}
            <div className="max-w-7xl mx-auto">
                <div className={cls(
                    "grid gap-4",
                    gridColumnsClass
                )}>
                    {data.map((entity) => (
                        <EntityCard
                            key={`${entity.path}_${entity.id}`}
                            entity={entity}
                            collection={collection}
                            onClick={handleEntityClick}
                            selected={isEntitySelected(entity)}
                            highlighted={isEntityHighlighted(entity)}
                            onSelectionChange={handleSelectionChange}
                            selectionEnabled={selectionEnabled}
                            size={size}
                        />
                    ))}
                </div>

                {/* Load more trigger / Loading indicator */}
                <div
                    ref={loadMoreRef}
                    className="flex items-center justify-center py-8"
                >
                    {dataLoading && (
                        <CircularProgress size="small"/>
                    )}
                    {!dataLoading && noMoreToLoad && data.length > 0 && (
                        <Typography variant="caption" color="secondary">
                            All {data.length} entries loaded
                        </Typography>
                    )}
                </div>
            </div>
        </div>
    );
}
