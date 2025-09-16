import { useCallback, useEffect, useRef, useState } from "react";
import equal from "react-fast-compare"
import { useNavigate } from "react-router-dom";

import {
    AuthController,
    CMSView,
    CMSViewsBuilder,
    DataSourceDelegate,
    EntityCollection,
    EntityCollectionsBuilder,
    EntityReference,
    FireCMSPlugin,
    NavigationController,
    NavigationEntry,
    NavigationGroupMapping,
    NavigationResult,
    PermissionsBuilder,
    User,
    UserConfigurationPersistence
} from "@firecms/types";
import {
    applyPermissionsFunctionIfEmpty,
    CollectionRegistry,
    getParentReferencesFromPath,
    getSubcollections,
    mergeDeep,
    removeFunctions,
    removeInitialAndTrailingSlashes,
    resolveCollectionPathIds,
    resolvePermissions
} from "@firecms/common";

const DEFAULT_BASE_PATH = "/";
const DEFAULT_COLLECTION_PATH = "/c";

export const NAVIGATION_DEFAULT_GROUP_NAME = "Views";
export const NAVIGATION_ADMIN_GROUP_NAME = "Admin";

export type BuildNavigationContextProps<EC extends EntityCollection, USER extends User> = {
    /**
     * Base path for the CMS, used to build the all the URLs.
     * Defaults to "/".
     */
    basePath?: string,
    /**
     * Base path for the collections, used to build the collection URLs.
     * Defaults to "c" (e.g. "/c/products").
     */
    baseCollectionPath?: string,
    /**
     * The auth controller used to manage the user authentication and permissions.
     */
    authController: AuthController<USER>;
    /**
     * The collections to be used in the CMS.
     * This can be a static array of collections or a function that returns a promise
     * resolving to an array of collections.
     */
    collections?: EC[] | EntityCollectionsBuilder<EC>;
    /**
     * Optional permissions builder to be applied to the collections.
     * If not provided, the permissions will be resolved from the collection configuration.
     */
    collectionPermissions?: PermissionsBuilder;
    /**
     * Custom views to be added to the CMS, these will be available in the main navigation.
     * This can be a static array of views or a function that returns a promise
     * resolving to an array of views.
     */
    views?: CMSView[] | CMSViewsBuilder;
    /**
     * Custom views to be added to the CMS admin navigation.
     * This can be a static array of views or a function that returns a promise
     * resolving to an array of views.
     */
    adminViews?: CMSView[] | CMSViewsBuilder;
    /**
     * Controller for storing user preferences.
     */
    userConfigPersistence?: UserConfigurationPersistence;
    /**
     * Delegate for data source operations, used to resolve collections and views.
     */
    dataSourceDelegate: DataSourceDelegate;
    /**
     * Plugins to be used in the CMS.
     */
    plugins?: FireCMSPlugin[];
    /**
     * Used to define the name of groups and order of the navigation entries.
     */
    navigationGroupMappings?: NavigationGroupMapping[];
    /**
     * If true, the navigation logic will not be updated until this flag is false
     */
    disabled?: boolean;

    /**
     * @deprecated
     * Use `navigationGroupMappings` instead.
     */
    viewsOrder?: string[];
};

export function useBuildNavigationController<EC extends EntityCollection, USER extends User>(props: BuildNavigationContextProps<EC, USER>): NavigationController {
    const {
        basePath = DEFAULT_BASE_PATH,
        baseCollectionPath = DEFAULT_COLLECTION_PATH,
        authController,
        collections: collectionsProp,
        collectionPermissions,
        views: viewsProp,
        adminViews: adminViewsProp,
        viewsOrder,
        plugins,
        userConfigPersistence,
        dataSourceDelegate,
        disabled,
        navigationGroupMappings
    } = props;

    const navigate = useNavigate();

    const collectionRegistryRef = useRef<CollectionRegistry>(new CollectionRegistry());

    const resolvedCollectionsRef = useRef<EntityCollection[] | undefined>();
    const viewsRef = useRef<CMSView[] | undefined>();
    const adminViewsRef = useRef<CMSView[] | undefined>();
    const navigationEntriesOrderRef = useRef<string[] | undefined>();

    const [initialised, setInitialised] = useState<boolean>(false);

    const [topLevelNavigation, setTopLevelNavigation] = useState<NavigationResult | undefined>(undefined);
    const [navigationLoading, setNavigationLoading] = useState<boolean>(true);
    const [navigationLoadingError, setNavigationLoadingError] = useState<Error | undefined>(undefined);

    const cleanBasePath = removeInitialAndTrailingSlashes(basePath);
    const cleanBaseCollectionPath = removeInitialAndTrailingSlashes(baseCollectionPath);

    const homeUrl = cleanBasePath ? `/${cleanBasePath}` : "/";

    const fullCollectionPath = cleanBasePath ? `/${cleanBasePath}/${cleanBaseCollectionPath}` : `/${cleanBaseCollectionPath}`;

    const buildCMSUrlPath = useCallback((path: string): string => cleanBasePath ? `/${cleanBasePath}/${encodePath(path)}` : `/${encodePath(path)}`,
        [cleanBasePath]);

    const buildUrlCollectionPath = useCallback((path: string): string => `${removeInitialAndTrailingSlashes(baseCollectionPath)}/${encodePath(path)}`,
        [baseCollectionPath]);

    const allPluginGroups = plugins?.flatMap(plugin => plugin.homePage?.navigationEntries ? plugin.homePage.navigationEntries.map(e => e.name) : []) ?? [];
    const pluginGroups = [...new Set(allPluginGroups)];

    const onNavigationEntriesOrderUpdate = useCallback((entries: NavigationGroupMapping[]) => {
        if (!plugins) {
            return;
        }
        // remove all groups that have no entries
        const filteredEntries = entries.filter(entry => entry.entries.length > 0);
        if (plugins.some(plugin => plugin.homePage?.onNavigationEntriesUpdate)) {
            plugins.forEach(plugin => {
                if (plugin.homePage?.onNavigationEntriesUpdate) {
                    plugin.homePage.onNavigationEntriesUpdate(filteredEntries);
                }
            });
        }

    }, [plugins]);

    const computeTopNavigation = useCallback((collections: EntityCollection[], views: CMSView[], adminViews: CMSView[], viewsOrder?: string[]): NavigationResult => {

        const finalNavigationGroupMappings: NavigationGroupMapping[] = computeNavigationGroups({
            navigationGroupMappings: navigationGroupMappings,
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
                let groupName = getGroup(collection); // Initial group

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
                    url: buildUrlCollectionPath(pathKey),
                    type: "collection",
                    name: collection.name.trim(),
                    slug: pathKey,
                    collection,
                    description: collection.description?.trim(),
                    group: groupName ?? NAVIGATION_DEFAULT_GROUP_NAME
                });
                return acc;
            }, [] as NavigationEntry[]),

            // ...(views ?? []).reduce((acc, view) => {
            //     if (view.hideFromNavigation) return acc;
            //
            //     const pathKey = Array.isArray(view.slug) ? view.slug[0] : view.slug;
            //     let groupName = getGroup(view); // Initial group
            //
            //     if (finalNavigationGroupMappings) {
            //         for (const pluginGroupDef of finalNavigationGroupMappings) {
            //             if (pluginGroupDef.entries.includes(pathKey)) {
            //                 groupName = pluginGroupDef.name;
            //                 break;
            //             }
            //         }
            //     }
            //
            //     acc.push({
            //         id: `view:${pathKey}`,
            //         url: buildCMSUrlPath(pathKey),
            //         name: view.name.trim(),
            //         type: "view",
            //         slug: view.slug,
            //         view,
            //         description: view.description?.trim(),
            //         group: groupName ?? NAVIGATION_DEFAULT_GROUP_NAME
            //     });
            //     return acc;
            // }, [] as NavigationEntry[]),
            //
            // ...(adminViews ?? []).reduce((acc, view) => {
            //     if (view.hideFromNavigation) return acc;
            //
            //     const pathKey = Array.isArray(view.slug) ? view.slug[0] : view.slug;
            //     const groupName = NAVIGATION_ADMIN_GROUP_NAME;
            //
            //     acc.push({
            //         id: `admin:${pathKey}`,
            //         url: buildCMSUrlPath(pathKey),
            //         name: view.name.trim(),
            //         type: "admin",
            //         slug: view.slug,
            //         view,
            //         description: view.description?.trim(),
            //         group: groupName
            //     });
            //     return acc;
            // }, [] as NavigationEntry[])
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

        const allDefinedGroups = [
            ...(pluginGroups ?? []),
            ...collectedGroupsFromEntries
        ];

        const uniqueGroups = [...new Set(allDefinedGroups)]
            .sort((a, b) => groupOrderValue(a) - groupOrderValue(b));

        return {
            allowDragAndDrop: plugins?.some(plugin => plugin.homePage?.allowDragAndDrop) ?? false,
            navigationEntries,
            groups: uniqueGroups,
            onNavigationEntriesUpdate: onNavigationEntriesOrderUpdate,
        };
    }, [navigationGroupMappings, buildCMSUrlPath, buildUrlCollectionPath, pluginGroups, onNavigationEntriesOrderUpdate]);

    const refreshNavigation = useCallback(async () => {

        if (disabled || authController.initialLoading)
            return;

        console.debug("Refreshing navigation");

        try {

            const [resolvedCollections = [], resolvedViews, resolvedAdminViews = []] = await Promise.all(
                [
                    resolveCollections(collectionsProp, collectionPermissions, authController, dataSourceDelegate, plugins),
                    resolveCMSViews(viewsProp, authController, dataSourceDelegate),
                    resolveCMSViews(adminViewsProp, authController, dataSourceDelegate)
                ]
            );

            const computedTopLevelNav = computeTopNavigation(resolvedCollections, resolvedViews, resolvedAdminViews, viewsOrder);

            let shouldUpdateTopLevelNav = false;
            let collectionsChanged = !areCollectionListsEqual(resolvedCollectionsRef.current ?? [], resolvedCollections);
            if (resolvedCollectionsRef.current === undefined) {
                collectionsChanged = true;
            }

            if (collectionsChanged) {
                resolvedCollectionsRef.current = resolvedCollections;
                console.debug("Collections have changed", resolvedCollections);
                collectionRegistryRef.current.reset();
                collectionRegistryRef.current.registerMultiple(resolvedCollections);
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
        if (!initialised)
            setInitialised(true);

    }, [
        collectionsProp,
        collectionPermissions,
        authController.user,
        authController.initialLoading,
        disabled,
        viewsProp,
        adminViewsProp,
        computeTopNavigation,
    ]);

    useEffect(() => {
        refreshNavigation();
    }, [refreshNavigation]);

    const getCollection = useCallback((
        slugOrPath: string,
        includeUserOverride = false
    ): EC | undefined => {

        const registry = collectionRegistryRef.current;

        const cleanedPath = removeInitialAndTrailingSlashes(slugOrPath);
        if (!cleanedPath) return undefined;

        const pathSegments = cleanedPath.split("/");

        let collectionPath = cleanedPath;
        // If the path has an even number of segments, it points to an entity, so we get the parent collection
        if (pathSegments.length > 0 && pathSegments.length % 2 === 0) {
            collectionPath = pathSegments.slice(0, -1).join("/");
        }

        if (!collectionPath) return undefined;

        let collection: EntityCollection | undefined;
        try {
            collection = registry.resolvePathToCollections(collectionPath).finalCollection;
        } catch (e) {
            // This can happen if the path is not a valid collection path, which is a valid case.
            // We just return undefined.
            console.debug(`Could not resolve path to collection: ${collectionPath}`, e);
            return undefined;
        }

        if (!collection) {
            return undefined;
        }

        const userOverride = includeUserOverride ? userConfigPersistence?.getCollectionConfig(slugOrPath) : undefined;
        const overriddenCollection = collection ? mergeDeep(collection, userOverride ?? {}) : undefined;

        if (!overriddenCollection) return undefined;

        // This is to preserve functions that are lost in `mergeDeep`
        let result: Partial<EntityCollection> | undefined = overriddenCollection;
        const subcollections = overriddenCollection.subcollections;
        const callbacks = overriddenCollection.callbacks;
        const permissions = overriddenCollection.permissions;
        result = {
            ...result,
            subcollections: result?.subcollections ?? subcollections,
            callbacks: result?.callbacks ?? callbacks,
            permissions: result?.permissions ?? permissions
        };

        return { ...overriddenCollection, ...result } as EC;

    }, [userConfigPersistence]);

    const getCollectionBySlug = useCallback((slug: string): EC | undefined => {
        const registry = collectionRegistryRef.current;
        if (registry === undefined)
            throw Error("getCollectionById: Collections have not been initialised yet");
        return registry.get(slug) as EC | undefined;
    }, []);

    const getCollectionFromPaths = useCallback(<EC extends EntityCollection>(pathSegments: string[]): EC | undefined => {
        const registry = collectionRegistryRef.current;
        if (registry === undefined)
            throw Error("getCollectionFromPaths: Collections have not been initialised yet");

        if (!pathSegments?.length) {
            return undefined;
        }

        const path = pathSegments.reduce((acc, segment, i) => {
            if (i === 0) return segment;
            return `${acc}/fake_id/${segment}`;
        }, "");

        try {
            const { finalCollection } = registry.resolvePathToCollections(path);
            return finalCollection as EC | undefined;
        } catch (e) {
            console.debug(`Could not resolve path segments to collection: ${pathSegments.join("/")}`, e);
            return undefined;
        }
    }, []);

    const getCollectionFromIds = useCallback(<EC extends EntityCollection>(ids: string[]): EC | undefined => {
        const registry = collectionRegistryRef.current;
        if (registry === undefined)
            throw Error("getCollectionFromIds: Collections have not been initialised yet");

        if (!ids?.length) {
            return undefined;
        }

        const path = ids.reduce((acc, segment, i) => {
            if (i === 0) return segment;
            return `${acc}/fake_id/${segment}`;
        }, "");

        try {
            const { finalCollection } = registry.resolvePathToCollections(path);
            return finalCollection as EC | undefined;
        } catch (e) {
            console.debug(`Could not resolve ids to collection: ${ids.join("/")}`, e);
            return undefined;
        }
    }, []);

    const isUrlCollectionPath = useCallback(
        (path: string): boolean => removeInitialAndTrailingSlashes(path + "/").startsWith(removeInitialAndTrailingSlashes(fullCollectionPath) + "/"),
        [fullCollectionPath]);

    const urlPathToDataPath = useCallback((path: string): string => {
        if (path.startsWith(fullCollectionPath))
            return path.replace(fullCollectionPath, "");
        throw Error("Expected path starting with " + fullCollectionPath);
    }, [fullCollectionPath]);

    const resolveIdsFrom = useCallback((path: string): string => {
        const registry = collectionRegistryRef.current;
        if (!registry) {
            return resolveCollectionPathIds(path, []);
        }
        return resolveCollectionPathIds(path, registry.getAllCollectionsRecursively());
    }, []);

    const getAllParentReferencesForPath = useCallback((path: string): EntityReference[] => {
        const registry = collectionRegistryRef.current;
        if (!registry) {
            return [];
        }
        return getParentReferencesFromPath({
            path,
            collections: registry.getAllCollectionsRecursively()
        });
    }, []);

    const getParentCollectionIds = useCallback((path: string): string[] => {

        const strings = path.split("/");
        const oddPathSegments = strings.filter((_, i) => i % 2 === 0);
        oddPathSegments.pop();

        const result: string[][] = [];

        for (let i = 1; i <= oddPathSegments.length; i++) {
            result.push(oddPathSegments.slice(0, i));
        }

        // for each odd path segment, get the collection
        return result.map(r => getCollectionFromPaths(r)?.slug).filter(Boolean) as string[];
    }, [getAllParentReferencesForPath])

    const convertIdsToPaths = useCallback((ids: string[]): string[] => {
        const registry = collectionRegistryRef.current;
        if (!registry) {
            throw new Error("convertIdsToPaths: collectionRegistryRef not initialised");
        }
        let currentCollections: EntityCollection[] = registry.getAllCollectionsRecursively();
        const paths: string[] = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const collection: EntityCollection | undefined = currentCollections.find(c => c.slug === id);
            if (!collection)
                throw Error(`Collection with id ${id} not found`);
            paths.push(collection.dbPath);
            currentCollections = getSubcollections(collection) ?? [];
        }
        return paths;
    }, []);

    return {
        collections: resolvedCollectionsRef.current,
        views: viewsRef.current,
        adminViews: adminViewsRef.current,
        loading: !initialised || navigationLoading,
        navigationLoadingError,
        homeUrl,
        basePath,
        baseCollectionPath,
        initialised,
        getCollection,
        getCollectionById: getCollectionBySlug,
        getCollectionFromPaths,
        getCollectionFromIds,
        isUrlCollectionPath,
        urlPathToDataPath,
        buildUrlCollectionPath,
        resolveDatabasePathsFrom: resolveIdsFrom,
        topLevelNavigation,
        refreshNavigation,
        getParentReferencesFromPath: getAllParentReferencesForPath,
        getParentCollectionIds,
        convertIdsToPaths,
        navigate,
        plugins
    };
}

function encodePath(input: string) {
    return encodeURIComponent(removeInitialAndTrailingSlashes(input))
        .replaceAll("%2F", "/")
        .replaceAll("%23", "#");
}

function filterOutNotAllowedCollections(resolvedCollections: EntityCollection[], authController: AuthController<User>): EntityCollection[] {
    return resolvedCollections
        .filter((c) => {
            if (!c.permissions) return true;
            const resolvedPermissions = resolvePermissions(c, authController, c.slug, null);
            return resolvedPermissions?.read !== false;
        })
        .map((c) => {
            if (!c.subcollections) return c;
            return {
                ...c,
                subcollections: () => filterOutNotAllowedCollections(c.subcollections?.() ?? [], authController)
            }
        });
}

function applyPluginModifyCollection(resolvedCollections: EntityCollection[], modifyCollection: (collection: EntityCollection) => EntityCollection) {
    return resolvedCollections.map((collection: EntityCollection): EntityCollection => {
        const modifiedCollection = modifyCollection(collection);
        if (modifiedCollection.subcollections) {
            return {
                ...modifiedCollection,
                subcollections: () => applyPluginModifyCollection(modifiedCollection.subcollections?.() ?? [], modifyCollection)
            } satisfies EntityCollection;
        }
        return modifiedCollection;
    });
}

async function resolveCollections(collections: undefined | EntityCollection[] | EntityCollectionsBuilder<any>,
                                  collectionPermissions: PermissionsBuilder | undefined,
                                  authController: AuthController,
                                  dataSource: DataSourceDelegate,
                                  plugins: FireCMSPlugin[] | undefined): Promise<EntityCollection[]> {
    let resolvedCollections: EntityCollection[] = [];
    if (typeof collections === "function") {
        resolvedCollections = await collections({
            user: authController.user,
            authController,
            dataSource
        });
    } else if (Array.isArray(collections)) {
        resolvedCollections = collections;
    }

    if (plugins) {
        for (const plugin of plugins) {
            if (plugin.collection?.modifyCollection) {
                resolvedCollections = applyPluginModifyCollection(resolvedCollections, plugin.collection.modifyCollection);
            }

            if (plugin.collection?.injectCollections) {
                resolvedCollections = plugin.collection.injectCollections(resolvedCollections ?? []);
            }
        }
    }

    resolvedCollections = applyPermissionsFunctionIfEmpty(resolvedCollections, collectionPermissions);
    resolvedCollections = filterOutNotAllowedCollections(resolvedCollections, authController);
    return resolvedCollections;
}

async function resolveCMSViews(baseViews: CMSView[] | CMSViewsBuilder | undefined, authController: AuthController, dataSource: DataSourceDelegate) {
    let resolvedViews: CMSView[] = [];
    if (typeof baseViews === "function") {
        resolvedViews = await baseViews({
            user: authController.user,
            authController,
            dataSource
        });
    } else if (Array.isArray(baseViews)) {
        resolvedViews = baseViews;
    }
    return resolvedViews;
}

function getGroup(collectionOrView: EntityCollection<any, any> | CMSView) {
    const trimmed = collectionOrView.group?.trim();
    if (!trimmed || trimmed === "") {
        return NAVIGATION_DEFAULT_GROUP_NAME;
    }
    return trimmed ?? NAVIGATION_DEFAULT_GROUP_NAME;
}

function areCollectionListsEqual(a: EntityCollection[], b: EntityCollection[]) {
    if (a.length !== b.length) {
        return false;
    }
    const aCopy = [...a];
    const bCopy = [...b];
    const aSorted = aCopy.sort((x, y) => x.slug.localeCompare(y.slug));
    const bSorted = bCopy.sort((x, y) => x.slug.localeCompare(y.slug));
    return aSorted.every((value, index) => areCollectionsEqual(value, bSorted[index]));
}

function areCollectionsEqual(a: EntityCollection, b: EntityCollection) {
    const {
        subcollections: subcollectionsA,
        ...restA
    } = a;
    const {
        subcollections: subcollectionsB,
        ...restB
    } = b;
    if (!areCollectionListsEqual(subcollectionsA?.() ?? [], subcollectionsB?.() ?? [])) {
        return false;
    }
    return equal(removeFunctions(restA), removeFunctions(restB));
}

function computeNavigationGroups({
                                     navigationGroupMappings,
                                     collections,
                                     views,
                                     plugins
                                 }: {
    navigationGroupMappings?: NavigationGroupMapping[],
    collections?: EntityCollection[],
    views?: CMSView[],
    plugins?: FireCMSPlugin[]
}): NavigationGroupMapping[] {

    let result = navigationGroupMappings;

    result = plugins ? plugins?.reduce((acc, plugin) => {
        if (plugin.homePage?.navigationEntries) {
            plugin.homePage.navigationEntries.forEach((entry) => {
                const {
                    name,
                    entries
                } = entry;
                const existingGroup = acc.find(entry => entry.name === name);
                if (existingGroup) {
                    existingGroup.entries.push(...entries);
                } else {
                    acc.push({
                        name,
                        entries: [...entries]
                    });
                }
            });

        }
        return acc;
    }, [...(result ?? [])] as NavigationGroupMapping[]) : result;

    if (!result) {
        // Convert views and collections to navigation group mappings, grouped by their group name
        result = [];
        const groupMap: Record<string, string[]> = {};

        // Add collections
        (collections ?? []).forEach(collection => {
            const name = getGroup(collection);
            const entry = collection.slug;
            if (!groupMap[name]) groupMap[name] = [];
            groupMap[name].push(entry);
        });

        // Add views
        (views ?? []).forEach(view => {
            const name = getGroup(view);
            const entry = Array.isArray(view.slug) ? view.slug[0] : view.slug;
            if (!groupMap[name]) groupMap[name] = [];
            groupMap[name].push(entry);
        });

        // Convert groupMap to initialGroupMappings array
        result = Object.entries(groupMap).map(([name, entries]) => ({
            name,
            entries
        }));
    }

    // Remove duplicates in entries
    result.forEach(group => {
        group.entries = [...new Set(group.entries)];
    });

    return result;
}
