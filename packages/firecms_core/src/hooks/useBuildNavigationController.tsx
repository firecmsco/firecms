import { useCallback, useEffect, useRef, useState } from "react";
import equal from "react-fast-compare"
import { useBlocker, useNavigate } from "react-router-dom";

import {
    AuthController,
    CMSView,
    CMSViewsBuilder,
    DataSourceDelegate,
    EntityCollection,
    EntityCollectionsBuilder,
    EntityReference,
    FireCMSPlugin,
    NavigationBlocker,
    NavigationController,
    NavigationEntry,
    NavigationGroupMapping,
    NavigationResult,
    PermissionsBuilder,
    User,
    UserConfigurationPersistence
} from "../types";
import {
    applyPermissionsFunctionIfEmpty,
    getCollectionByPathOrId,
    mergeDeep,
    removeFunctions,
    removeInitialAndTrailingSlashes,
    resolveCollectionPathIds,
    resolvePermissions
} from "../util";
import { getParentReferencesFromPath } from "../util/parent_references_from_path";

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

    const collectionsRef = useRef<EntityCollection[] | undefined>();
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

    const computeTopNavigation = useCallback((collections: EntityCollection[], views: CMSView[], adminViews: CMSView[], viewsOrder?: string[], navigationGroupMappingsOverride?: NavigationGroupMapping[], onNavigationEntriesUpdateCallback?: (entries: NavigationGroupMapping[]) => void): NavigationResult => {

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

                const pathKey = collection.id ?? collection.path;
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
                    path: pathKey,
                    collection,
                    description: collection.description?.trim(),
                    group: groupName ?? NAVIGATION_DEFAULT_GROUP_NAME
                });
                return acc;
            }, [] as NavigationEntry[]),

            ...(views ?? []).reduce((acc, view) => {
                if (view.hideFromNavigation) return acc;

                const pathKey = view.path;
                let groupName = getGroup(view); // Initial group

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
                    url: buildCMSUrlPath(pathKey),
                    name: view.name.trim(),
                    type: "view",
                    path: view.path,
                    view,
                    description: view.description?.trim(),
                    group: groupName ?? NAVIGATION_DEFAULT_GROUP_NAME
                });
                return acc;
            }, [] as NavigationEntry[]),

            ...(adminViews ?? []).reduce((acc, view) => {
                if (view.hideFromNavigation) return acc;

                const pathKey = view.path;
                const groupName = NAVIGATION_ADMIN_GROUP_NAME;

                acc.push({
                    id: `admin:${pathKey}`,
                    url: buildCMSUrlPath(pathKey),
                    name: view.name.trim(),
                    type: "admin",
                    path: view.path,
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
                const getSortPath = (navEntry: NavigationEntry) => typeof navEntry.path === "string" ? navEntry.path : navEntry.path[0];
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
        const uniqueGroups = [...nonAdminGroups, ...adminGroups];

        return {
            allowDragAndDrop: plugins?.some(plugin => plugin.homePage?.allowDragAndDrop) ?? false,
            navigationEntries,
            groups: uniqueGroups,
            onNavigationEntriesUpdate: onNavigationEntriesUpdateCallback!,
        };
    }, [navigationGroupMappings, buildCMSUrlPath, buildUrlCollectionPath, pluginGroups]);

    const onNavigationEntriesOrderUpdate = useCallback((entries: NavigationGroupMapping[]) => {
        if (!plugins) {
            return;
        }
        // remove all groups that have no entries
        const filteredEntries = entries.filter(entry => entry.entries.length > 0);

        // Immediately update the local topLevelNavigation with new mappings
        if (collectionsRef.current && viewsRef.current) {
            const updatedNav = computeTopNavigation(
                collectionsRef.current,
                viewsRef.current,
                adminViewsRef.current ?? [],
                viewsOrder,
                filteredEntries,
                onNavigationEntriesOrderUpdate
            );
            setTopLevelNavigation(updatedNav);
        }

        // Then persist to backend
        if (plugins.some(plugin => plugin.homePage?.onNavigationEntriesUpdate)) {
            plugins.forEach(plugin => {
                if (plugin.homePage?.onNavigationEntriesUpdate) {
                    plugin.homePage.onNavigationEntriesUpdate(filteredEntries);
                }
            });
        }

    }, [plugins, computeTopNavigation, viewsOrder]);

    const refreshNavigation = useCallback(async () => {

        if (disabled || authController.initialLoading)
            return;

        console.debug("Refreshing navigation");

        try {

            const [resolvedCollections = [], resolvedViews, resolvedAdminViews = []] = await Promise.all([
                resolveCollections(collectionsProp, collectionPermissions, authController, dataSourceDelegate, plugins),
                resolveCMSViews(viewsProp, authController, dataSourceDelegate, plugins),
                resolveCMSViews(adminViewsProp, authController, dataSourceDelegate)
            ]
            );

            const computedTopLevelNav = computeTopNavigation(resolvedCollections, resolvedViews, resolvedAdminViews, viewsOrder, undefined, onNavigationEntriesOrderUpdate);

            let shouldUpdateTopLevelNav = false;
            if (!areCollectionListsEqual(collectionsRef.current ?? [], resolvedCollections)) {
                collectionsRef.current = resolvedCollections;
                console.debug("Collections have changed", resolvedCollections);
                shouldUpdateTopLevelNav = true;
            }
            if (collectionsRef.current === undefined) {
                collectionsRef.current = resolvedCollections;
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
        idOrPath: string,
        includeUserOverride = false
    ): EC | undefined => {
        const collections = collectionsRef.current;
        if (!collections)
            return undefined;

        const baseCollection = getCollectionByPathOrId(removeInitialAndTrailingSlashes(idOrPath), collections);

        const userOverride = includeUserOverride ? userConfigPersistence?.getCollectionConfig(idOrPath) : undefined;
        const overriddenCollection = baseCollection ? mergeDeep(baseCollection, userOverride ?? {}) : undefined;

        let result: Partial<EntityCollection> | undefined = overriddenCollection;

        if (overriddenCollection) {
            const subcollections = overriddenCollection.subcollections;
            const callbacks = overriddenCollection.callbacks;
            const permissions = overriddenCollection.permissions;
            result = {
                ...result,
                subcollections: result?.subcollections ?? subcollections,
                callbacks: result?.callbacks ?? callbacks,
                permissions: result?.permissions ?? permissions
            };
        }

        if (!result) return undefined;

        return { ...overriddenCollection, ...result } as EC;

    }, [userConfigPersistence]);

    const getCollectionById = useCallback((id: string): EC | undefined => {
        const collections = collectionsRef.current;
        if (collections === undefined)
            throw Error("getCollectionById: Collections have not been initialised yet");
        const collection: EntityCollection | undefined = collections.find(c => c.id === id);
        if (!collection)
            return undefined;
        return collection as EC;
    }, []);

    const getCollectionFromPaths = useCallback(<EC extends EntityCollection>(pathSegments: string[]): EC | undefined => {

        const collections = collectionsRef.current;
        if (collections === undefined)
            throw Error("getCollectionFromPaths: Collections have not been initialised yet");
        let currentCollections: EntityCollection[] | undefined = [...(collections ?? [])];

        for (let i = 0; i < pathSegments.length; i++) {
            const pathSegment = pathSegments[i];
            const collection: EntityCollection | undefined = currentCollections!.find(c => c.id === pathSegment || c.path === pathSegment);
            if (!collection)
                return undefined;
            currentCollections = collection.subcollections;
            if (i === pathSegments.length - 1)
                return collection as EC;
        }

        return undefined;

    }, []);

    const getCollectionFromIds = useCallback(<EC extends EntityCollection>(ids: string[]): EC | undefined => {

        const collections = collectionsRef.current;
        if (collections === undefined)
            throw Error("getCollectionFromIds: Collections have not been initialised yet");
        let currentCollections: EntityCollection[] | undefined = [...(collections ?? [])];

        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const collection: EntityCollection | undefined = currentCollections!.find(c => c.id === id);
            if (!collection)
                return undefined;
            currentCollections = collection.subcollections;
            if (i === ids.length - 1)
                return collection as EC;
        }

        return undefined;

    }, []);

    const isUrlCollectionPath = useCallback(
        (path: string): boolean => removeInitialAndTrailingSlashes(path + "/").startsWith(removeInitialAndTrailingSlashes(fullCollectionPath) + "/"),
        [fullCollectionPath]);

    const urlPathToDataPath = useCallback((path: string): string => {
        const decodedPath = decodeURIComponent(path);
        if (decodedPath.startsWith(fullCollectionPath))
            return decodedPath.replace(fullCollectionPath, "");
        throw Error("Expected path starting with " + fullCollectionPath);
    }, [fullCollectionPath]);

    const resolveIdsFrom = useCallback((path: string): string => {
        const collections = collectionsRef.current ?? [];
        return resolveCollectionPathIds(path, collections);
    }, []);

    const getAllParentReferencesForPath = useCallback((path: string): EntityReference[] => {
        const collections = collectionsRef.current ?? [];
        return getParentReferencesFromPath({
            path,
            collections
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
        return result.map(r => getCollectionFromPaths(r)?.id).filter(Boolean) as string[];
    }, [getAllParentReferencesForPath])

    const convertIdsToPaths = useCallback((ids: string[]): string[] => {
        const collections = collectionsRef.current;
        let currentCollections = collections;
        const paths: string[] = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const collection: EntityCollection | undefined = currentCollections!.find(c => c.id === id);
            if (!collection)
                throw Error(`Collection with id ${id} not found`);
            paths.push(collection.path);
            currentCollections = collection.subcollections;
        }
        return paths;
    }, [getCollectionFromIds]);

    return {
        collections: collectionsRef.current,
        views: viewsRef.current,
        adminViews: adminViewsRef.current,
        loading: !initialised || navigationLoading,
        navigationLoadingError,
        homeUrl,
        basePath,
        baseCollectionPath,
        initialised,
        getCollection,
        getCollectionById,
        getCollectionFromPaths,
        getCollectionFromIds,
        isUrlCollectionPath,
        urlPathToDataPath,
        buildUrlCollectionPath,
        resolveIdsFrom,
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
        .filter((c) => Boolean(c.path))
        .filter((c) => {
            if (!c.permissions) return true;
            const resolvedPermissions = resolvePermissions(c, authController, c.path, null);
            return resolvedPermissions?.read !== false;
        })
        .map((c) => {
            if (!c.subcollections) return c;
            return {
                ...c,
                subcollections: filterOutNotAllowedCollections(c.subcollections, authController)
            }
        });
}

function applyPluginModifyCollection(resolvedCollections: EntityCollection[], modifyCollection: (collection: EntityCollection) => EntityCollection) {
    return resolvedCollections.map((collection: EntityCollection): EntityCollection => {
        const modifiedCollection = modifyCollection(collection);
        if (modifiedCollection.subcollections) {
            return {
                ...modifiedCollection,
                subcollections: applyPluginModifyCollection(modifiedCollection.subcollections, modifyCollection)
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

async function resolveCMSViews(
    baseViews: CMSView[] | CMSViewsBuilder | undefined,
    authController: AuthController,
    dataSource: DataSourceDelegate,
    plugins?: FireCMSPlugin[]
) {
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

    // Inject views from plugins
    if (plugins) {
        for (const plugin of plugins) {
            if (plugin.views && plugin.views.length > 0) {
                resolvedViews = [...resolvedViews, ...plugin.views];
            }
        }
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
    const aSorted = aCopy.sort((x, y) => x.id.localeCompare(y.id));
    const bSorted = bCopy.sort((x, y) => x.id.localeCompare(y.id));
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
    if (!areCollectionListsEqual(subcollectionsA ?? [], subcollectionsB ?? [])) {
        return false;
    }
    return equal(removeFunctions(restA), removeFunctions(restB));
}

function useCustomBlocker(): NavigationBlocker {
    const [blockListeners, setBlockListeners] = useState<Record<string, {
        block: boolean,
        basePath?: string
    }>>({});

    const shouldBlock = Object.values(blockListeners).some(b => b.block);

    let blocker: any;
    try {
        blocker = useBlocker(({
            nextLocation
        }) => {
            const allBasePaths = Object.values(blockListeners).map(b => b.basePath).filter(Boolean) as string[];
            if (allBasePaths && allBasePaths.some(path => nextLocation.pathname.startsWith(path)))
                return false;
            return shouldBlock;
        });
    } catch (e) {
        // console.warn("Blocker not available, navigation will not be blocked");
    }

    const updateBlockListener = (path: string, block: boolean, basePath?: string) => {
        setBlockListeners(prev => ({
            ...prev,
            [path]: {
                block,
                basePath
            }
        }));
        return () => setBlockListeners(prev => {
            const {
                [path]: removed,
                ...rest
            } = prev;
            return rest;
        })
    };

    const isBlocked = (path: string) => {
        return (blockListeners[path]?.block ?? false) && blocker?.state === "blocked";
    }

    return {
        updateBlockListener,
        isBlocked,
        proceed: blocker?.proceed,
        reset: blocker?.reset
    }
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

    // Merge plugin navigation entries
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

    // Track all entries that are already assigned to groups
    const assignedEntries = new Set<string>();
    if (result) {
        result.forEach(group => {
            group.entries.forEach(entry => assignedEntries.add(entry));
        });
    }

    // Find collections and views that are NOT in any persisted group
    const unassignedGroupMap: Record<string, string[]> = {};

    // Check collections
    (collections ?? []).forEach(collection => {
        const entry = collection.id ?? collection.path;
        if (!assignedEntries.has(entry)) {
            const groupName = getGroup(collection);
            if (!unassignedGroupMap[groupName]) unassignedGroupMap[groupName] = [];
            unassignedGroupMap[groupName].push(entry);
        }
    });

    // Check views
    (views ?? []).forEach(view => {
        const entry = view.path;
        if (!assignedEntries.has(entry)) {
            const groupName = getGroup(view);
            if (!unassignedGroupMap[groupName]) unassignedGroupMap[groupName] = [];
            unassignedGroupMap[groupName].push(entry);
        }
    });

    // Merge unassigned entries into existing groups or create new groups
    Object.entries(unassignedGroupMap).forEach(([groupName, entries]) => {
        if (result) {
            const existingGroup = result.find(g => g.name === groupName);
            if (existingGroup) {
                existingGroup.entries.push(...entries);
            } else {
                result.push({
                    name: groupName,
                    entries
                });
            }
        }
    });

    if (!result) {
        // No persisted data at all - create from scratch
        result = [];
        const groupMap: Record<string, string[]> = {};

        // Add collections
        (collections ?? []).forEach(collection => {
            const name = getGroup(collection);
            const entry = collection.id ?? collection.path;
            if (!groupMap[name]) groupMap[name] = [];
            groupMap[name].push(entry);
        });

        // Add views
        (views ?? []).forEach(view => {
            const name = getGroup(view);
            const entry = view.path;
            if (!groupMap[name]) groupMap[name] = [];
            groupMap[name].push(entry);
        });

        // Convert groupMap to result array
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
