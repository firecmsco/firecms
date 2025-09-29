import React, { useCallback, useEffect, useRef, useState } from "react";
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
        collection: entry.collection ? { ...entry.collection } : undefined,
        view: entry.view ? { ...entry.view } : undefined,
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

/* ─────────────────────────────────────────────────────────── */
/* Sortable card & group                                       */

/* ─────────────────────────────────────────────────────────── */
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

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
        opacity: isDragging ? 0 : 1
    };

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

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
        opacity: isDragging ? 0 : 1
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── */
/* Main DnD hook                                               */

/* ─────────────────────────────────────────────────────────── */
export function useHomePageDnd({
                                   items: dndItems,
                                   setItems: setDndItems,
                                   disabled,
                                   onCardMovedBetweenGroups,
                                   onGroupMoved,
                                   onNewGroupDrop,
                                   onPersist
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
    onCardMovedBetweenGroups?: (card: NavigationEntry) => void;
    onGroupMoved?: (groupName: string, oldIndex: number, newIndex: number) => void;
    onNewGroupDrop?: () => void;
    onPersist?: (latest: { name: string; entries: NavigationEntry[] }[]) => void;
}) {
    /* ---------------- local state ---------------- */
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [activeIsGroup, setActiveIsGroup] = useState(false);
    const [currentDraggingGroupId, setCurrentDraggingGroupId] =
        useState<UniqueIdentifier | null>(null);
    const [dndKitActiveNode, setDndKitActiveNode] = useState<Active | null>(null);
    const [isDraggingCardOnly, setIsDraggingCardOnly] = useState(false);
    const [dialogOpenForGroup, setDialogOpenForGroup] = useState<string | null>(null);
    const [isHoveringNewGroupDropZone, setIsHoveringNewGroupDropZone] =
        useState(false);

    /* store interim state for cross-group moves */
    const interimItemsRef = useRef<
        { name: string; entries: NavigationEntry[] }[] | null
    >(null);
    useEffect(() => {
        interimItemsRef.current = dndItems;
    }, [dndItems]);

    /* ---------------- sensors ---------------- */
    const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } });
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 150,
            tolerance: 5
        }
    });
    const keyboardSensor = useSensor(KeyboardSensor);
    const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

    /* ---------------- helpers ---------------- */
    const dndContainers = dndItems.map((g) => g.name);

    const findDndContainer = useCallback(
        (id: UniqueIdentifier): string | undefined => {
            if (!id) return undefined;
            const group = dndItems.find((g) => g.name === id);
            if (group) return group.name;
            for (const g of dndItems) {
                if (g.entries.some((e) => e.url === id)) return g.name;
            }
            return undefined;
        },
        [dndItems]
    );

    /* ---------------- collision detection ---------------- */
    const lastOverId = useRef<UniqueIdentifier | null>(null);
    const recentlyMovedToNewContainer = useRef(false);

    const collisionDetection: CollisionDetection = useCallback(
        (args) => {
            if (disabled || !activeId) return [];
            if (activeIsGroup) {
                const groups = args.droppableContainers.filter((c) =>
                    dndItems.some((g) => g.name === c.id)
                );
                if (!groups.length) return [];
                return closestCenter({
                    ...args,
                    droppableContainers: groups
                });
            }

            const pointer = pointerWithin(args);
            if (pointer.length) {
                const zone = pointer.find((c) => c.id === "new-group-drop-zone");
                if (zone) return [zone];

                const container = pointer.find((c) =>
                    dndItems.some((g) => g.name === c.id)
                );
                if (container) {
                    const itemsIn = dndItems.find((g) => g.name === container.id)
                        ?.entries;
                    if (itemsIn?.length) {
                        const closest = closestCorners({
                            ...args,
                            droppableContainers: args.droppableContainers.filter(
                                (c) => itemsIn.some((e) => e.url === c.id)
                            )
                        });
                        if (closest.length) return closest;
                    }
                    return [container];
                }
                const first = getFirstCollision(pointer, "id");
                if (first) return [{ id: first }];
            }

            const rects = rectIntersection(args);
            const zoneRect = rects.find((c) => c.id === "new-group-drop-zone");
            if (zoneRect) return [zoneRect];

            let overId = getFirstCollision(rects, "id");
            if (overId != null) {
                const overIsContainer = dndItems.some((g) => g.name === overId);
                if (overIsContainer) {
                    const itemsIn = dndItems.find((g) => g.name === overId)
                        ?.entries;
                    if (itemsIn?.length) {
                        const closestItem = closestCorners({
                            ...args,
                            droppableContainers: args.droppableContainers.filter(
                                (c) => itemsIn.some((e) => e.url === c.id)
                            )
                        })[0]?.id;
                        if (closestItem) overId = closestItem;
                    }
                }
                lastOverId.current = overId;
                return [{ id: overId }];
            }

            if (
                recentlyMovedToNewContainer.current &&
                lastOverId.current &&
                !activeIsGroup
            )
                return [{ id: lastOverId.current }];

            return [];
        },
        [activeId, dndItems, disabled, activeIsGroup]
    );

    /* ---------------- drag handlers ---------------- */
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

        const activeIdNow = active.id;
        const overIdNow = over.id;
        if (activeIdNow === overIdNow) return;
        if (activeIsGroup) return;

        const activeCont = findDndContainer(activeIdNow);
        const overCont = findDndContainer(overIdNow);
        if (!activeCont) return;

        if (overCont && activeCont !== overCont) {
            recentlyMovedToNewContainer.current = true;
            const newState = cloneItemsForDnd(dndItems);
            const srcIdx = newState.findIndex((g) => g.name === activeCont);
            const tgtIdx = newState.findIndex((g) => g.name === overCont);
            if (srcIdx === -1 || tgtIdx === -1) return;
            const src = newState[srcIdx];
            const tgt = newState[tgtIdx];
            const idxInSrc = src.entries.findIndex((e) => e.url === activeIdNow);
            if (idxInSrc === -1) return;
            const [moved] = src.entries.splice(idxInSrc, 1);
            tgt.entries.push(moved);
            interimItemsRef.current = newState;
            setDndItems(newState);
        } else if (activeCont === overCont) {
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

        const activeIdNow = active.id;
        const overIdNow = over.id;

        /* ─── group reorder ─── */
        if (activeIsGroup) {
            if (
                activeIdNow !== overIdNow &&
                dndItems.some((g) => g.name === overIdNow)
            ) {
                const from = dndItems.findIndex((g) => g.name === activeIdNow);
                const to = dndItems.findIndex((g) => g.name === overIdNow);
                if (from !== -1 && to !== -1) {
                    const newState = arrayMove(dndItems, from, to);
                    setDndItems(newState);
                    onPersist?.(newState);
                    onGroupMoved?.(activeIdNow as string, from, to);
                }
            }
        }
        /* ─── card move ─── */
        else {
            const activeCont = findDndContainer(activeIdNow);

            /* drop on new-group zone */
            if (overIdNow === "new-group-drop-zone") {
                if (activeCont) {
                    const newState = cloneItemsForDnd(dndItems);
                    const srcIdx = newState.findIndex((g) => g.name === activeCont);
                    if (srcIdx !== -1) {
                        const src = newState[srcIdx];
                        const idxInSrc = src.entries.findIndex(
                            (e) => e.url === activeIdNow
                        );
                        if (idxInSrc !== -1) {
                            const [dragged] = src.entries.splice(idxInSrc, 1);
                            if (src.entries.length === 0) newState.splice(srcIdx, 1);

                            let tentative = "New Group";
                            let counter = 1;
                            while (newState.some((g) => g.name === tentative))
                                tentative = `New Group ${counter++}`;

                            newState.push({
                                name: tentative,
                                entries: [dragged]
                            });
                            setDndItems(newState);
                            onPersist?.(newState);
                            setDialogOpenForGroup(tentative);
                            onNewGroupDrop?.();
                        }
                    }
                }
            }
            /* reorder inside same container */
            else {
                const overCont = findDndContainer(overIdNow);
                if (activeCont === overCont) {
                    const grpIdx = dndItems.findIndex((g) => g.name === activeCont);
                    if (grpIdx !== -1) {
                        const group = dndItems[grpIdx];
                        const oldIdx = group.entries.findIndex(
                            (e) => e.url === activeIdNow
                        );
                        let newIdx = group.entries.findIndex(
                            (e) => e.url === overIdNow
                        );
                        if (newIdx === -1 && overIdNow === activeCont)
                            newIdx = group.entries.length - 1;
                        if (
                            oldIdx !== -1 &&
                            newIdx !== -1 &&
                            oldIdx !== newIdx
                        ) {
                            const reordered = arrayMove(group.entries, oldIdx, newIdx);
                            const newState = [...dndItems];
                            newState[grpIdx] = {
                                ...group,
                                entries: reordered
                            };
                            setDndItems(newState);
                            onPersist?.(newState);
                        }
                    }
                } else if (
                    recentlyMovedToNewContainer.current &&
                    interimItemsRef.current
                ) {
                    onPersist?.(interimItemsRef.current);
                }

                onCardMovedBetweenGroups?.(
                    dndItems
                        .flatMap((g) => g.entries)
                        .find((e) => e.url === activeIdNow)!
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

    /* ---------------- group rename ---------------- */
    const handleRenameGroup = (oldName: string, newName: string) => {
        setDndItems((current) => {
            const idx = current.findIndex((g) => g.name === oldName);
            if (idx === -1) return current;
            if (current.some((g) => g.name === newName && g.name !== oldName))
                return current;

            const updated = [...current];
            updated[idx] = {
                ...updated[idx],
                name: newName
            };
            onPersist?.(updated); // <- ensure rename is saved
            return updated;
        });
        setDialogOpenForGroup(null);
    };

    /* ---------------- public API ---------------- */
    const activeItemForOverlay =
        disabled || !activeId || activeIsGroup
            ? null
            : dndItems.flatMap((g) => g.entries).find((e) => e.url === activeId) || null;

    const activeGroupData =
        disabled || !activeId || !activeIsGroup
            ? null
            : dndItems.find((g) => g.name === activeId) || null;

    return {
        sensors,
        collisionDetection,
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

/* ─────────────────────────────────────────────────────────── */
/* New-group drop-zone component                               */

/* ─────────────────────────────────────────────────────────── */
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
            if (disabled) return;
            const tp = active.data.current?.type;
            setIsVisible(tp === "item");
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
