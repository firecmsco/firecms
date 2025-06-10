import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    closestCenter,
    CollisionDetection,
    defaultDropAnimationSideEffects,
    DropAnimation,
    getFirstCollision,
    KeyboardSensor,
    MouseSensor,
    pointerWithin,
    rectIntersection,
    TouchSensor,
    UniqueIdentifier,
    useDndMonitor,
    useDroppable,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    AnimateLayoutChanges,
    arrayMove,
    defaultAnimateLayoutChanges,
    rectSortingStrategy,
    SortableContext,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { NavigationCardBinding } from "./NavigationCardBinding";
import { TopNavigationEntry } from "../../types";
import { cls } from "@firecms/ui";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({
        ...args,
        wasDragging: true
    });

const dropAnimation: DropAnimation = {
    duration: 200,
    sideEffects: defaultDropAnimationSideEffects({
        styles: { active: { opacity: "0.5" } }
    })
};

/* ----------------------------------------------------------------------------
   Sortable single card
---------------------------------------------------------------------------- */
export function SortableNavigationCard({ entry }: { entry: TopNavigationEntry }) {
    const {
        setNodeRef,
        listeners,
        attributes,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: entry.url,
        animateLayoutChanges
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1                   // remove original while dragging
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <NavigationCardBinding {...entry} />
        </div>
    );
}

export function NavigationGroupDroppable({
                                             id,
                                             itemIds,
                                             children
                                         }: {
    id: UniqueIdentifier;
    itemIds: UniqueIdentifier[];
    children: React.ReactNode;
}) {
    /* basic droppable behaviour */
    const { setNodeRef } = useDroppable({ id });

    /* keep local “isOverContainer” state */
    const [isOverContainer, setIsOverContainer] = useState(false);

    /* react to every drag-over event in the whole DndContext */
    useDndMonitor({
        onDragOver({ over }) {
            if (!over) {
                setIsOverContainer(false);
                return;
            }
            /* highlight if pointer is over the container OR an item inside it */
            setIsOverContainer(
                over.id === id || itemIds.includes(over.id as UniqueIdentifier)
            );
        },
        onDragEnd() {
            setIsOverContainer(false);
        },
        onDragCancel() {
            setIsOverContainer(false);
        }
    });

    return (
        <div
            ref={setNodeRef}
            className={
                cls(isOverContainer
                    ? "p-2 pb-4 bg-surface-accent-200 dark:bg-surface-accent-800 rounded-lg"
                    : undefined, "transition-all duration-200 ease-in-out"
                )}
        >
            {/* items use rectSortingStrategy so they animate inside the grid */}
            <SortableContext items={itemIds} strategy={rectSortingStrategy}>
                {children}
            </SortableContext>
        </div>
    );
}

export function useHomePageDnd(initial: Record<string, TopNavigationEntry[]>) {

    const [items, setItems] = useState<Record<string, TopNavigationEntry[]>>(initial);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const containers = Object.keys(items);

    /* sensors */
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 5
            }
        }),
        useSensor(KeyboardSensor)
    );

    const lastOverId = useRef<UniqueIdentifier | null>(null);
    const recentlyMovedToNewContainer = useRef(false);

    const findContainer = useCallback((id: UniqueIdentifier) => {
        if (id in items) return id;
        return Object.keys(items).find(key =>
            items[key].some(e => e.url === id)
        );
    }, [items]);

    const collisionDetection: CollisionDetection = useCallback((args) => {

        if (activeId && activeId in items) {
            return closestCenter({
                ...args,
                droppableContainers: args.droppableContainers.filter(c => c.id in items)
            });
        }

        /* pointer collisions first */
        const pointer = pointerWithin(args);
        const collisions = pointer.length ? pointer : rectIntersection(args);
        let overId = getFirstCollision(collisions, "id");

        if (overId != null) {
            if (overId in items) {
                /* We're over a container – choose closest item inside */
                const containerItems = items[overId];
                if (containerItems.length) {
                    overId = closestCenter({
                        ...args,
                        droppableContainers: args.droppableContainers.filter(
                            c => containerItems.some(e => e.url === c.id)
                        )
                    })[0]?.id;
                }
            }
            lastOverId.current = overId;
            return [{ id: overId }];
        }

        if (recentlyMovedToNewContainer.current) lastOverId.current = activeId;
        return lastOverId.current ? [{ id: lastOverId.current }] : [];
    }, [activeId, items]);

    const onDragStart = ({ active }: { active: any }) => {
        setActiveId(active.id);
    };

    const onDragOver = ({
                            active,
                            over
                        }: { active: any, over: any }) => {
        const overId = over?.id;
        if (!overId || active.id in items) return;

        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(overId);
        if (!activeContainer || !overContainer) return;

        if (activeContainer !== overContainer) {
            setItems(all => {
                const activeItems = all[activeContainer];
                const overItems = all[overContainer];
                const activeItem = activeItems.find(e => e.url === active.id)!;
                const overIndex = overItems.findIndex(e => e.url === overId);

                const newIndex = overIndex >= 0 ? overIndex : overItems.length;

                recentlyMovedToNewContainer.current = true;

                return {
                    ...all,
                    [activeContainer]: activeItems.filter(e => e.url !== active.id),
                    [overContainer]: [
                        ...overItems.slice(0, newIndex),
                        activeItem,
                        ...overItems.slice(newIndex)
                    ]
                };
            });
        }
    };

    const onDragEnd = ({
                           active,
                           over
                       }: { active: any, over: any }) => {
        const activeId = active.id;
        const overId = over?.id;

        if (!overId) {
            setActiveId(null);
            return;
        }

        // Handle drop into new group zone
        if (overId === "new-group-drop-zone") {
            const activeContainer = findContainer(activeId);
            if (activeContainer) {
                const activeItem = items[activeContainer].find(e => e.url === activeId);
                if (activeItem) {
                    // Create new group name (can be made more sophisticated)
                    const newGroupName = "New Group";

                    setItems(all => {
                        return {
                            ...all,
                            [activeContainer]: all[activeContainer].filter(e => e.url !== activeId),
                            [newGroupName]: [...(all[newGroupName] || []), activeItem]
                        };
                    });
                }
            }
            setActiveId(null);
            return;
        }

        // Existing code for normal drops
        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);
        if (!activeContainer || !overContainer) {
            setActiveId(null);
            return;
        }

        // The rest of the existing function...
        if (activeContainer === overContainer) {
            const activeIndex = items[activeContainer].findIndex(e => e.url === active.id);
            const overIndex = items[overContainer].findIndex(e => e.url === overId);
            if (activeIndex !== overIndex) {
                setItems(all => ({
                    ...all,
                    [overContainer]: arrayMove(
                        all[overContainer],
                        activeIndex,
                        overIndex
                    )
                }));
            }
        }
        setActiveId(null);
    };

    /* active entry for the overlay ------------------------------------------- */
    const activeEntry = useMemo(() => {
        if (!activeId) return null;
        return Object.values(items).flat().find(e => e.url === activeId) || null;
    }, [activeId, items]);

    return {
        sensors,
        collisionDetection,
        onDragStart,
        onDragOver,
        onDragEnd,
        dropAnimation,
        entriesByGroup: items,
        activeEntry,
        containers
    };
}

// Add this component to HomePageDnD.tsx
export function NewGroupDropZone() {
    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id: "new-group-drop-zone"
    });

    // Only render this when dragging is happening
    const [isVisible, setIsVisible] = useState(false);

    useDndMonitor({
        onDragStart() {
            setIsVisible(true);
        },
        onDragEnd() {
            setIsVisible(false);
        },
        onDragCancel() {
            setIsVisible(false);
        }
    });

    if (!isVisible) return null;

    return (
        <div
            ref={setNodeRef}
            className={cls(
                "fixed right-8 top-1/2 -translate-y-1/2 w-[200px] h-[140px] border border-dashed rounded-lg flex items-center justify-center transition-all",
                isOver
                    ? "bg-surface-accent-100 dark:bg-surface-accent-800 border-surface-300 dark:border-surface-600"
                    : "bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700"
            )}
        >
            <div className="text-center p-4">
        <span className="block font-medium text-sm">
          Drop here to create a new group
        </span>
            </div>
        </div>
    );
}
