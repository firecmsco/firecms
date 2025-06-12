import React, { useCallback, useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Container, SearchBar } from "@firecms/ui";
import { useCustomizationController, useFireCMSContext, useNavigationController } from "../../hooks";
import { NavigationEntry, PluginHomePageAdditionalCardsProps } from "../../types";
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
import { rectSortingStrategy, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"; // Import SortableContext and strategy

const DEFAULT_GROUP_NAME = "Views";

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
        setFilteredUrls(r ? r.map(x => x.item.url) : []); // Ensure empty array if no results
    }, []);

    const [items, setItems] = useState<{ name: string, entries: NavigationEntry[] }[]>([]);

    useEffect(() => {
        let newItemsResult: { name: string, entries: NavigationEntry[] }[];
        const sourceEntries = performingSearch ? filteredNavigationEntries : rawNavigationEntries;

        const entriesByGroup: Record<string, NavigationEntry[]> = {};
        sourceEntries.forEach(entry => {
            const groupName = entry.group ?? DEFAULT_GROUP_NAME;
            if (!entriesByGroup[groupName]) entriesByGroup[groupName] = [];
            entriesByGroup[groupName].push(entry);
        });

        if (performingSearch) {
            const orderedGroupNames = Array.from(new Set(sourceEntries.map(e => e.group ?? DEFAULT_GROUP_NAME)));
            newItemsResult = orderedGroupNames.map(name => ({
                name,
                entries: entriesByGroup[name] || []
            })).filter(g => g.entries.length > 0);
        } else {
            // Use groupOrderFromNavController, and add any other groups found in entries
            const allGroupNames = [...groupOrderFromNavController];
            Object.keys(entriesByGroup).forEach(gn => {
                if (!allGroupNames.includes(gn)) allGroupNames.push(gn);
            });

            newItemsResult = allGroupNames.map(groupName => ({
                name: groupName,
                entries: entriesByGroup[groupName] || []
            })).filter(g => g.entries.length > 0 || groupOrderFromNavController.includes(g.name)); // Keep explicitly ordered groups even if empty
        }
        setItems(newItemsResult);
    }, [performingSearch, filteredNavigationEntries, rawNavigationEntries, groupOrderFromNavController]);

    const updateItems = (newItemsFromDnd: { name: string, entries: NavigationEntry[] }[]) => {
        setItems(newItemsFromDnd);
        const persistedData = newItemsFromDnd.map(group => ({
            name: group.name,
            entries: group.entries.map(e => e.path)
        }));
        onNavigationEntriesUpdate(persistedData);
    };

    const {
        sensors,
        collisionDetection,
        onDragStart,
        onDragOver,
        onDragEnd,
        dropAnimation,
        activeItemForOverlay,
        activeGroupData, // Data for the group being dragged
        draggingGroupId, // ID of the group currently being dragged (or null)
        containers
    } = useHomePageDnd({
        items: items,
        setItems: updateItems,
        // ... (disabled logic)
        disabled: !allowDragAndDrop || (performingSearch && items.flatMap(i => i.entries).length !== filteredNavigationEntries.length)
    });

    const {
        containerRef,
        direction
    } = useRestoreScroll();

    const dndDisabled = !allowDragAndDrop || performingSearch;

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

                <DndContext
                    sensors={sensors}
                    collisionDetection={collisionDetection}
                    measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}>

                    <SortableContext items={containers} strategy={verticalListSortingStrategy}>
                        {items.map((groupData) => {
                            const groupKey = groupData.name;
                            const entriesInGroup = groupData.entries;

                            const isAnyGroupBeingDragged = !!draggingGroupId;
                            // This specific group is the source of the drag, its original instance will be hidden by SortableNavigationGroup style (opacity 0)
                            const isThisGroupTheDragSource = draggingGroupId === groupKey;

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
                                <SortableNavigationGroup key={groupKey} groupName={groupKey}>
                                    <NavigationGroup
                                        group={groupKey === DEFAULT_GROUP_NAME ? undefined : groupKey}
                                        // Collapse if any group is dragging AND this is NOT the group being currently dragged (source)
                                        collapsed={isAnyGroupBeingDragged && !isThisGroupTheDragSource}
                                    >
                                        {/* Content is rendered by NavigationGroup based on its collapsed state */}
                                        <NavigationGroupDroppable
                                            id={groupKey}
                                            itemIds={entriesInGroup.map(e => e.url)}>
                                            <SortableContext items={entriesInGroup.map(e => e.url)}
                                                             strategy={rectSortingStrategy}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                                                    {entriesInGroup.map(entry => (
                                                        <SortableNavigationCard
                                                            key={entry.url}
                                                            entry={entry}/>
                                                    ))}
                                                    {!performingSearch && !isAnyGroupBeingDragged && groupKey.toLowerCase() !== "admin" &&
                                                        AdditionalCards.map((C, i) => (
                                                            <C key={`extra_${i}`} {...actionProps} />
                                                        ))}
                                                </div>
                                            </SortableContext>
                                        </NavigationGroupDroppable>
                                    </NavigationGroup>
                                </SortableNavigationGroup>
                            );
                        })}
                    </SortableContext>

                    <NewGroupDropZone disabled={dndDisabled}/>

                    <DragOverlay adjustScale dropAnimation={dropAnimation}>
                        {activeGroupData && draggingGroupId === activeGroupData.name ? (
                            // Preview for the dragged group. Styles from dropAnimation.sideEffects.active will apply.
                            <div
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                style={{ minWidth: "300px" }} // Ensure a reasonable minimum width for the overlay
                            >
                                <NavigationGroup
                                    group={activeGroupData.name === DEFAULT_GROUP_NAME ? undefined : activeGroupData.name}
                                    collapsed={false} // Always show title and structure in overlay
                                >
                                    <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                        ({activeGroupData.entries.length} item(s))
                                    </div>
                                </NavigationGroup>
                            </div>
                        ) : activeItemForOverlay ? (
                            <NavigationCardBinding {...activeItemForOverlay} />
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {additionalChildrenEnd}
            </Container>
        </div>
    );
}
