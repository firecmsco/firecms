import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const dropAnimationConfig: DropAnimation = {};

const cloneSerializableNavigationEntry = (entry: NavigationEntry): NavigationEntry => {
    const clonedEntry: Partial<NavigationEntry> = {
        id: entry.id,
        path: entry.path,
        url: entry.url,
        name: entry.name,
        type: entry.type,
        ...(entry.group && { group: entry.group }),
        ...(entry.description && { description: entry.description })
    };
    return clonedEntry as NavigationEntry;
};

const cloneItemsForDnd = (items: { name: string; entries: NavigationEntry[] }[]) =>
    items.map((g) => ({
        name: g.name,
        entries: g.entries.map(cloneSerializableNavigationEntry)
    }));

export function SortableNavigationCard({
                                           entry,
                                           onClick
                                       }: {
    entry: NavigationEntry;
    onClick?: () => void;
}) {
    const {
        setNodeRef,
        listeners,
        attributes,
        transform,
        transition,
        isDragging
    } =
        useSortable({
            id: entry.url,
            animateLayoutChanges
        });

    const style = useMemo(
        () => ({
            transform: transform ? CSS.Transform.toString(transform) : undefined,
            transition,
            opacity: isDragging ? 0 : 1
        }),
        [transform, transition, isDragging]
    );

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
    isPotentialCardDropTarget?: boolean;
}) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={cls(
                isPotentialCardDropTarget
                    ? "p-2 bg-surface-accent-200 dark:bg-surface-accent-800 rounded-lg"
                    : undefined,
                "transition-all duration-200 ease-in-out"
            )}
        >
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
                                        }: {
    groupName: string;
    children: React.ReactNode;
    disabled?: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } =
        useSortable({
            id: groupName,
            animateLayoutChanges,
            disabled
        });

    const style = useMemo(
        () => ({
            transform: transform ? CSS.Transform.toString(transform) : undefined,
            transition,
            opacity: isDragging ? 0 : 1
        }),
        [transform, transition, isDragging]
    );

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

export function useHomePageDnd({
                                   items: dndItems,
                                   setItems: setDndItems,
                                   disabled,
                                   onCardMoved,
                                   onGroupMoved,
                                   onNewGroupDrop,
                                   onPersist // ⇢ onPersist
                               }: {
    items: { name: string; entries: NavigationEntry[] }[];
    setItems: (
        newItemsOrUpdater:
            | { name: string; entries: NavigationEntry[] }[]
            | ((
            currentItems: { name: string; entries: NavigationEntry[] }[]
        ) => { name: string; entries: NavigationEntry[] }[])
    ) => void;
    disabled: boolean;
    onCardMoved?: (card: NavigationEntry) => void;
    onGroupMoved?: (groupName: string, oldIndex: number, newIndex: number) => void;
    onNewGroupDrop?: () => void;
    onPersist?: (
        latest: { name: string; entries: NavigationEntry[] }[]
    ) => void; // ⇢ onPersist
}) {
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [activeIsGroup, setActiveIsGroup] = useState(false);
    const [currentDraggingGroupId, setCurrentDraggingGroupId] =
        useState<UniqueIdentifier | null>(null);
    const [dndKitActiveNode, setDndKitActiveNode] = useState<Active | null>(null);
    const [isDraggingCardOnly, setIsDraggingCardOnly] = useState(false);
    const [dialogOpenForGroup, setDialogOpenForGroup] = useState<string | null>(null);
    const [isHoveringNewGroupDropZone, setIsHoveringNewGroupDropZone] = useState(false);

    const interimItemsRef = useRef<
        { name: string; entries: NavigationEntry[] }[] | null
    >(null); // ⇢ onPersist helper
    useEffect(() => {
        interimItemsRef.current = dndItems;
    }, [dndItems]);

    const dndContainers = useMemo(
        () => dndItems.map((group) => group.name),
        [dndItems]
    );

    const mouseSensorInstance = useSensor(MouseSensor, {
        activationConstraint: { distance: 10 }
    });
    const touchSensorInstance = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 150,
            tolerance: 5
        }
    });
    const keyboardSensorInstance = useSensor(KeyboardSensor);

    const dndSensors = useSensors(
        ...(disabled ? [] : [mouseSensorInstance, touchSensorInstance, keyboardSensorInstance])
    );

    const lastOverId = useRef<UniqueIdentifier | null>(null);
    const recentlyMovedToNewContainer = useRef(false);

    const findDndContainer = useCallback(
        (id: UniqueIdentifier): string | undefined => {
            if (!id) return undefined;
            const groupByName = dndItems.find((group) => group.name === id);
            if (groupByName) return groupByName.name;
            for (const group of dndItems) {
                if (group.entries.some((e) => e.url === id)) {
                    return group.name;
                }
            }
            return undefined;
        },
        [dndItems]
    );

    // --- collision detection (unchanged) ----------------------------------
    const dndCollisionDetection: CollisionDetection = useCallback(
        (args) => {
            if (disabled || !activeId) return [];
            const isDraggingGroup = activeIsGroup;
            if (isDraggingGroup) {
                const groupDroppables = args.droppableContainers.filter((c) =>
                    dndItems.some((g) => g.name === c.id)
                );
                if (!groupDroppables.length) return [];
                return closestCenter({
                    ...args,
                    droppableContainers: groupDroppables
                });
            }
            // cards
            const pointerCollisions = pointerWithin(args);
            if (pointerCollisions.length) {
                const zone = pointerCollisions.find((c) => c.id === "new-group-drop-zone");
                if (zone) return [zone];
                const container = pointerCollisions.find((c) =>
                    dndItems.some((g) => g.name === c.id)
                );
                if (container) {
                    const itemsIn = dndItems.find((g) => g.name === container.id)?.entries ?? [];
                    if (itemsIn.length) {
                        const closestItem = closestCorners({
                            ...args,
                            droppableContainers: args.droppableContainers.filter((dc) =>
                                itemsIn.some((e) => e.url === dc.id)
                            )
                        });
                        if (closestItem.length) return closestItem;
                    }
                    return [container];
                }
                const first = getFirstCollision(pointerCollisions, "id");
                if (first) return [{ id: first }];
            }
            const rectCollisions = rectIntersection(args);
            const zoneRect = rectCollisions.find((c) => c.id === "new-group-drop-zone");
            if (zoneRect) return [zoneRect];
            let overId = getFirstCollision(rectCollisions, "id");
            if (overId != null) {
                const overIsContainer = dndItems.some((g) => g.name === overId);
                if (overIsContainer) {
                    const itemsIn = dndItems.find((g) => g.name === overId)?.entries ?? [];
                    if (itemsIn.length) {
                        const closestItem = closestCorners({
                            ...args,
                            droppableContainers: args.droppableContainers.filter((c) =>
                                itemsIn.some((e) => e.url === c.id)
                            )
                        })[0]?.id;
                        if (closestItem) overId = closestItem;
                    }
                }
                lastOverId.current = overId;
                return [{ id: overId }];
            }
            if (recentlyMovedToNewContainer.current && lastOverId.current && !isDraggingGroup)
                return [{ id: lastOverId.current }];
            return [];
        },
        [activeId, dndItems, disabled, recentlyMovedToNewContainer, activeIsGroup]
    );
    // ----------------------------------------------------------------------

    const handleDragStart = ({ active }: { active: Active }) => {
        setDndKitActiveNode(active);
        if (disabled) return;
        const isGroup = dndItems.some((g) => g.name === active.id);
        if (!active.data.current) active.data.current = {};
        active.data.current.type = isGroup ? "group" : "item";
        setActiveId(active.id);
        setActiveIsGroup(isGroup);
        setIsDraggingCardOnly(!isGroup);
        if (isGroup) setCurrentDraggingGroupId(active.id);
        recentlyMovedToNewContainer.current = false;
    };

    const handleDragOver = ({
                                active,
                                over
                            }: { active: Active; over: any }) => {
        if (disabled || !over) return;

        const currentActiveId = active.id;
        const currentOverId = over.id;
        if (currentActiveId === currentOverId) return;
        if (activeIsGroup) return;

        const activeContainer = findDndContainer(currentActiveId);
        const overContainer = findDndContainer(currentOverId);
        if (!activeContainer) return;

        // card moved to another container
        if (overContainer && activeContainer !== overContainer) {
            recentlyMovedToNewContainer.current = true;
            const newState = cloneItemsForDnd(dndItems);
            const srcIdx = newState.findIndex((g) => g.name === activeContainer);
            const tgtIdx = newState.findIndex((g) => g.name === overContainer);
            if (srcIdx === -1 || tgtIdx === -1) return;
            const src = newState[srcIdx];
            const tgt = newState[tgtIdx];
            const idxInSrc = src.entries.findIndex((e) => e.url === currentActiveId);
            if (idxInSrc === -1) return;
            const [moved] = src.entries.splice(idxInSrc, 1);
            tgt.entries.push(moved);
            interimItemsRef.current = newState; // ⇢ keep for onPersist
            setDndItems(newState);
        } else if (activeContainer === overContainer) {
            recentlyMovedToNewContainer.current = false;
        }
    };

    const handleDragEnd = ({
                               active,
                               over
                           }: { active: Active; over: any }) => {
        if (disabled || !over) {
            resetDragState();
            return;
        }

        const currentActiveId = active.id;
        const currentOverId = over.id;

        if (activeIsGroup) {
            if (currentActiveId !== currentOverId && dndItems.some((g) => g.name === currentOverId)) {
                const from = dndItems.findIndex((g) => g.name === currentActiveId);
                const to = dndItems.findIndex((g) => g.name === currentOverId);
                if (from !== -1 && to !== -1) {
                    const newState = arrayMove(dndItems, from, to);
                    setDndItems(newState);
                    onPersist?.(newState); // ⇢ onPersist
                    onGroupMoved?.(currentActiveId as string, from, to);
                }
            }
        } else {
            const activeContainer = findDndContainer(currentActiveId);

            if (currentOverId === "new-group-drop-zone") {
                if (activeContainer) {
                    const newState = cloneItemsForDnd(dndItems);
                    const srcIdx = newState.findIndex((g) => g.name === activeContainer);
                    if (srcIdx !== -1) {
                        const src = newState[srcIdx];
                        const idxInSrc = src.entries.findIndex((e) => e.url === currentActiveId);
                        if (idxInSrc !== -1) {
                            const [dragged] = src.entries.splice(idxInSrc, 1);
                            if (src.entries.length === 0) newState.splice(srcIdx, 1);

                            let tentative = "New Group";
                            let c = 1;
                            while (newState.some((g) => g.name === tentative))
                                tentative = `New Group ${c++}`;
                            newState.push({
                                name: tentative,
                                entries: [dragged]
                            });

                            setDndItems(newState);
                            onPersist?.(newState); // ⇢ onPersist
                            setDialogOpenForGroup(tentative);
                            onNewGroupDrop?.();
                        }
                    }
                }
            } else {
                const overContainer = findDndContainer(currentOverId);
                if (activeContainer === overContainer) {
                    const grpIdx = dndItems.findIndex((g) => g.name === activeContainer);
                    if (grpIdx !== -1) {
                        const group = dndItems[grpIdx];
                        const oldIdx = group.entries.findIndex((e) => e.url === currentActiveId);
                        let newIdx = group.entries.findIndex((e) => e.url === currentOverId);
                        if (newIdx === -1 && currentOverId === activeContainer)
                            newIdx = group.entries.length - 1;
                        if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
                            const reordered = arrayMove(group.entries, oldIdx, newIdx);
                            const newState = [...dndItems];
                            newState[grpIdx] = {
                                ...group,
                                entries: reordered
                            };
                            setDndItems(newState);
                            onPersist?.(newState); // ⇢ onPersist
                        }
                    }
                } else if (recentlyMovedToNewContainer.current && interimItemsRef.current) {
                    // card moved to different group during drag-over
                    onPersist?.(interimItemsRef.current); // ⇢ onPersist
                }

                onCardMoved?.(
                    dndItems.flatMap((g) => g.entries).find((e) => e.url === currentActiveId)!
                );
            }
        }

        resetDragState();
    };

    const resetDragState = () => {
        setDndKitActiveNode(null);
        setActiveId(null);
        setActiveIsGroup(false);
        setCurrentDraggingGroupId(null);
        setIsDraggingCardOnly(false);
        recentlyMovedToNewContainer.current = false;
    };

    const handleDragCancel = () => resetDragState();

    const activeItemForOverlay = useMemo(() => {
        if (disabled || !activeId || activeIsGroup) return null;
        return dndItems.flatMap((g) => g.entries).find((e) => e.url === activeId) || null;
    }, [activeId, dndItems, disabled, activeIsGroup]);

    const activeGroupData = useMemo(() => {
        if (disabled || !activeId || !activeIsGroup) return null;
        return dndItems.find((g) => g.name === activeId) || null;
    }, [activeId, dndItems, disabled, activeIsGroup]);

    const handleRenameGroup = (oldName: string, newName: string) => {
        setDndItems((current) => {
            const idx = current.findIndex((g) => g.name === oldName);
            if (idx === -1 || current.some((g) => g.name === newName && g.name !== oldName))
                return current;
            const updated = [...current];
            updated[idx] = {
                ...updated[idx],
                name: newName
            };
            return updated;
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

// NewGroupDropZone component is unchanged
export function NewGroupDropZone({
                                     disabled,
                                     setIsHovering
                                 }: {
    disabled: boolean;
    setIsHovering: (v: boolean) => void;
}) {
    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id: "new-group-drop-zone",
        disabled
    });
    const [isVisible, setIsVisible] = useState(false);
    useDndMonitor({
        onDragStart({ active }) {
            if (!disabled) {
                const activeType = active.data.current?.type;
                setIsVisible(activeType === "item");
            }
        },
        onDragEnd() {
            setIsVisible(false);
        },
        onDragCancel() {
            setIsVisible(false);
        }
    });
    useEffect(() => {
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
