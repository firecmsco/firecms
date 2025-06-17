import React, { useCallback, useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Container, SearchBar } from "@firecms/ui";
import { useCustomizationController, useFireCMSContext, useNavigationController } from "../../hooks";
import {
    CMSAnalyticsEvent,
    NavigationEntry,
    NavigationGroupMapping,
    PluginGenericProps,
    PluginHomePageAdditionalCardsProps
} from "../../types";
import { toArray } from "../../util/arrays";
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
import { rectSortingStrategy, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { RenameGroupDialog } from "./RenameGroupDialog";

export const DEFAULT_GROUP_NAME = "Views";
export const ADMIN_GROUP_NAME = "Admin"; // Define admin group name

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
    const navigationController = useNavigationController();
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

    const filteredNavigationEntries = filteredUrls
        ? rawNavigationEntries.filter(e => filteredUrls.includes(e.url))
        : rawNavigationEntries;

    useEffect(() => {
        fuse.current = new Fuse(rawNavigationEntries, {
            keys: ["name", "description", "group", "path"]
        });
    }, [rawNavigationEntries]);

    const updateSearch = useCallback((v?: string) => {
        if (!v) return setFilteredUrls(null);
        const r = fuse.current?.search(v);
        setFilteredUrls(r ? r.map(x => x.item.url) : []);
    }, []);

    // State for draggable items (excluding Admin)
    const [items, setItems] = useState<{ name: string, entries: NavigationEntry[] }[]>([]);
    // State for the Admin group
    const [adminGroupData, setAdminGroupData] = useState<{ name: string, entries: NavigationEntry[] } | null>(null);

    useEffect(() => {
        let allProcessedItems: { name: string, entries: NavigationEntry[] }[];
        const sourceEntries = performingSearch ? filteredNavigationEntries : rawNavigationEntries;
        const entriesByGroup: Record<string, NavigationEntry[]> = {};
        sourceEntries.forEach(entry => {
            const groupName = entry.type === "admin" ? ADMIN_GROUP_NAME : (entry.group ?? DEFAULT_GROUP_NAME);
            if (!entriesByGroup[groupName]) entriesByGroup[groupName] = [];
            entriesByGroup[groupName].push(entry);
        });

        if (performingSearch) {
            const orderedGroupNames = Array.from(new Set(sourceEntries.map(e => e.group ?? DEFAULT_GROUP_NAME)));
            allProcessedItems = orderedGroupNames.map(name => ({
                name,
                entries: entriesByGroup[name] || []
            })).filter(g => g.entries.length > 0);
        } else {

            allProcessedItems = groupOrderFromNavController.map(groupName => ({
                name: groupName,
                entries: entriesByGroup[groupName] || []
            }));

            // Add any additional groups that are not in groupOrderFromNavController
            Object.keys(entriesByGroup).forEach(groupName => {
                if (!groupOrderFromNavController.includes(groupName)) {
                    allProcessedItems.push({
                        name: groupName,
                        entries: entriesByGroup[groupName]
                    });
                }
            });

            // Filter out empty groups, unless they're explicitly included in groupOrderFromNavController
            allProcessedItems = allProcessedItems.filter(g => {
                return g.entries.length > 0 || groupOrderFromNavController.includes(g.name);
            });
        }

        // Separate Admin group
        const adminGroup = allProcessedItems.find(group => group.name === ADMIN_GROUP_NAME);
        if (adminGroup) {
            setAdminGroupData(adminGroup);
            // Filter out Admin group from the list of draggable items
            setItems(allProcessedItems.filter(group => group.name !== ADMIN_GROUP_NAME));
        } else {
            setAdminGroupData(null); // No Admin group found
            setItems(allProcessedItems); // All items are draggable
        }

    }, [performingSearch, filteredNavigationEntries, rawNavigationEntries, groupOrderFromNavController]);

    const updateItems = (
        newItemsOrUpdater:
            | { name: string, entries: NavigationEntry[] }[]
            | ((currentDraggableItems: { name: string, entries: NavigationEntry[] }[]) => { // Changed prevState to currentDraggableItems
            name: string,
            entries: NavigationEntry[]
        }[])
    ) => {
        setItems(currentDraggableItems => {
            const newDraggableItems = typeof newItemsOrUpdater === "function"
                ? newItemsOrUpdater(currentDraggableItems)
                : newItemsOrUpdater;

            // Convert draggable items to the persistence format
            const draggableGroupsForPersistence: NavigationGroupMapping[] = newDraggableItems.map(group => ({
                name: group.name,
                entries: group.entries.map(e => e.path) // Persist paths for entries
            }));

            let allGroupsForPersistence: NavigationGroupMapping[];

            // Combine draggable groups with the static admin group (if it exists)
            // The Admin group is typically last in display order.
            if (adminGroupData) {
                const adminGroupForPersistence: NavigationGroupMapping = {
                    name: adminGroupData.name, // This is ADMIN_GROUP_NAME
                    entries: adminGroupData.entries.map(e => e.path)
                };
                allGroupsForPersistence = [...draggableGroupsForPersistence, adminGroupForPersistence];
            } else {
                // No admin group, all items are draggable and were included in newDraggableItems
                allGroupsForPersistence = draggableGroupsForPersistence;
            }

            // Call onNavigationEntriesUpdate with the complete list of groups
            onNavigationEntriesUpdate(allGroupsForPersistence);

            return newDraggableItems; // Update the local state for draggable items
        });
    };

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
        isHoveringNewGroupDropZone,
        setIsHoveringNewGroupDropZone
    } = useHomePageDnd({
        items: items,
        setItems: updateItems,
        disabled: !allowDragAndDrop || performingSearch,
        onGroupMoved: (group, sourceGroup, targetGroup) => {
            context.analyticsController?.onAnalyticsEvent?.("home_move_group", { name: group });
        },
        onCardMovedBetweenGroups: (card) => {
            context.analyticsController?.onAnalyticsEvent?.("home_move_card", { id: card.id });
        },
        onNewGroupDrop: () => {
            context.analyticsController?.onAnalyticsEvent?.("home_drop_new_group");
        }
    });

    const {
        containerRef,
        direction
    } = useRestoreScroll();

    const dndDisabled = !allowDragAndDrop || performingSearch;

    // Define modifiers based on the type of the active draggable node
    const dndModifiers = React.useMemo(() => {
        if (dndKitActiveNode?.data.current?.type === "group") {
            return [restrictToVerticalAxis, restrictToWindowEdges];
        }
        return [restrictToWindowEdges]; // Default for items (cards)
    }, [dndKitActiveNode]);

    let additionalPluginChildrenStart: React.ReactNode | undefined;
    let additionalPluginChildrenEnd: React.ReactNode | undefined;
    let additionalPluginSections: React.ReactNode | undefined;
    if (customizationController.plugins) {
        const sectionProps: PluginGenericProps = {
            context
        };
        additionalPluginSections = <>
            {customizationController.plugins.filter(plugin => plugin.homePage?.includeSection)
                .map((plugin, i) => {
                    const section = plugin.homePage!.includeSection!(sectionProps)
                    return (
                        <NavigationGroup
                            group={section.title}
                            key={`plugin_section_${plugin.key}`}>
                            {section.children}
                        </NavigationGroup>
                    );
                })}
        </>;

        additionalPluginChildrenStart = <div className={"flex flex-col gap-2"}>
            {customizationController.plugins.filter(plugin => plugin.homePage?.additionalChildrenStart)
                .map((plugin, i) => {
                    return <div key={`plugin_children_start_${i}`}>{plugin.homePage!.additionalChildrenStart}</div>;
                })}
        </div>;

        additionalPluginChildrenEnd = <div className={"flex flex-col gap-2"}>
            {customizationController.plugins.filter(plugin => plugin.homePage?.additionalChildrenEnd)
                .map((plugin, i) => {
                    return <div key={`plugin_children_end_${i}`}>{plugin.homePage!.additionalChildrenEnd}</div>;
                })}
        </div>;
    }

    return (
        <div ref={containerRef} className="py-2 overflow-auto h-full w-full">
            <Container maxWidth="6xl">
                <div
                    className="w-full sticky py-4 transition-all duration-400 ease-in-out top-0 z-10 flex flex-row gap-4"
                    style={{ top: direction === "down" ? -84 : 0 }}>
                    <SearchBar
                        onTextSearch={updateSearch}
                        placeholder="Search collections"
                        autoFocus
                        innerClassName="w-full"
                        className="w-full flex-grow"/>
                    {additionalActions}
                </div>

                <FavouritesView hidden={performingSearch}/>

                {additionalChildrenStart}

                {additionalPluginChildrenStart}

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
                    {/* SortableContext now only includes non-admin groups */}
                    <SortableContext
                        key={JSON.stringify(containers)}
                        items={containers}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map((groupData) => {
                            const groupKey = groupData.name;
                            const entriesInGroup = groupData.entries;

                            const AdditionalCards: React.ComponentType<PluginHomePageAdditionalCardsProps>[] = [];
                            customizationController.plugins?.forEach(p => {
                                if (p.homePage?.AdditionalCards)
                                    AdditionalCards.push(...toArray(p.homePage.AdditionalCards));
                            });
                            const actionProps = {
                                group: groupKey === DEFAULT_GROUP_NAME ? undefined : groupKey,
                                context
                            } as PluginHomePageAdditionalCardsProps;

                            if (entriesInGroup.length === 0 &&
                                (AdditionalCards.length === 0 || performingSearch) &&
                                !groupOrderFromNavController.includes(groupKey)
                            )
                                return null;

                            return (
                                <SortableNavigationGroup key={groupKey} groupName={groupKey} disabled={dndDisabled}>
                                    <NavigationGroup
                                        group={groupKey === DEFAULT_GROUP_NAME ? undefined : groupKey}
                                        minimised={draggingGroupId === groupKey && !isDraggingCardOnly}
                                        isPotentialCardDropTarget={isDraggingCardOnly}
                                        dndDisabled={dndDisabled} // Pass dndDisabled
                                        onEditGroup={(groupName) => {
                                            if (dndDisabled) return; // Prevent editing if D&D is disabled
                                            console.log("Attempting to open dialog for group:", groupName);
                                            setDialogOpenForGroup(groupName);
                                        }}
                                    >
                                        <NavigationGroupDroppable
                                            id={groupKey}
                                            itemIds={entriesInGroup.map(e => e.url)}
                                            isPotentialCardDropTarget={isDraggingCardOnly}
                                        >
                                            <SortableContext items={entriesInGroup.map(e => e.url)}
                                                             strategy={rectSortingStrategy}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                                                    {entriesInGroup.map(entry => (
                                                        <SortableNavigationCard
                                                            key={entry.url}
                                                            entry={entry}
                                                            onClick={() => {
                                                                let event: CMSAnalyticsEvent;
                                                                if (entry.type === "collection") {
                                                                    event = "home_navigate_to_collection";
                                                                } else if (entry.type === "view") {
                                                                    event = "home_navigate_to_view";
                                                                } else if (entry.type === "admin") {
                                                                    event = "home_navigate_to_admin_view";
                                                                } else {
                                                                    event = "unmapped_event";
                                                                }
                                                                context.analyticsController?.onAnalyticsEvent?.(event, { path: entry.path });
                                                            }}
                                                        />
                                                    ))}
                                                    {/* AdditionalCards for draggable groups */}
                                                    {!performingSearch && groupKey.toLowerCase() !== ADMIN_GROUP_NAME.toLowerCase() &&
                                                        AdditionalCards.map((C, i) => (
                                                            <C key={`extra_draggable_${groupKey}_${i}`} {...actionProps} />
                                                        ))}
                                                </div>
                                            </SortableContext>
                                        </NavigationGroupDroppable>
                                    </NavigationGroup>
                                </SortableNavigationGroup>
                            );
                        })}
                    </SortableContext>

                    <NewGroupDropZone disabled={dndDisabled} setIsHovering={setIsHoveringNewGroupDropZone}/>

                    <DragOverlay adjustScale={false}
                                 dropAnimation={dropAnimation}
                    >
                        {activeGroupData && draggingGroupId === activeGroupData.name ? (
                            <div
                                className="rounded-lg bg-transparent"
                                style={{
                                    padding: 0,
                                    margin: 0
                                }}
                            >
                                <NavigationGroup
                                    group={activeGroupData.name === DEFAULT_GROUP_NAME ? undefined : activeGroupData.name}
                                    isPreview={false}
                                    minimised={true}
                                >
                                    {/* When minimised=true, this children content is ignored by NavigationGroup */}
                                </NavigationGroup>
                            </div>
                        ) : activeItemForOverlay ? (
                            <NavigationCardBinding
                                {...activeItemForOverlay}
                                shrink={isHoveringNewGroupDropZone}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {/* Render Admin Group Separately and Last, if it exists and not searching */}
                {adminGroupData && !performingSearch && (
                    <NavigationGroup
                        group={adminGroupData.name} // Should be ADMIN_GROUP_NAME
                        minimised={false} // Admin group is never minimised by dragging other groups
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                            {adminGroupData.entries.map(entry => (
                                // These are not sortable
                                <NavigationCardBinding
                                    key={entry.url}
                                    {...entry}
                                    onClick={() => {
                                        let event: CMSAnalyticsEvent;
                                        if (entry.type === "collection") {
                                            event = "home_navigate_to_collection";
                                        } else if (entry.type === "view") {
                                            event = "home_navigate_to_view";
                                        } else if (entry.type === "admin") {
                                            event = "home_navigate_to_admin_view";
                                        } else {
                                            event = "unmapped_event";
                                        }
                                        context.analyticsController?.onAnalyticsEvent?.(event, { path: entry.path });
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

            {/* Render the RenameGroupDialog */}
            {dialogOpenForGroup && (
                <RenameGroupDialog
                    open={!!dialogOpenForGroup}
                    initialName={dialogOpenForGroup} // The name of the newly created group
                    existingGroupNames={items.map(g => g.name).filter(name => name !== dialogOpenForGroup)}
                    onClose={() => setDialogOpenForGroup(null)}
                    onRename={(newName) => {
                        handleRenameGroup(dialogOpenForGroup, newName);
                        setDialogOpenForGroup(null); // Close dialog after rename
                    }}
                />
            )}
        </div>
    );
}
