import type { AppView, UrlController, EntityCollection, RebasePlugin, NavigationEntry, NavigationGroupMapping, NavigationResult } from "@rebasepro/types";
import { useCallback, useMemo, useRef } from "react";
import { deepEqual as equal } from "fast-equals";

import { CollectionRegistryController } from "@rebasepro/types";
import { CollectionRegistry } from "@rebasepro/common";

import { computeNavigationGroups, getGroup, NAVIGATION_ADMIN_GROUP_NAME, NAVIGATION_DEFAULT_GROUP_NAME } from "./utils";

export type UseTopLevelNavigationProps = {
    collections: EntityCollection[];
    views: AppView[] | undefined;
    adminViews: AppView[] | undefined;
    plugins?: RebasePlugin[];
    navigationGroupMappings?: NavigationGroupMapping[];
    viewsOrder?: string[];
    urlController: UrlController;
    adminMode?: "content" | "studio" | "settings";
    collectionRegistryController: CollectionRegistryController<any> & { collectionRegistryRef: React.MutableRefObject<CollectionRegistry> };
};

export type UseTopLevelNavigationResult = {
    topLevelNavigation: NavigationResult | undefined;
};

/**
 * Hook that computes the top-level NavigationResult from resolved collections,
 * views, and admin views. Pure computation — no async, no effects.
 *
 * The `onNavigationEntriesUpdate` callback is embedded in the result for API
 * compatibility, but its reference is stable via useCallback.
 */
export function useTopLevelNavigation(
    props: UseTopLevelNavigationProps
): UseTopLevelNavigationResult {

    const {
        collections,
        views,
        adminViews,
        plugins,
        navigationGroupMappings,
        viewsOrder,
        urlController,
        adminMode,
        collectionRegistryController
    } = props;

    const pluginGroups = useMemo(() => {
        const allPluginGroups = plugins?.flatMap(plugin => plugin.hooks?.navigationEntries ? plugin.hooks.navigationEntries.map(e => e.name) : []) ?? [];
        return [...new Set(allPluginGroups)];
    }, [plugins]);

    // Stable reference to the drag-and-drop update callback.
    // We use a ref-based approach internally so the callback identity doesn't
    // change when collections/views change (which would cause NavigationResult
    // equality to always fail).
    const onNavigationEntriesOrderUpdate = useCallback((entries: NavigationGroupMapping[]) => {
        if (!plugins) {
            return;
        }
        // remove all groups that have no entries
        const filteredEntries = entries.filter(entry => entry.entries.length > 0);

        // Persist to backend via plugins
        if (plugins.some((plugin: RebasePlugin) => plugin.hooks?.onNavigationEntriesUpdate)) {
            plugins.forEach((plugin: RebasePlugin) => {
                if (plugin.hooks?.onNavigationEntriesUpdate) {
                    plugin.hooks.onNavigationEntriesUpdate(filteredEntries);
                }
            });
        }
    }, [plugins]);

    const topLevelNavigationRef = useRef<NavigationResult | undefined>(undefined);

    const topLevelNavigation = useMemo(() => {
        // Don't compute until we have collections and views resolved
        if (!views && !adminViews && collections.length === 0) {
            return undefined;
        }

        const finalNavigationGroupMappings: NavigationGroupMapping[] = computeNavigationGroups({
            navigationGroupMappings,
            collections,
            views: views,
            plugins
        });

        const allPluginNavigationEntries = finalNavigationGroupMappings.map((g) => g.entries).flat() ?? [];
        const navigationEntriesOrder = ([...new Set(allPluginNavigationEntries)]);

        let navigationEntries: NavigationEntry[] = [
            ...(collections ?? []).reduce((acc, collection) => {
                if (collection.hideFromNavigation) return acc;

                const pathKey = collection.slug;
                let groupName = getGroup(collection);

                if (finalNavigationGroupMappings) {
                    for (const pluginGroupDef of finalNavigationGroupMappings) {
                        if (pluginGroupDef.entries.includes(pathKey)) {
                            groupName = pluginGroupDef.name;
                            break;
                        }
                    }
                }

                acc.push({
                    id: `collection:${pathKey}`,
                    url: urlController.buildUrlCollectionPath(pathKey),
                    type: "collection",
                    name: collection.name.trim(),
                    slug: pathKey,
                    collection,
                    description: collection.description?.trim(),
                    group: groupName ?? NAVIGATION_DEFAULT_GROUP_NAME
                });
                return acc;
            }, [] as NavigationEntry[]),

            ...(views ?? []).reduce((acc, view) => {
                if (view.hideFromNavigation) return acc;

                const pathKey = view.slug;
                let groupName = getGroup(view);

                if (finalNavigationGroupMappings) {
                    for (const pluginGroupDef of finalNavigationGroupMappings) {
                        if (pluginGroupDef.entries.includes(pathKey)) {
                            groupName = pluginGroupDef.name;
                            break;
                        }
                    }
                }

                const basePathKey = Array.isArray(pathKey) ? pathKey[0] : pathKey;
                acc.push({
                    id: `view:${pathKey}`,
                    url: urlController.buildAppUrlPath(basePathKey),
                    name: view.name.trim(),
                    type: "view",
                    slug: view.slug,
                    view,
                    description: view.description?.trim(),
                    group: groupName ?? NAVIGATION_DEFAULT_GROUP_NAME
                });
                return acc;
            }, [] as NavigationEntry[]),

            ...(adminViews ?? []).reduce((acc, adminView) => {
                if (adminView.hideFromNavigation) return acc;

                const pathKey = adminView.slug;
                let groupName = adminView.group?.trim() || NAVIGATION_ADMIN_GROUP_NAME;

                if (finalNavigationGroupMappings) {
                    for (const pluginGroupDef of finalNavigationGroupMappings) {
                        if (pluginGroupDef.entries.includes(pathKey)) {
                            groupName = pluginGroupDef.name;
                            break;
                        }
                    }
                }

                acc.push({
                    id: `admin:${pathKey}`,
                    url: urlController.buildAppUrlPath(pathKey),
                    name: adminView.name.trim(),
                    type: "admin",
                    slug: adminView.slug,
                    view: adminView,
                    description: adminView.description?.trim(),
                    group: groupName
                });
                return acc;
            }, [] as NavigationEntry[])
        ];

        const groupOrderValue = (groupName?: string): number => {
            if (groupName === NAVIGATION_ADMIN_GROUP_NAME) return 1;
            return 0;
        };

        navigationEntries = navigationEntries.sort((a, b) => {
            return groupOrderValue(a.group) - groupOrderValue(b.group);
        });

        const usedViewsOrder = viewsOrder ?? navigationEntriesOrder;
        if (usedViewsOrder) {
            navigationEntries = navigationEntries.sort((a, b) => {
                const getSortPath = (navEntry: NavigationEntry) => typeof navEntry.slug === "string" ? navEntry.slug : navEntry.slug[0];
                const aIndex = usedViewsOrder.indexOf(getSortPath(a));
                const bIndex = usedViewsOrder.indexOf(getSortPath(b));
                if (aIndex === -1 && bIndex === -1) return 0;
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                return aIndex - bIndex;
            });
        }

        const collectedGroupsFromEntries = navigationEntries
            .map(e => e.group)
            .filter(Boolean) as string[];

        const groupsFromMappings = finalNavigationGroupMappings.map(g => g.name);
        const additionalGroups = collectedGroupsFromEntries.filter(g => !groupsFromMappings.includes(g));

        const allDefinedGroups = [
            ...(pluginGroups ?? []),
            ...groupsFromMappings,
            ...additionalGroups
        ];

        const uniqueGroupsArray = [...new Set(allDefinedGroups)];
        const adminGroups = uniqueGroupsArray.filter(g => g === NAVIGATION_ADMIN_GROUP_NAME);
        const nonAdminGroups = uniqueGroupsArray.filter(g => g !== NAVIGATION_ADMIN_GROUP_NAME);
        const uniqueGroups = [...nonAdminGroups, ...adminGroups] as string[];

        const computedTopLevelNav = {
            allowDragAndDrop: plugins?.some((plugin: RebasePlugin) => plugin.hooks?.allowDragAndDrop) ?? false,
            navigationEntries,
            groups: uniqueGroups,
            onNavigationEntriesUpdate: onNavigationEntriesOrderUpdate,
        };

        // Cache the newly computed navigation result and return the cached reference
        // if it is deeply equal to the previous one, to prevent reference churn.
        const isNavEqual = topLevelNavigationRef.current &&
            equal(topLevelNavigationRef.current.navigationEntries, computedTopLevelNav.navigationEntries) &&
            equal(topLevelNavigationRef.current.groups, computedTopLevelNav.groups) &&
            topLevelNavigationRef.current.allowDragAndDrop === computedTopLevelNav.allowDragAndDrop;

        if (isNavEqual) {
            return topLevelNavigationRef.current;
        }

        topLevelNavigationRef.current = computedTopLevelNav;
        return computedTopLevelNav;
    }, [
        collections,
        views,
        adminViews,
        navigationGroupMappings,
        urlController.buildAppUrlPath,
        urlController.buildUrlCollectionPath,
        pluginGroups,
        plugins,
        adminMode,
        viewsOrder,
        onNavigationEntriesOrderUpdate
    ]);

    return {
        topLevelNavigation
    };
}
