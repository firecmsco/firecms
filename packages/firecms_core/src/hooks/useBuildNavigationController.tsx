import { useCallback, useEffect, useRef, useState } from "react";
import equal from "react-fast-compare"

import {
    AuthController,
    CMSView,
    CMSViewsBuilder,
    DataSourceDelegate,
    EntityCollection,
    EntityCollectionsBuilder,
    EntityReference,
    NavigationBlocker,
    NavigationController,
    PermissionsBuilder,
    TopNavigationEntry,
    TopNavigationResult,
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
import { useBlocker, useNavigate } from "react-router-dom";

const DEFAULT_BASE_PATH = "/";
const DEFAULT_COLLECTION_PATH = "/c";

export type BuildNavigationContextProps<EC extends EntityCollection, USER extends User> = {
    basePath?: string,
    baseCollectionPath?: string,
    authController: AuthController<USER>;
    collections?: EC[] | EntityCollectionsBuilder<EC>;
    collectionPermissions?: PermissionsBuilder;
    views?: CMSView[] | CMSViewsBuilder;
    adminViews?: CMSView[] | CMSViewsBuilder;
    viewsOrder?: string[];
    userConfigPersistence?: UserConfigurationPersistence;
    dataSourceDelegate: DataSourceDelegate;
    /**
     * Use this method to inject collections to the CMS.
     * You receive the current collections as a parameter, and you can return
     * a new list of collections.
     * @see {@link joinCollectionLists}
     * @param collections
     */
    injectCollections?: (collections: EntityCollection[]) => EntityCollection[];

    /**
     * If true, the navigation logic will not be updated until this flag is false
     */
    disabled?: boolean;
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
        userConfigPersistence,
        dataSourceDelegate,
        injectCollections,
        disabled
    } = props;

    const navigate = useNavigate();

    const collectionsRef = useRef<EntityCollection[] | undefined>();
    const viewsRef = useRef<CMSView[] | undefined>();
    const adminViewsRef = useRef<CMSView[] | undefined>();

    const [initialised, setInitialised] = useState<boolean>(false);

    const [topLevelNavigation, setTopLevelNavigation] = useState<TopNavigationResult | undefined>(undefined);
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

    const computeTopNavigation = useCallback((collections: EntityCollection[], views: CMSView[], adminViews: CMSView[], viewsOrder?: string[]): TopNavigationResult => {
        let navigationEntries: TopNavigationEntry[] = [
            ...(collections ?? []).map(collection => (!collection.hideFromNavigation
                ? ({
                    url: buildUrlCollectionPath(collection.id ?? collection.path),
                    type: "collection",
                    name: collection.name.trim(),
                    path: collection.id ?? collection.path,
                    collection,
                    description: collection.description?.trim(),
                    group: getGroup(collection)
                } satisfies TopNavigationEntry)
                : undefined))
                .filter(Boolean) as TopNavigationEntry[],
            ...(views ?? []).map(view =>
                !view.hideFromNavigation
                    ? ({
                        url: buildCMSUrlPath(Array.isArray(view.path) ? view.path[0] : view.path),
                        name: view.name.trim(),
                        type: "view",
                        path: view.path,
                        view,
                        description: view.description?.trim(),
                        group: getGroup(view)
                    } satisfies TopNavigationEntry)
                    : undefined)
                .filter(Boolean) as TopNavigationEntry[],
            ...(adminViews ?? []).map(view =>
                !view.hideFromNavigation
                    ? ({
                        url: buildCMSUrlPath(Array.isArray(view.path) ? view.path[0] : view.path),
                        name: view.name.trim(),
                        type: "admin",
                        path: view.path,
                        view,
                        description: view.description?.trim(),
                        group: "Admin"
                    } satisfies TopNavigationEntry)
                    : undefined)
                .filter(Boolean) as TopNavigationEntry[]
        ];

        // Sort by group, entries with group "Admin" will go last, and second to last will be the group "Views"
        navigationEntries = navigationEntries.sort((a, b) => {
            if (a.group !== "Views" && a.group !== "Admin" && (b.group === "Views" || b.group === "Admin")) {
                return -1;
            }
            if (b.group !== "Views" && b.group !== "Admin" && (a.group === "Views" || a.group === "Admin")) {
                return 1;
            }
            if (a.group === "Admin" && b.group !== "Admin") {
                return 1;
            }
            if (a.group !== "Admin" && b.group === "Admin") {
                return -1;
            }
            if (a.group === "Views" && b.group !== "Views") {
                return -1;
            }
            if (a.group !== "Views" && b.group === "Views") {
                return 1;
            }
            return 0;

        });

        if (viewsOrder) {
            navigationEntries = navigationEntries.sort((a, b) => {
                const aIndex = viewsOrder.indexOf(a.path);
                const bIndex = viewsOrder.indexOf(b.path);
                if (aIndex === -1 && bIndex === -1) {
                    return 0;
                }
                if (aIndex === -1) {
                    return 1;
                }
                if (bIndex === -1) {
                    return -1;
                }
                return aIndex - bIndex;
            });
        }

        const groups: string[] = Object.values(navigationEntries)
            .map(e => e.group)
            .filter(Boolean)
            .filter((value, index, array) => array.indexOf(value) === index) as string[];

        return {
            navigationEntries,
            groups
        };
    }, [buildCMSUrlPath, buildUrlCollectionPath]);

    const refreshNavigation = useCallback(async () => {

        if (disabled || authController.initialLoading)
            return;

        console.debug("Refreshing navigation");

        try {

            const [resolvedCollections = [], resolvedViews, resolvedAdminViews = []] = await Promise.all([
                    resolveCollections(collectionsProp, collectionPermissions, authController, dataSourceDelegate, injectCollections),
                    resolveCMSViews(viewsProp, authController, dataSourceDelegate),
                    resolveCMSViews(adminViewsProp, authController, dataSourceDelegate)
                ]
            );

            let shouldUpdateTopLevelNav = false;
            if (!areCollectionListsEqual(collectionsRef.current ?? [], resolvedCollections)) {
                collectionsRef.current = resolvedCollections;
                console.log("Collections have changed", resolvedCollections);
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

            const computedTopLevelNav = computeTopNavigation(resolvedCollections, resolvedViews, resolvedAdminViews, viewsOrder);
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
        injectCollections
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
        if (path.startsWith(fullCollectionPath))
            return path.replace(fullCollectionPath, "");
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

async function resolveCollections(collections: undefined | EntityCollection[] | EntityCollectionsBuilder<any>,
                                  collectionPermissions: PermissionsBuilder | undefined,
                                  authController: AuthController,
                                  dataSource: DataSourceDelegate,
                                  injectCollections?: (collections: EntityCollection[]) => EntityCollection[]): Promise<EntityCollection[]> {
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

    if (injectCollections) {
        resolvedCollections = injectCollections(resolvedCollections ?? []);
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
        return "Views";
    }
    return trimmed ?? "Views";
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
        console.warn("Blocker not available, navigation will not be blocked");
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
