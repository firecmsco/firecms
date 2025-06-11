import React, { useCallback, useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Container, SearchBar } from "@firecms/ui";
import { useCustomizationController, useFireCMSContext, useNavigationController } from "../../hooks";
import { NavigationEntry, PluginHomePageAdditionalCardsProps } from "../../types";
import { toArray } from "../../util/arrays";
import { FavouritesView } from "./FavouritesView";
import { useRestoreScroll } from "../../internal/useRestoreScroll";
import { NavigationGroup } from "./NavigationGroup";
import { NavigationGroupDroppable, NewGroupDropZone, SortableNavigationCard, useHomePageDnd } from "./HomePageDnD";
import { DndContext, DragOverlay, MeasuringStrategy } from "@dnd-kit/core";
import { NavigationCardBinding } from "./NavigationCardBinding";

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
        navigationEntries,
        groups,
        onNavigationEntriesUpdate
    } = navigationController.topLevelNavigation;

    /* search */
    const fuse = useRef<Fuse<NavigationEntry> | null>(null);
    const [filteredUrls, setFilteredUrls] = useState<string[] | null>(null);
    const performingSearch = Boolean(filteredUrls);
    const filtered = filteredUrls
        ? filteredUrls.map(u => navigationEntries.find(e => e.url === u))
            .filter(Boolean) as NavigationEntry[]
        : navigationEntries;

    useEffect(() => {
        fuse.current = new Fuse(navigationEntries, {
            keys: ["name", "description", "group", "path"]
        });
    }, [navigationEntries]);

    const updateSearch = useCallback((v?: string) => {
        if (!v) return setFilteredUrls(null);
        const r = fuse.current?.search(v);
        setFilteredUrls(r ? r.map(x => x.item.url) : null);
    }, []);

    /* group names */
    const baseGroups = filteredUrls
        ? filtered.map(e => e.group).filter((g, i, a) => a.indexOf(g) === i)
        : groups;
    const allGroups: Array<string | undefined> = [...baseGroups];
    if (filtered.some(e => !e.group) || filtered.length === 0)
        allGroups.push(undefined);

    console.log("All groups", { groups, allGroups, baseGroups });


    const convertToItems = useCallback((entries: NavigationEntry[]) => {
        const items: { name: string, entries: NavigationEntry[] }[] = [];
        allGroups.forEach(g => {
            const key = g ?? DEFAULT_GROUP_NAME;
            const entriesForGroup = entries.filter(e => (e.group ?? DEFAULT_GROUP_NAME) === key);
            if (entriesForGroup.length > 0) {
                items.push({
                    name: key,
                    entries: entriesForGroup
                });
            }
        });
        return items;
    }, []);

    const [items, setItems] = useState<{ name: string, entries: NavigationEntry[] }[]>(convertToItems(filtered));

    const updateItems = (newItems: { name: string, entries: NavigationEntry[] }[]) => {
        setItems(newItems);
        // map entries to their paths
        const navigationEntriesOrder: { name: string, entries: string[] }[] = newItems.map(item => ({
            name: item.name,
            entries: item.entries.map(e => e.path)
        }));
        onNavigationEntriesUpdate(navigationEntriesOrder);
    };

    const {
        sensors,
        collisionDetection,
        onDragStart,
        onDragOver,
        onDragEnd,
        dropAnimation,
        entriesByGroup,
        activeEntry
    } = useHomePageDnd({
        items: performingSearch ? convertToItems(filtered) : items,
        setItems: updateItems,
        disabled: !allowDragAndDrop || performingSearch
    });

    const {
        containerRef,
        direction
    } = useRestoreScroll();

    return (
        <div ref={containerRef} className="py-2 overflow-auto h-full w-full">

            <Container maxWidth="6xl">

                {/* search bar */}
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

                {/* ---------------- DND CONTEXT ---------------- */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={collisionDetection}
                    measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}>

                    {Object.entries(entriesByGroup).map(([groupKey, entries]) => {

                        /* plugin extra cards */
                        const AdditionalCards: React.ComponentType<PluginHomePageAdditionalCardsProps>[] = [];
                        customizationController.plugins?.forEach(p => {
                            if (p.homePage?.AdditionalCards)
                                AdditionalCards.push(...toArray(p.homePage.AdditionalCards));
                        });
                        const actionProps = {
                            group: groupKey === DEFAULT_GROUP_NAME ? undefined : groupKey,
                            context
                        } as PluginHomePageAdditionalCardsProps;

                        if (entries.length === 0 &&
                            (AdditionalCards.length === 0 || performingSearch))
                            return null;

                        return (
                            <NavigationGroup
                                key={groupKey}
                                group={groupKey === DEFAULT_GROUP_NAME ? undefined : groupKey}>

                                <NavigationGroupDroppable
                                    id={groupKey}
                                    itemIds={entries.map(e => e.url)}>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">

                                        {entries.map(entry => (
                                            <SortableNavigationCard
                                                key={entry.url}
                                                entry={entry}/>
                                        ))}

                                        {groupKey.toLowerCase() !== "admin" &&
                                            AdditionalCards.map((C, i) => (
                                                <C key={`extra_${i}`} {...actionProps} />
                                            ))}
                                    </div>
                                </NavigationGroupDroppable>
                            </NavigationGroup>
                        );
                    })}


                    <NewGroupDropZone disabled={performingSearch}/>

                    <DragOverlay adjustScale dropAnimation={dropAnimation}>
                        {activeEntry ? <NavigationCardBinding {...activeEntry} /> : null}
                    </DragOverlay>
                </DndContext>

                {additionalChildrenEnd}
            </Container>
        </div>
    );
}
