import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Active,
    closestCenter,
    closestCorners,
    CollisionDetection,
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

const dropAnimationConfig: DropAnimation = { // Renamed to avoid conflict if imported elsewhere
    // duration: 200,
    // easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
    // sideEffects: defaultDropAnimationSideEffects({
    //     styles: {
    //         active: {
    //             opacity: "0.95",
    //             transform: "scale(1.0)",
    //             transition: "opacity 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22), transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)",
    //             boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)"
    //         },
    //         dragOverlay: {
    //             transform: "scale(1.03)",
    //             opacity: "0.20",
    //         }
    //     }
    // })
};

// Helper function to clone NavigationEntry with only serializable data
const cloneSerializableNavigationEntry = (entry: NavigationEntry): NavigationEntry => {
    const clonedEntry: Partial<NavigationEntry> = {
        id: entry.id, // Unique identifier for DND and React keys
        path: entry.path,
        url: entry.url, // url is used as id for SortableNavigationCard
        name: entry.name, // used for display and search
        type: entry.type, // Ensure type is cloned
        // Optional properties, ensure they are serializable if included
        ...(entry.group && { group: entry.group }),
        ...(entry.description && { description: entry.description }),
        ...(entry.collection && { collection: entry.collection }), // Preserve collection for icons/actions
        ...(entry.view && { view: entry.view }) // Preserve view for icons/actions
        // Add any other specific, serializable properties from NavigationEntry that are needed.
        // Avoid spreading the whole entry if it might contain non-serializable data.
        // For example, if entry has other known data fields like 'customData':
        // ...(entry.customData && { customData: JSON.parse(JSON.stringify(entry.customData)) }), // If customData itself is complex but serializable
    };
    return clonedEntry as NavigationEntry;
};

// Helper function to deep clone the items array safely
const cloneItemsForDnd = (items: { name: string, entries: NavigationEntry[] }[]): {
    name: string,
    entries: NavigationEntry[]
}[] => {
    return items.map(group => ({
        name: group.name,
        entries: group.entries.map(cloneSerializableNavigationEntry)
    }));
};

export function SortableNavigationCard({
                                           entry,
                                           onClick
                                       }: { entry: NavigationEntry, onClick?: () => void }) {
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

    // Memoize the style object to prevent unnecessary re-renders
    const style = useMemo(() => {
        return {
            transform: transform ? CSS.Transform.toString(transform) : undefined,
            transition,
            opacity: isDragging ? 0 : 1 // remove original while dragging
        };
    }, [transform, transition, isDragging]);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <NavigationCardBinding {...entry} onClick={onClick}/>
        </div>
    );
}

export function NavigationGroupDroppable({
                                             id,
                                             itemIds,
                                             children,
                                             isPotentialCardDropTarget = false
                                         }: {
    id: UniqueIdentifier;
    itemIds: UniqueIdentifier[];
    children: React.ReactNode;
    isPotentialCardDropTarget?: boolean
}) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={
                cls(isPotentialCardDropTarget
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
                                            children,
                                            disabled
                                        }: { groupName: string, children: React.ReactNode, disabled?: boolean }) { // Add disabled prop
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: groupName,
        animateLayoutChanges,
        disabled
    });

    // Memoize the style object to prevent unnecessary re-renders
    const style = useMemo(() => {
        return {
            transform: transform ? CSS.Transform.toString(transform) : undefined,
            transition,
            opacity: isDragging ? 0 : 1 // Hide original when dragging
        };
    }, [transform, transition, isDragging]);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

// Modify useHomePageDnd
export function useHomePageDnd({
                                   items: dndItems,
                                   setItems: setDndItems,
                                   disabled,
                                   onCardMovedBetweenGroups
                               }: {
    items: { name: string, entries: NavigationEntry[] }[],
    setItems: (newItemsOrUpdater: { name: string, entries: NavigationEntry[] }[] | ((currentItems: {
        name: string,
        entries: NavigationEntry[]
    }[]) => { name: string, entries: NavigationEntry[] }[])) => void,
    disabled: boolean,
    onCardMovedBetweenGroups?: (card: NavigationEntry, fromGroup: string, toGroup: string) => void
}) {

    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [activeIsGroup, setActiveIsGroup] = useState(false);
    const [currentDraggingGroupId, setCurrentDraggingGroupId] = useState<UniqueIdentifier | null>(null);
    const [dndKitActiveNode, setDndKitActiveNode] = useState<Active | null>(null);
    const [isDraggingCardOnly, setIsDraggingCardOnly] = useState(false);
    const [dialogOpenForGroup, setDialogOpenForGroup] = useState<string | null>(null);
    const [isHoveringNewGroupDropZone, setIsHoveringNewGroupDropZone] = useState(false);

    const dndContainers = useMemo(() => dndItems.map(group => group.name), [dndItems]);

    const mouseSensorInstance = useSensor(MouseSensor, { activationConstraint: { distance: 10 } });
    const touchSensorInstance = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 150,
            tolerance: 5
        }
    });
    const keyboardSensorInstance = useSensor(KeyboardSensor);

    const dndSensors = useSensors(
        ...(disabled
            ? []
            : [mouseSensorInstance, touchSensorInstance, keyboardSensorInstance])
    );

    const lastOverId = useRef<UniqueIdentifier | null>(null);
    const recentlyMovedToNewContainer = useRef(false);
    // Track last cross-group move for callback
    const lastCrossGroupMove = useRef<{ card: NavigationEntry, fromGroup: string, toGroup: string } | null>(null);

    const findDndContainer = useCallback((id: UniqueIdentifier): string | undefined => {
        if (!id) return undefined;
        const groupByName = dndItems.find(group => group.name === id);
        if (groupByName) return groupByName.name;
        for (const group of dndItems) {
            if (group.entries.some(e => e.url === id)) {
                return group.name;
            }
        }
        return undefined;
    }, [dndItems]);

    const dndCollisionDetection: CollisionDetection = useCallback((args) => {
        if (disabled || !activeId) return [];
        const isDraggingGroup = activeIsGroup;
        if (isDraggingGroup) {
            // Identify all containers that are actual groups
            const groupDroppables = args.droppableContainers.filter(container =>
                dndItems.some(group => group.name === container.id)
            );
            // If there are no group droppables, return an empty array
            if (!groupDroppables.length) return [];

            return closestCenter({ // Changed from closestCorners to closestCenter
                ...args,
                droppableContainers: groupDroppables // Pass all group droppables, including the active one's original position
            });
        } else {
            const pointerCollisions = pointerWithin(args);
            if (pointerCollisions.length > 0) {
                const newGroupZoneCollision = pointerCollisions.find(c => c.id === "new-group-drop-zone");
                if (newGroupZoneCollision) return [newGroupZoneCollision];
                const containerCollision = pointerCollisions.find(c => dndItems.some(g => g.name === c.id));
                if (containerCollision) {
                    const containerItems = dndItems.find(g => g.name === containerCollision.id)?.entries ?? [];
                    if (containerItems.length > 0) {
                        const closestItemInContainer = closestCorners({
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
                const overIsContainer = dndItems.some(g => g.name === overId);
                if (overIsContainer) {
                    const containerItems = dndItems.find(g => g.name === overId)?.entries ?? [];
                    if (containerItems.length) {
                        const closestItem = closestCorners({
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
    }, [activeId, dndItems, disabled, recentlyMovedToNewContainer, activeIsGroup]);

    const handleDragStart = ({ active }: { active: Active }) => {
        setDndKitActiveNode(active);
        if (disabled) return;
        const isGroup = dndItems.some(g => g.name === active.id);
        if (!active.data.current) {
            active.data.current = {};
        }
        active.data.current.type = isGroup ? "group" : "item";
        setActiveId(active.id);
        setActiveIsGroup(isGroup);
        setIsDraggingCardOnly(!isGroup);
        if (isGroup) {
            setCurrentDraggingGroupId(active.id);
        }
        recentlyMovedToNewContainer.current = false;
    };

    const handleDragOver = ({
                                active,
                                over
                            }: { active: Active, over: any }) => {
        if (disabled || !over) {
            return;
        }
        const currentActiveId = active.id;
        const currentOverId = over.id;

        if (currentActiveId === currentOverId) return;

        if (activeIsGroup) return; // Group dragging over logic is simpler, handled by SortableContext

        // Item dragging logic
        const activeElementContainerName = findDndContainer(currentActiveId);
        const overElementContainerName = findDndContainer(currentOverId);

        if (!activeElementContainerName) return;

        if (overElementContainerName && activeElementContainerName !== overElementContainerName) {
            recentlyMovedToNewContainer.current = true;
            setDndItems(currentItems => {
                const newItemsState = cloneItemsForDnd(currentItems);
                const sourceGroupIndex = newItemsState.findIndex(g => g.name === activeElementContainerName);
                const targetGroupIndex = newItemsState.findIndex(g => g.name === overElementContainerName);
                if (sourceGroupIndex === -1 || targetGroupIndex === -1) return currentItems;
                const sourceGroup = newItemsState[sourceGroupIndex];
                const targetGroup = newItemsState[targetGroupIndex];
                const activeItemIndexInSource = sourceGroup.entries.findIndex(e => e.url === currentActiveId);
                if (activeItemIndexInSource === -1) return currentItems;
                const [movedItem] = sourceGroup.entries.splice(activeItemIndexInSource, 1);
                targetGroup.entries.push(movedItem);
                // Track for callback in drag end
                lastCrossGroupMove.current = {
                    card: movedItem,
                    fromGroup: activeElementContainerName,
                    toGroup: overElementContainerName
                };
                return newItemsState.map(g => ({
                    ...g,
                    entries: g.entries.filter(Boolean)
                }));
            });
        } else if (activeElementContainerName === overElementContainerName) {
            recentlyMovedToNewContainer.current = false;
            lastCrossGroupMove.current = null;
        }
    };

    const handleDragEnd = ({
                               active,
                               over
                           }: { active: Active, over: any }) => {
        if (disabled || !over) {
            setDndKitActiveNode(null);
            setActiveId(null);
            setActiveIsGroup(false);
            setCurrentDraggingGroupId(null);
            setIsDraggingCardOnly(false);
            recentlyMovedToNewContainer.current = false;
            lastCrossGroupMove.current = null;
            return;
        }

        const currentActiveId = active.id;
        const currentOverId = over.id;

        if (activeIsGroup) {
            if (currentActiveId !== currentOverId && dndItems.some(g => g.name === currentOverId)) {
                const activeGroupIndex = dndItems.findIndex(g => g.name === currentActiveId);
                const overGroupIndex = dndItems.findIndex(g => g.name === currentOverId);
                if (activeGroupIndex !== -1 && overGroupIndex !== -1) {
                    setDndItems(currentItems => arrayMove(currentItems, activeGroupIndex, overGroupIndex));
                }
            }
        } else { // Dragging an item
            const activeContainerName = findDndContainer(currentActiveId);
            if (currentOverId === "new-group-drop-zone") {
                if (activeContainerName) {
                    let createdGroupName: string | null = null;
                    setDndItems(currentItems => {
                        const newItemsState = cloneItemsForDnd(currentItems);
                        const sourceGroupIndex = newItemsState.findIndex(g => g.name === activeContainerName);
                        if (sourceGroupIndex === -1) return currentItems;

                        const sourceGroup = newItemsState[sourceGroupIndex];
                        const activeItemIndex = sourceGroup.entries.findIndex(e => e.url === currentActiveId);
                        if (activeItemIndex === -1) return currentItems;

                        const [draggedItem] = sourceGroup.entries.splice(activeItemIndex, 1);

                        if (sourceGroup.entries.length === 0) {
                            newItemsState.splice(sourceGroupIndex, 1);
                        }

                        let newGroupNameAttempt = "New Group";
                        let groupNameCounter = 1;
                        while (newItemsState.some(g => g.name === newGroupNameAttempt)) {
                            newGroupNameAttempt = `New Group ${groupNameCounter++}`;
                        }
                        createdGroupName = newGroupNameAttempt;

                        newItemsState.push({
                            name: createdGroupName,
                            entries: [draggedItem]
                        });

                        // Add callback for new group creation
                        if (onCardMovedBetweenGroups) {
                            lastCrossGroupMove.current = {
                                card: draggedItem,
                                fromGroup: activeContainerName,
                                toGroup: createdGroupName
                            };
                        }

                        return newItemsState;
                    });
                    if (createdGroupName) {
                        console.log("[HomePageDnD] Attempting to open dialog for new group:", createdGroupName);
                        setDialogOpenForGroup(createdGroupName);
                    }
                }
            } else {
                const overContainerName = findDndContainer(currentOverId);
                if (!activeContainerName || !overContainerName) { /* Reset or error */
                } else if (activeContainerName === overContainerName) {
                    setDndItems(currentDndItems => {
                        const groupIndex = currentDndItems.findIndex(g => g.name === activeContainerName);
                        if (groupIndex === -1) return currentDndItems;
                        const group = currentDndItems[groupIndex];
                        if (!group) return currentDndItems;
                        const oldEntryIndex = group.entries.findIndex(e => e.url === currentActiveId);
                        let newEntryIndex = group.entries.findIndex(e => e.url === currentOverId);
                        if (newEntryIndex === -1 && currentOverId === activeContainerName) {
                            newEntryIndex = group.entries.length - 1;
                        }
                        if (oldEntryIndex !== -1 && newEntryIndex !== -1 && oldEntryIndex !== newEntryIndex) {
                            const reorderedEntries = arrayMove(group.entries, oldEntryIndex, newEntryIndex);
                            const newItemsState = [...currentDndItems];
                            newItemsState[groupIndex] = {
                                ...group,
                                entries: reorderedEntries
                            };
                            return newItemsState;
                        }
                        return currentDndItems;
                    });
                }
            }
        }

        setDndKitActiveNode(null);
        setActiveId(null);
        setActiveIsGroup(false);
        setCurrentDraggingGroupId(null);
        setIsDraggingCardOnly(false); // Reset isDraggingCardOnly
        recentlyMovedToNewContainer.current = false;

        // Execute the callback after state updates are performed
        if (!activeIsGroup && lastCrossGroupMove.current && onCardMovedBetweenGroups) {
            onCardMovedBetweenGroups(
                lastCrossGroupMove.current.card,
                lastCrossGroupMove.current.fromGroup,
                lastCrossGroupMove.current.toGroup
            );
            lastCrossGroupMove.current = null;
        }
    };

    const handleDragCancel = () => {
        setDndKitActiveNode(null);
        setActiveId(null);
        setActiveIsGroup(false);
        setCurrentDraggingGroupId(null);
        setIsDraggingCardOnly(false); // Reset isDraggingCardOnly
        recentlyMovedToNewContainer.current = false;
    };

    const activeItemForOverlay = useMemo(() => {
        if (disabled || !activeId || activeIsGroup) return null;
        return dndItems.flatMap(g => g.entries).find(e => e.url === activeId) || null;
    }, [activeId, dndItems, disabled, activeIsGroup]);

    const activeGroupData = useMemo(() => {
        if (disabled || !activeId || !activeIsGroup) return null;
        return dndItems.find(g => g.name === activeId) || null;
    }, [activeId, dndItems, disabled, activeIsGroup]);

    const handleRenameGroup = (oldName: string, newName: string) => {
        setDndItems(currentItems => {
            const groupIndex = currentItems.findIndex(g => g.name === oldName);
            if (groupIndex === -1) return currentItems;

            if (currentItems.some(g => g.name === newName && g.name !== oldName)) {
                // This case should ideally be prevented by the dialog's validation
                console.warn(`Group name "${newName}" already exists.`);
                return currentItems;
            }

            const updatedItems = [...currentItems];
            updatedItems[groupIndex] = {
                ...updatedItems[groupIndex],
                name: newName
            };
            return updatedItems;
        });
    };

    return {
        sensors: dndSensors,
        collisionDetection: dndCollisionDetection,
        onDragStart: handleDragStart,
        onDragOver: handleDragOver,
        onDragEnd: handleDragEnd,
        onDragCancel: handleDragCancel,
        dropAnimation: dropAnimationConfig,
        activeItemForOverlay,
        activeGroupData,
        draggingGroupId: currentDraggingGroupId,
        containers: dndContainers,
        dndKitActiveNode,
        isDraggingCardOnly,
        dialogOpenForGroup,
        setDialogOpenForGroup,
        handleRenameGroup,
        isHoveringNewGroupDropZone,
        setIsHoveringNewGroupDropZone
    };
}

export function NewGroupDropZone({
                                     disabled,
                                     setIsHovering
                                 }: { disabled: boolean, setIsHovering: (v: boolean) => void }) {
    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id: "new-group-drop-zone",
        disabled
    });
    const [isVisible, setIsVisible] = useState(false);
    useDndMonitor({
        onDragStart({ active }) { // Keep active here to check type
            if (!disabled) {
                // Only show if an item (not a group) is being dragged
                const activeType = active.data.current?.type;
                if (activeType === "item") {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            }
        },
        onDragEnd() {
            setIsVisible(false);
        },
        onDragCancel() {
            setIsVisible(false);
        }
    });
    React.useEffect(() => {
        setIsHovering(isOver && isVisible);
    }, [isOver, isVisible, setIsHovering]);
    if (!isVisible || disabled) return null;
    return (
        <div
            ref={setNodeRef}
            className={cls(
                "fixed right-8 top-1/2 -translate-y-1/2 w-[200px] h-[120px] border border-dashed rounded-lg flex items-center justify-center transition-all",
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
