import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Container, SearchBar } from "@firecms/ui";
import {
    useCollapsedGroups,
    useCustomizationController,
    useFireCMSContext,
    useNavigationStateController
} from "../../hooks";
import {
    CMSAnalyticsEvent,
    NavigationEntry,
    NavigationGroupMapping,
    PluginGenericProps,
    PluginHomePageAdditionalCardsProps
} from "@firecms/types";
import { FavouritesView } from "./FavouritesView";
import { useRestoreScroll } from "../../internal/useRestoreScroll";
import { NavigationGroup } from "./NavigationGroup";
import {
    NavigationGroupDroppable,
    NewGroupDropZone,
    SortableNavigationCard,
    SortableNavigationGroup,
    useHomePageDnd
} from "./HomePageDnD";
import { DndContext, DragOverlay, MeasuringStrategy } from "@dnd-kit/core";
import { NavigationCardBinding } from "./NavigationCardBinding";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { RenameGroupDialog } from "./RenameGroupDialog";
import { toArray } from "@firecms/common";

export const DEFAULT_GROUP_NAME = "Views";
export const ADMIN_GROUP_NAME = "Admin";

export function DefaultHomePage({
    additionalActions,
    additionalChildrenStart,
    additionalChildrenEnd
}: {
    additionalActions?: React.ReactNode;
    additionalChildrenStart?: React.ReactNode;
    additionalChildrenEnd?: React.ReactNode;
}) {

    const context = useFireCMSContext();
    const customizationController = useCustomizationController();
    const navigationController = useNavigationStateController();

    if (!navigationController.topLevelNavigation)
        throw Error("Navigation not ready");

    const {
        allowDragAndDrop,
        navigationEntries: rawNavigationEntries,
        groups: groupOrderFromNavController,
        onNavigationEntriesUpdate
    } = navigationController.topLevelNavigation;

    const fuse = useRef<Fuse<NavigationEntry> | null>(null);
    const [filteredUrls, setFilteredUrls] = useState<string[] | null>(null);
    const performingSearch = Boolean(filteredUrls);

    // Memoize filtered navigation entries to prevent unnecessary recalculations
    const filteredNavigationEntries = useMemo(() => {
        return filteredUrls
            ? rawNavigationEntries.filter((e) => filteredUrls.includes(e.url))
            : rawNavigationEntries;
    }, [filteredUrls, rawNavigationEntries]);

    useEffect(() => {
        fuse.current = new Fuse(rawNavigationEntries, {
            keys: ["name", "description", "group", "path"]
        });
    }, [rawNavigationEntries]);

    const updateSearch = useCallback((v?: string) => {
        if (!v?.trim()) {
            setFilteredUrls(null);
            return;
        }
        const results = fuse.current?.search(v.trim());
        setFilteredUrls(results ? results.map((x) => x.item.url) : []);
    }, []);

    /* ───────────────────────────────────────────────────────────────
       Build groups (all items) + isolate Admin
       ─────────────────────────────────────────────────────────────── */
    const [items, setItems] = useState<
        { name: string; entries: NavigationEntry[] }[]
    >([]);
    const [adminGroupData, setAdminGroupData] = useState<{
        name: string;
        entries: NavigationEntry[];
    } | null>(null);

    // Flag to prevent useEffect from overwriting local DnD state
    const isDndDirtyRef = useRef(false);
    const dndDirtyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Memoize the processed groups to avoid unnecessary recalculations
    const processedGroups = useMemo(() => {
        const src = filteredNavigationEntries;
        const entriesByGroup: Record<string, NavigationEntry[]> = {};

        src.forEach((e) => {
            const g =
                e.type === "admin"
                    ? ADMIN_GROUP_NAME
                    : e.group ?? DEFAULT_GROUP_NAME;
            (entriesByGroup[g] ??= []).push(e);
        });

        // Check if there are custom actions from plugins that should show in the default group
        const hasPluginAdditionalCards = customizationController.plugins?.some(p => p.homePage?.AdditionalCards);

        let allProcessed: { name: string; entries: NavigationEntry[] }[];

        if (performingSearch) {
            const ordered = [
                ...new Set(src.map((e) => e.group ?? DEFAULT_GROUP_NAME))
            ];
            allProcessed = ordered
                .map((name) => ({
                    name,
                    entries: entriesByGroup[name] || []
                }))
                .filter((g) => g.entries.length);
        } else {
            allProcessed = groupOrderFromNavController.map((g) => ({
                name: g,
                entries: entriesByGroup[g] || []
            }));
            Object.keys(entriesByGroup).forEach((g) => {
                if (!groupOrderFromNavController.includes(g))
                    allProcessed.push({
                        name: g,
                        entries: entriesByGroup[g]
                    });
            });

            // Ensure default group exists if there are plugin additional cards but no collections
            if (hasPluginAdditionalCards && !allProcessed.some(g => g.name === DEFAULT_GROUP_NAME)) {
                allProcessed.push({
                    name: DEFAULT_GROUP_NAME,
                    entries: []
                });
            }

            allProcessed = allProcessed.filter(
                (g) =>
                    g.entries.length ||
                    (g.name === DEFAULT_GROUP_NAME && hasPluginAdditionalCards)
            );
        }

        const admin = allProcessed.find((g) => g.name === ADMIN_GROUP_NAME);
        return {
            adminGroupData: admin || null,
            items: allProcessed.filter((g) => g.name !== ADMIN_GROUP_NAME)
        };
    }, [filteredNavigationEntries, performingSearch, groupOrderFromNavController, customizationController.plugins]);

    // Update state only when processedGroups actually changes
    // Skip update if DnD just made a local change (dirty flag is set)
    useEffect(() => {
        if (isDndDirtyRef.current) {
            // DnD just updated the state, skip this sync
            return;
        }
        setAdminGroupData(processedGroups.adminGroupData);
        setItems(processedGroups.items);
    }, [processedGroups]);

    /* ───────────────────────────────────────────────────────────────
       Local update vs. persistence helpers
       ─────────────────────────────────────────────────────────────── */
    const updateItems = (
        updater:
            | { name: string; entries: NavigationEntry[] }[]
            | ((
                prev: { name: string; entries: NavigationEntry[] }[]
            ) => { name: string; entries: NavigationEntry[] }[])
    ) => {
        setItems(updater); // local only
    };

    const persistNavigationGroups = (
        latest: { name: string; entries: NavigationEntry[] }[]
    ) => {
        // Set dirty flag to prevent useEffect from overwriting local state
        isDndDirtyRef.current = true;

        // Clear any existing timeout
        if (dndDirtyTimeoutRef.current) {
            clearTimeout(dndDirtyTimeoutRef.current);
        }

        // Clear dirty flag after a delay to allow navigation to update
        dndDirtyTimeoutRef.current = setTimeout(() => {
            isDndDirtyRef.current = false;
        }, 1000);

        // Map ALL groups including "Views"
        const draggable: NavigationGroupMapping[] = latest.map((g) => ({
            name: g.name,
            entries: g.entries.map((e) => e.slug)
        }));

        const all: NavigationGroupMapping[] = adminGroupData
            ? [
                ...draggable,
                {
                    name: adminGroupData.name,
                    entries: adminGroupData.entries.map((e) => e.slug)
                }
            ]
            : draggable;

        onNavigationEntriesUpdate(all);
    };

    // Use custom hook for collapsed groups with localStorage persistence
    const groupNames = useMemo(() => [
        ...items.map(item => item.name),
        ...(adminGroupData ? [adminGroupData.name] : [])
    ], [items, adminGroupData]);

    const { isGroupCollapsed, toggleGroupCollapsed } = useCollapsedGroups(groupNames, "home");


    const {
        sensors,
        collisionDetection,
        onDragStart,
        onDragOver,
        onDragEnd,
        dropAnimation,
        activeItemForOverlay,
        activeGroupData,
        draggingGroupId,
        containers,
        dndKitActiveNode,
        onDragCancel,
        isDraggingCardOnly,
        dialogOpenForGroup,
        setDialogOpenForGroup,
        handleRenameGroup,
        handleDialogClose,
        isHoveringNewGroupDropZone,
        setIsHoveringNewGroupDropZone
    } = useHomePageDnd({
        items,
        setItems: updateItems,
        disabled: !allowDragAndDrop || performingSearch,
        onPersist: persistNavigationGroups,
        onGroupMoved: (g) =>
            context.analyticsController?.onAnalyticsEvent?.("home_move_group", {
                name: g
            }),
        onCardMovedBetweenGroups: (card) =>
            context.analyticsController?.onAnalyticsEvent?.("home_move_card", {
                id: card.id
            }),
        onNewGroupDrop: () =>
            context.analyticsController?.onAnalyticsEvent?.(
                "home_drop_new_group"
            )
    });

    const {
        containerRef,
        direction
    } = useRestoreScroll();

    const dndDisabled = !allowDragAndDrop || performingSearch;

    const dndModifiers = dndKitActiveNode?.data.current?.type === "group"
        ? [restrictToVerticalAxis, restrictToWindowEdges]
        : [restrictToWindowEdges];

    /* ───────────────────────────────────────────────────────────────
       Plugin extras
       ─────────────────────────────────────────────────────────────── */
    let additionalPluginChildrenStart: React.ReactNode | undefined;
    let additionalPluginChildrenEnd: React.ReactNode | undefined;
    let additionalPluginSections: React.ReactNode | undefined;
    let additionalPluginActions: React.ReactNode | undefined;

    if (customizationController.plugins) {
        const sectionProps: PluginGenericProps = { context };

        additionalPluginSections = (
            <>
                {customizationController.plugins
                    .filter((p) => p.homePage?.includeSection)
                    .map((plugin) => {
                        const section = plugin.homePage!.includeSection!(
                            sectionProps
                        );
                        return (
                            <NavigationGroup
                                group={section.title}
                                key={`plugin_section_${plugin.key}`}
                            >
                                {section.children}
                            </NavigationGroup>
                        );
                    })}
            </>
        );

        additionalPluginChildrenStart = (
            <div className="flex flex-col gap-2">
                {customizationController.plugins
                    .filter((p) => p.homePage?.additionalChildrenStart)
                    .map((plugin, i) => (
                        <div key={`plugin_children_start_${i}`}>
                            {plugin.homePage!.additionalChildrenStart}
                        </div>
                    ))}
            </div>
        );

        additionalPluginChildrenEnd = (
            <div className="flex flex-col gap-2">
                {customizationController.plugins
                    .filter((p) => p.homePage?.additionalChildrenEnd)
                    .map((plugin, i) => (
                        <div key={`plugin_children_end_${i}`}>
                            {plugin.homePage!.additionalChildrenEnd}
                        </div>
                    ))}
            </div>
        );

        // Collect additionalActions from plugins
        additionalPluginActions = (
            <>
                {customizationController.plugins
                    .filter((p) => p.homePage?.additionalActions)
                    .map((plugin, i) => (
                        <React.Fragment key={`plugin_actions_${i}`}>
                            {plugin.homePage!.additionalActions}
                        </React.Fragment>
                    ))}
            </>
        );
    }

    /* ───────────────────────────────────────────────────────────────
       Render
       ─────────────────────────────────────────────────────────────── */
    return (
        <div ref={containerRef} className="py-2 overflow-auto h-full w-full">
            <Container maxWidth="6xl">
                {/* search & actions */}
                <div
                    className="w-full sticky py-4 transition-all duration-400 ease-in-out top-0 z-10 flex flex-row gap-4"
                    style={{ top: direction === "down" ? -84 : 0 }}
                >
                    <SearchBar
                        onTextSearch={updateSearch}
                        placeholder="Search collections"
                        autoFocus
                        innerClassName="w-full"
                        className="w-full grow"
                    />
                    {additionalActions}
                    {additionalPluginActions}
                </div>

                <FavouritesView hidden={performingSearch} />

                {additionalChildrenStart}
                {additionalPluginChildrenStart}

                {/* ─────── DND context ─────── */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={collisionDetection}
                    measuring={{
                        droppable: {
                            strategy: MeasuringStrategy.Always,
                            frequency: 500
                        }
                    }}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                    onDragCancel={onDragCancel}
                    modifiers={dndModifiers}
                >
                    <SortableContext
                        key={JSON.stringify(containers)}
                        items={containers}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map((groupData, groupIndex) => {
                            const groupKey = groupData.name;
                            const entriesInGroup = groupData.entries;

                            const AdditionalCards: React.ComponentType<PluginHomePageAdditionalCardsProps>[] =
                                [];
                            customizationController.plugins?.forEach((p) => {
                                if (p.homePage?.AdditionalCards)
                                    AdditionalCards.push(
                                        ...toArray(p.homePage.AdditionalCards)
                                    );
                            });

                            const actionProps: PluginHomePageAdditionalCardsProps = {
                                group:
                                    groupKey === DEFAULT_GROUP_NAME
                                        ? undefined
                                        : groupKey,
                                context
                            };

                            if (
                                entriesInGroup.length === 0 &&
                                (AdditionalCards.length === 0 || performingSearch)
                            )
                                return null;

                            return (
                                <SortableNavigationGroup
                                    key={`group-${groupIndex}`}
                                    groupName={groupKey}
                                    disabled={dndDisabled}
                                >
                                    <NavigationGroup
                                        group={
                                            groupKey === DEFAULT_GROUP_NAME
                                                ? undefined
                                                : groupKey
                                        }
                                        minimised={
                                            draggingGroupId === groupKey &&
                                            !isDraggingCardOnly
                                        }
                                        isPotentialCardDropTarget={
                                            isDraggingCardOnly
                                        }
                                        dndDisabled={dndDisabled}
                                        onEditGroup={() => {
                                            if (dndDisabled) return;
                                            setDialogOpenForGroup(groupKey);
                                        }}
                                        collapsed={isGroupCollapsed(groupKey)}
                                        onToggleCollapsed={() => toggleGroupCollapsed(groupKey)}
                                    >
                                        <NavigationGroupDroppable
                                            id={groupKey}
                                            itemIds={entriesInGroup.map(
                                                (e) => e.url
                                            )}
                                            isPotentialCardDropTarget={
                                                isDraggingCardOnly
                                            }
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                                                {entriesInGroup.map(
                                                    (entry) => (
                                                        <SortableNavigationCard
                                                            key={entry.url}
                                                            entry={entry}
                                                            onClick={() => {
                                                                let event: CMSAnalyticsEvent =
                                                                    "unmapped_event";
                                                                if (
                                                                    entry.type ===
                                                                    "collection"
                                                                )
                                                                    event =
                                                                        "home_navigate_to_collection";
                                                                else if (
                                                                    entry.type ===
                                                                    "view"
                                                                )
                                                                    event =
                                                                        "home_navigate_to_view";
                                                                else if (
                                                                    entry.type ===
                                                                    "admin"
                                                                )
                                                                    event =
                                                                        "home_navigate_to_admin_view";

                                                                context.analyticsController?.onAnalyticsEvent?.(
                                                                    event,
                                                                    {
                                                                        path: entry.slug
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                    )
                                                )}
                                                {!performingSearch &&
                                                    groupKey.toLowerCase() !==
                                                    ADMIN_GROUP_NAME.toLowerCase() &&
                                                    AdditionalCards.map(
                                                        (C, i) => (
                                                            <C
                                                                key={`extra_${groupKey}_${i}`}
                                                                {...actionProps}
                                                            />
                                                        )
                                                    )}
                                            </div>
                                        </NavigationGroupDroppable>
                                    </NavigationGroup>
                                </SortableNavigationGroup>
                            );
                        })}
                    </SortableContext>

                    <NewGroupDropZone
                        disabled={dndDisabled}
                        setIsHovering={setIsHoveringNewGroupDropZone}
                    />

                    <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
                        {activeGroupData &&
                            draggingGroupId === activeGroupData.name ? (
                            <div
                                className="rounded-lg bg-transparent"
                                style={{
                                    padding: 0,
                                    margin: 0
                                }}
                            >
                                <NavigationGroup
                                    group={
                                        activeGroupData.name ===
                                            DEFAULT_GROUP_NAME
                                            ? undefined
                                            : activeGroupData.name
                                    }
                                    isPreview={false}
                                    minimised
                                />
                            </div>
                        ) : activeItemForOverlay ? (
                            <NavigationCardBinding
                                {...activeItemForOverlay}
                                shrink={isHoveringNewGroupDropZone}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {!performingSearch && adminGroupData && (
                    <NavigationGroup
                        group={adminGroupData.name}
                        collapsed={isGroupCollapsed(adminGroupData.name)}
                        onToggleCollapsed={() => toggleGroupCollapsed(adminGroupData.name)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                            {adminGroupData.entries.map((entry) => (
                                <NavigationCardBinding
                                    key={entry.url}
                                    {...entry}
                                    onClick={() => {
                                        let event: CMSAnalyticsEvent =
                                            "unmapped_event";
                                        if (entry.type === "collection")
                                            event =
                                                "home_navigate_to_collection";
                                        else if (entry.type === "view")
                                            event = "home_navigate_to_view";
                                        else if (entry.type === "admin")
                                            event =
                                                "home_navigate_to_admin_view";

                                        context.analyticsController?.onAnalyticsEvent?.(
                                            event,
                                            { path: entry.slug }
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    </NavigationGroup>
                )}

                {additionalPluginSections}
                {additionalPluginChildrenEnd}
                {additionalChildrenEnd}
            </Container>

            {dialogOpenForGroup && (
                <RenameGroupDialog
                    open
                    initialName={dialogOpenForGroup}
                    existingGroupNames={items
                        .map((g) => g.name)
                        .filter((n) => n !== dialogOpenForGroup)}
                    onClose={handleDialogClose}
                    onRename={(newName) => {
                        handleRenameGroup(dialogOpenForGroup, newName);
                    }}
                />
            )}
        </div>
    );
}
