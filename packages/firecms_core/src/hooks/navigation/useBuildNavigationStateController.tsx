import { useCallback, useEffect, useRef, useState } from "react";
import { deepEqual as equal } from "fast-equals";

import {
    CMSView,
    EntityCollection,
    NavigationEntry,
    NavigationGroupMapping,
    NavigationResult,
    FireCMSPlugin,
    AuthController,
    EntityCollectionsBuilder,
    PermissionsBuilder,
    CMSViewsBuilder,
    NavigationStateController,
    DataSourceDelegate,
    CollectionRegistryController,
    CMSUrlController,
    User
} from "@firecms/types";

import { resolveCollections, resolveCMSViews } from "./useNavigationResolution";
import { computeNavigationGroups, getGroup, NAVIGATION_ADMIN_GROUP_NAME, NAVIGATION_DEFAULT_GROUP_NAME } from "./utils";
import { CollectionRegistry } from "@firecms/common";

export type BuildNavigationStateProps<EC extends EntityCollection, USER extends User> = {
    authController: AuthController<USER>;
    collections?: EC[] | EntityCollectionsBuilder<EC>;
    collectionPermissions?: PermissionsBuilder;
    views?: CMSView[] | CMSViewsBuilder;
    adminViews?: CMSView[] | CMSViewsBuilder;
    dataSourceDelegate: DataSourceDelegate;
    plugins?: FireCMSPlugin[];
    navigationGroupMappings?: NavigationGroupMapping[];
    disabled?: boolean;
    viewsOrder?: string[];
    collectionRegistryController: CollectionRegistryController<EC> & { collectionRegistryRef: React.MutableRefObject<CollectionRegistry> };
    cmsUrlController: CMSUrlController;
};

export function useBuildNavigationStateController<EC extends EntityCollection, USER extends User>(
    props: BuildNavigationStateProps<EC, USER>
): NavigationStateController {

    const {
        authController,
        collections: collectionsProp,
        collectionPermissions,
        views: viewsProp,
        adminViews: adminViewsProp,
        viewsOrder,
        plugins,
        dataSourceDelegate,
        disabled,
        navigationGroupMappings,
        collectionRegistryController,
        cmsUrlController
    } = props;

    const viewsRef = useRef<CMSView[] | undefined>();
    const adminViewsRef = useRef<CMSView[] | undefined>();
    const navigationEntriesOrderRef = useRef<string[] | undefined>();

    const [topLevelNavigation, setTopLevelNavigation] = useState<NavigationResult | undefined>(undefined);
    const [navigationLoading, setNavigationLoading] = useState<boolean>(true);
    const [navigationLoadingError, setNavigationLoadingError] = useState<Error | undefined>(undefined);

    const allPluginGroups = plugins?.flatMap(plugin => plugin.homePage?.navigationEntries ? plugin.homePage.navigationEntries.map(e => e.name) : []) ?? [];
    const pluginGroups = [...new Set(allPluginGroups)];

    const computeTopNavigation = useCallback((
        collections: EntityCollection[],
        views: CMSView[],
        adminViews: CMSView[],
        viewsOrder?: string[],
        navigationGroupMappingsOverride?: NavigationGroupMapping[],
        onNavigationEntriesUpdateCallback?: (entries: NavigationGroupMapping[]) => void
    ): NavigationResult => {

        const finalNavigationGroupMappings: NavigationGroupMapping[] = computeNavigationGroups({
            navigationGroupMappings: navigationGroupMappingsOverride ?? navigationGroupMappings,
            collections,
            views,
            plugins: plugins
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
                    url: cmsUrlController.buildUrlCollectionPath(pathKey),
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

                acc.push({
                    id: `view:${pathKey}`,
                    url: cmsUrlController.buildCMSUrlPath(pathKey),
                    name: view.name.trim(),
                    type: "view",
                    slug: view.slug,
                    view,
                    description: view.description?.trim(),
                    group: groupName ?? NAVIGATION_DEFAULT_GROUP_NAME
                });
                return acc;
            }, [] as NavigationEntry[]),

            ...(adminViews ?? []).reduce((acc, view) => {
                if (view.hideFromNavigation) return acc;

                const pathKey = view.slug;
                const groupName = NAVIGATION_ADMIN_GROUP_NAME;

                acc.push({
                    id: `admin:${pathKey}`,
                    url: cmsUrlController.buildCMSUrlPath(pathKey),
                    name: view.name.trim(),
                    type: "admin",
                    slug: view.slug,
                    view,
                    description: view.description?.trim(),
                    group: groupName
                });
                return acc;
            }, [] as NavigationEntry[])
        ];

        const groupOrderValue = (groupName?: string): number => {
            if (groupName === NAVIGATION_ADMIN_GROUP_NAME) return 1;
            return 0; // Other groups
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

        // Preserve order from finalNavigationGroupMappings (persisted order)
        const groupsFromMappings = finalNavigationGroupMappings.map(g => g.name);

        // Add any additional groups not in mappings
        const additionalGroups = collectedGroupsFromEntries.filter(g => !groupsFromMappings.includes(g));

        const allDefinedGroups = [
            ...(pluginGroups ?? []),
            ...groupsFromMappings,
            ...additionalGroups
        ];

        // Remove duplicates while preserving order, then separate admin to the end
        const uniqueGroupsArray = [...new Set(allDefinedGroups)];
        const adminGroups = uniqueGroupsArray.filter(g => g === NAVIGATION_ADMIN_GROUP_NAME);
        const nonAdminGroups = uniqueGroupsArray.filter(g => g !== NAVIGATION_ADMIN_GROUP_NAME);
        const uniqueGroups = [...nonAdminGroups, ...adminGroups] as string[];

        return {
            allowDragAndDrop: plugins?.some((plugin: FireCMSPlugin) => plugin.homePage?.allowDragAndDrop) ?? false,
            navigationEntries,
            groups: uniqueGroups,
            onNavigationEntriesUpdate: onNavigationEntriesUpdateCallback!,
        };
    }, [navigationGroupMappings, cmsUrlController.buildCMSUrlPath, cmsUrlController.buildUrlCollectionPath, pluginGroups, plugins]);

    const onNavigationEntriesOrderUpdate = useCallback((entries: NavigationGroupMapping[]) => {
        if (!plugins) {
            return;
        }
        // remove all groups that have no entries
        const filteredEntries = entries.filter(entry => entry.entries.length > 0);

        // Immediately update the local topLevelNavigation with new mappings
        if (collectionRegistryController.collectionRegistryRef.current && viewsRef.current) {
            const updatedNav = computeTopNavigation(
                collectionRegistryController.collectionRegistryRef.current.getCollections(),
                viewsRef.current,
                adminViewsRef.current ?? [],
                viewsOrder,
                filteredEntries,
                onNavigationEntriesOrderUpdate
            );
            setTopLevelNavigation(updatedNav);
        }

        // Then persist to backend
        if (plugins.some((plugin: FireCMSPlugin) => plugin.homePage?.onNavigationEntriesUpdate)) {
            plugins.forEach((plugin: FireCMSPlugin) => {
                if (plugin.homePage?.onNavigationEntriesUpdate) {
                    plugin.homePage.onNavigationEntriesUpdate(filteredEntries);
                }
            });
        }

    }, [plugins, computeTopNavigation, viewsOrder, collectionRegistryController.collectionRegistryRef]);

    const refreshNavigation = useCallback(async () => {

        if (disabled || authController.initialLoading)
            return;

        console.debug("Refreshing navigation");

        try {

            const [resolvedCollections = [], resolvedViews, resolvedAdminViews = []] = await Promise.all(
                [
                    resolveCollections(collectionsProp, collectionPermissions, authController, dataSourceDelegate, plugins),
                    resolveCMSViews(viewsProp, authController, dataSourceDelegate, plugins),
                    resolveCMSViews(adminViewsProp, authController, dataSourceDelegate)
                ]
            );

            const computedTopLevelNav = computeTopNavigation(resolvedCollections, resolvedViews, resolvedAdminViews, viewsOrder, undefined, onNavigationEntriesOrderUpdate);

            let shouldUpdateTopLevelNav = false;
            let collectionsChanged = collectionRegistryController.collectionRegistryRef.current.registerMultiple(resolvedCollections);

            if (collectionsChanged) {
                console.debug("Collections have changed", resolvedCollections);
                shouldUpdateTopLevelNav = true;
            }

            if (!equal(viewsRef.current, resolvedViews)) {
                viewsRef.current = resolvedViews;
                shouldUpdateTopLevelNav = true;
            }
            if (!equal(adminViewsRef.current, resolvedAdminViews)) {
                adminViewsRef.current = resolvedAdminViews;
                shouldUpdateTopLevelNav = true;
            }

            const navigationEntriesOrder = computedTopLevelNav.navigationEntries.map(e => e.id);
            if (!equal(navigationEntriesOrderRef.current, navigationEntriesOrder)) {
                navigationEntriesOrderRef.current = navigationEntriesOrder;
                shouldUpdateTopLevelNav = true;
            }

            if (shouldUpdateTopLevelNav && !equal(topLevelNavigation, computedTopLevelNav)) {
                setTopLevelNavigation(computedTopLevelNav);
            }
        } catch (e) {
            console.error(e);
            setNavigationLoadingError(e as any);
        }

        if (navigationLoading)
            setNavigationLoading(false);

    }, [
        collectionsProp,
        collectionPermissions,
        authController.user,
        authController.initialLoading,
        disabled,
        viewsProp,
        adminViewsProp,
        computeTopNavigation,
        dataSourceDelegate,
        plugins,
        viewsOrder,
        navigationLoading,
        topLevelNavigation,
        onNavigationEntriesOrderUpdate,
        collectionRegistryController.collectionRegistryRef
    ]);

    useEffect(() => {
        refreshNavigation();
    }, [refreshNavigation]);

    return {
        views: viewsRef.current,
        adminViews: adminViewsRef.current,
        topLevelNavigation,
        loading: navigationLoading,
        navigationLoadingError,
        refreshNavigation,
        plugins
    };
}
