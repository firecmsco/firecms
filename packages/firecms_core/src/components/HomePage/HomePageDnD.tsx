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
import { NavigationEntry } from "../../types";
import { cls } from "@firecms/ui";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({
        ...args,
        wasDragging: true
    });

const dropAnimation: DropAnimation = {
    duration: 300,
    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: "0.95",
                transform: "scale(1.03)",
                boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
            }
        }
    })
};

/* ----------------------------------------------------------------------------
   Sortable single card
---------------------------------------------------------------------------- */
export function SortableNavigationCard({ entry }: { entry: NavigationEntry }) {
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
                    ? "p-2 bg-surface-accent-200 dark:bg-surface-accent-800 rounded-lg"
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

export function SortableNavigationGroup({
                                            groupName,
                                            children
                                        }: { groupName: string, children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging // This is key
    } = useSortable({
        id: groupName,
        animateLayoutChanges
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1, // Hide original when dragging
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

// Modify useHomePageDnd
export function useHomePageDnd({
                                   items,
                                   setItems,
                                   disabled
                               }: {
    items: { name: string, entries: NavigationEntry[] }[],
    setItems: (items: { name: string, entries: NavigationEntry[] }[]) => void,
    disabled: boolean
}) {

    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [activeIsGroup, setActiveIsGroup] = useState(false);
    const [draggingGroupId, setDraggingGroupId] = useState<UniqueIdentifier | null>(null); // New state for dragged group ID

    const containers = useMemo(() => items.map(group => group.name), [items]);

    // ... (sensors remain the same) ...
    const mouseSensorInstance = useSensor(MouseSensor, { activationConstraint: { distance: 10 } });
    const touchSensorInstance = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 150,
            tolerance: 5
        }
    });
    const keyboardSensorInstance = useSensor(KeyboardSensor);

    const sensors = useSensors(
        ...(disabled
            ? []
            : [mouseSensorInstance, touchSensorInstance, keyboardSensorInstance])
    );

    const lastOverId = useRef<UniqueIdentifier | null>(null);
    const recentlyMovedToNewContainer = useRef(false);

    // ... (findContainer remains the same) ...
    const findContainer = useCallback((id: UniqueIdentifier): string | undefined => {
        if (!id) return undefined;
        const groupByName = items.find(group => group.name === id);
        if (groupByName) return groupByName.name;

        for (const group of items) {
            if (group.entries.some(e => e.url === id)) {
                return group.name;
            }
        }
        return undefined;
    }, [items]);

    // ... (collisionDetection remains largely the same, ensure it uses activeId correctly) ...
    const collisionDetection: CollisionDetection = useCallback((args) => {
        if (disabled || !activeId) return [];

        // activeIsGroup state is set onDragStart, use it directly
        // const isDraggingGroup = items.some(g => g.name === activeId);
        const isDraggingGroup = activeIsGroup;

        if (isDraggingGroup) {
            return closestCenter({
                ...args,
                droppableContainers: args.droppableContainers.filter(c =>
                    items.some(g => g.name === c.id) && c.id !== activeId
                )
            });
        } else {
            // ... (item collision logic remains the same)
            const pointerCollisions = pointerWithin(args);
            if (pointerCollisions.length > 0) {
                const newGroupZoneCollision = pointerCollisions.find(c => c.id === "new-group-drop-zone");
                if (newGroupZoneCollision) return [newGroupZoneCollision];

                const containerCollision = pointerCollisions.find(c => items.some(g => g.name === c.id));
                if (containerCollision) {
                    const containerItems = items.find(g => g.name === containerCollision.id)?.entries ?? [];
                    if (containerItems.length > 0) {
                        const closestItemInContainer = closestCenter({
                            ...args,
                            droppableContainers: args.droppableContainers.filter(
                                dc => containerItems.some(e => e.url === dc.id)
                            )
                        });
                        if (closestItemInContainer.length > 0) return closestItemInContainer;
                    }
                    return [containerCollision];
                }
                const firstCollision = getFirstCollision(pointerCollisions, "id");
                if (firstCollision) return [{ id: firstCollision }];
            }

            const rectCollisions = rectIntersection(args);
            const newGroupZoneRectCollision = rectCollisions.find(c => c.id === "new-group-drop-zone");
            if (newGroupZoneRectCollision) return [newGroupZoneRectCollision];

            let overId = getFirstCollision(rectCollisions, "id");
            if (overId != null) {
                const overIsContainer = items.some(g => g.name === overId);
                if (overIsContainer) {
                    const containerItems = items.find(g => g.name === overId)?.entries ?? [];
                    if (containerItems.length) {
                        const closestItem = closestCenter({
                            ...args,
                            droppableContainers: args.droppableContainers.filter(
                                c => containerItems.some(e => e.url === c.id)
                            )
                        })[0]?.id;
                        if (closestItem) overId = closestItem;
                    }
                }
                lastOverId.current = overId;
                return [{ id: overId }];
            }
        }

        if (recentlyMovedToNewContainer.current && lastOverId.current && !isDraggingGroup) return [{ id: lastOverId.current }];
        return [];
    }, [activeId, items, disabled, recentlyMovedToNewContainer, activeIsGroup]);

    const onDragStart = ({ active }: { active: any }) => {
        if (disabled) return;
        const isGroup = items.some(g => g.name === active.id);
        setActiveId(active.id);
        setActiveIsGroup(isGroup);
        if (isGroup) {
            setDraggingGroupId(active.id);
        }
        recentlyMovedToNewContainer.current = false;
    };

    // ... (onDragOver remains the same) ...
    const onDragOver = ({
                            active,
                            over
                        }: { active: any, over: any }) => {
        if (disabled || !over || activeIsGroup) return;

        const currentActiveId = active.id;
        const overId = over.id;

        if (currentActiveId === overId || items.some(g => g.name === currentActiveId)) return;

        const activeContainerName = findContainer(currentActiveId);
        const overContainerName = findContainer(overId);

        if (!activeContainerName || !overContainerName || activeContainerName === overContainerName) {
            recentlyMovedToNewContainer.current = false;
            return;
        }

        recentlyMovedToNewContainer.current = true;
        const newItemsState = [...items];

        const sourceGroupIndex = newItemsState.findIndex(g => g.name === activeContainerName);
        const targetGroupIndex = newItemsState.findIndex(g => g.name === overContainerName);

        if (sourceGroupIndex === -1 || targetGroupIndex === -1) return;

        const sourceGroup = {
            ...newItemsState[sourceGroupIndex],
            entries: [...newItemsState[sourceGroupIndex].entries]
        };
        const targetGroup = {
            ...newItemsState[targetGroupIndex],
            entries: [...newItemsState[targetGroupIndex].entries]
        };

        const activeItemIndex = sourceGroup.entries.findIndex(e => e.url === currentActiveId);
        if (activeItemIndex === -1) return;

        const [movedItem] = sourceGroup.entries.splice(activeItemIndex, 1);

        const overIsActualItem = targetGroup.entries.some(e => e.url === overId);
        const overItemIndex = overIsActualItem ? targetGroup.entries.findIndex(e => e.url === overId) : -1;

        const newIndexInTarget = overItemIndex >= 0 ? overItemIndex : targetGroup.entries.length;
        targetGroup.entries.splice(newIndexInTarget, 0, movedItem);

        newItemsState[sourceGroupIndex] = sourceGroup;
        newItemsState[targetGroupIndex] = targetGroup;

        setItems(newItemsState.map(g => ({
            ...g,
            entries: g.entries.filter(Boolean)
        })));
    };

    const onDragEnd = ({
                           active,
                           over
                       }: { active: any, over: any }) => {
        if (disabled) {
            setActiveId(null);
            setActiveIsGroup(false);
            setDraggingGroupId(null); // Clear dragging group ID
            return;
        }
        const currentActiveId = active.id;
        const overId = over?.id;

        if (!overId) {
            setActiveId(null);
            setActiveIsGroup(false);
            setDraggingGroupId(null);
            return;
        }

        if (activeIsGroup) {
            if (currentActiveId !== overId) {
                const activeGroupIndex = items.findIndex(g => g.name === currentActiveId);
                const overGroupIndex = items.findIndex(g => g.name === overId);

                if (activeGroupIndex !== -1 && overGroupIndex !== -1) {
                    setItems(arrayMove(items, activeGroupIndex, overGroupIndex));
                }
            }
        } else {
            // ... (item drag end logic remains the same) ...
            const activeContainerName = findContainer(currentActiveId);

            if (overId === "new-group-drop-zone") {
                if (activeContainerName) {
                    const sourceGroupIndex = items.findIndex(g => g.name === activeContainerName);
                    if (sourceGroupIndex === -1) {
                        setActiveId(null);
                        setActiveIsGroup(false);
                        setDraggingGroupId(null);
                        return;
                    }

                    const sourceGroup = items[sourceGroupIndex];
                    const activeItem = sourceGroup.entries.find(e => e.url === currentActiveId);

                    if (activeItem) {
                        let newGroupName = "New Group";
                        let counter = 1;
                        while (items.some(g => g.name === newGroupName) || containers.includes(newGroupName)) {
                            newGroupName = `New Group ${counter++}`;
                        }

                        const updatedItems = items.map((group, index) => {
                            if (index === sourceGroupIndex) {
                                return {
                                    ...group,
                                    entries: group.entries.filter(e => e.url !== currentActiveId)
                                };
                            }
                            return group;
                        });
                        const finalItems = updatedItems.filter(g => g.entries.length > 0 || g.name === sourceGroup.name || g.name === newGroupName);
                        finalItems.push({
                            name: newGroupName,
                            entries: [activeItem]
                        });
                        setItems(finalItems);
                    }
                }
                setActiveId(null);
                setActiveIsGroup(false);
                setDraggingGroupId(null);
                return;
            }

            const overContainerName = findContainer(overId);
            if (!activeContainerName || !overContainerName) {
                setActiveId(null);
                setActiveIsGroup(false);
                setDraggingGroupId(null);
                return;
            }

            const newItemsState = [...items];
            const sourceGroupIndex = newItemsState.findIndex(g => g.name === activeContainerName);
            const targetGroupIndex = newItemsState.findIndex(g => g.name === overContainerName);

            if (sourceGroupIndex === -1 || targetGroupIndex === -1) {
                setActiveId(null);
                setActiveIsGroup(false);
                setDraggingGroupId(null);
                return;
            }

            const sourceGroup = {
                ...newItemsState[sourceGroupIndex],
                entries: [...newItemsState[sourceGroupIndex].entries]
            };
            const activeItemIndex = sourceGroup.entries.findIndex(e => e.url === currentActiveId);
            if (activeItemIndex === -1) {
                setActiveId(null);
                setActiveIsGroup(false);
                setDraggingGroupId(null);
                return;
            }

            const [movedItem] = sourceGroup.entries.splice(activeItemIndex, 1);
            newItemsState[sourceGroupIndex] = sourceGroup;

            if (activeContainerName === overContainerName) {
                const overItemIndex = sourceGroup.entries.findIndex(e => e.url === overId);
                if (activeItemIndex !== overItemIndex && overItemIndex !== -1) {
                    sourceGroup.entries.splice(overItemIndex, 0, movedItem);
                } else if (overItemIndex === -1) {
                    sourceGroup.entries.push(movedItem);
                }
            } else {
                const targetGroup = {
                    ...newItemsState[targetGroupIndex],
                    entries: [...newItemsState[targetGroupIndex].entries]
                };
                const overIsActualItem = targetGroup.entries.some(e => e.url === overId);
                const overItemIndex = overIsActualItem ? targetGroup.entries.findIndex(e => e.url === overId) : -1;
                const newIndexInTarget = overItemIndex >= 0 ? overItemIndex : targetGroup.entries.length;

                if (!targetGroup.entries.find(e => e.url === movedItem.url)) {
                    targetGroup.entries.splice(newIndexInTarget, 0, movedItem);
                }
                newItemsState[targetGroupIndex] = targetGroup;
            }
            setItems(newItemsState.map(g => ({
                ...g,
                entries: g.entries.filter(Boolean)
            })));
        }
        setActiveId(null);
        setActiveIsGroup(false);
        setDraggingGroupId(null); // Clear dragging group ID
        recentlyMovedToNewContainer.current = false;
    };

    // ... (activeItemForOverlay and activeGroupData remain the same) ...
    const activeItemForOverlay = useMemo(() => {
        if (disabled || !activeId || activeIsGroup) return null;
        return items.flatMap(g => g.entries).find(e => e.url === activeId) || null;
    }, [activeId, items, disabled, activeIsGroup]);

    const activeGroupData = useMemo(() => {
        if (disabled || !activeId || !activeIsGroup) return null; // Only return data if a group is active
        return items.find(g => g.name === activeId) || null;
    }, [activeId, items, disabled, activeIsGroup]);

    return {
        sensors,
        collisionDetection,
        onDragStart,
        onDragOver,
        onDragEnd,
        dropAnimation, // Use updated dropAnimation
        activeItemForOverlay,
        activeGroupData,
        draggingGroupId, // Return this
        containers
    };
}

export function NewGroupDropZone({ disabled }: { disabled: boolean }) {
    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id: "new-group-drop-zone",
        disabled: disabled // Disable droppable when search is active
    });

    // Only render this when dragging is happening
    const [isVisible, setIsVisible] = useState(false);

    useDndMonitor({
        onDragStart() {
            if (!disabled) setIsVisible(true);
        },
        onDragEnd() {
            setIsVisible(false);
        },
        onDragCancel() {
            setIsVisible(false);
        }
    });

    if (!isVisible || disabled) return null; // Do not render if search is active

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
