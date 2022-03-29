import React, { useCallback, useEffect, useState } from "react";
import {
    AuthController,
    CMSView,
    CollectionOverrideHandler,
    EntityCollection,
    LocalEntityCollection,
    NavigationContext,
    TopNavigationEntry,
    TopNavigationResult,
    UserConfigurationPersistence
} from "../../models";
import {
    getCollectionByPath,
    removeInitialAndTrailingSlashes
} from "../util/navigation_utils";
import { mergeDeep } from "../util/objects";
import { ConfigurationPersistence } from "../../models/config_persistence";
import { mergeCollections } from "../util/collections";
import {
    canDeleteCollection,
    canEditCollection,
    resolvePermissions
} from "../util/permissions";
import { fullPathToCollectionSegments } from "../util/paths";

type BuildNavigationContextProps<UserType> = {
    basePath: string,
    baseCollectionPath: string,
    authController: AuthController<UserType>;
    collections?: EntityCollection[];
    views?: CMSView[];
    collectionOverrideHandler: CollectionOverrideHandler | undefined;
    configPersistence?: ConfigurationPersistence;
    userConfigPersistence?: UserConfigurationPersistence;
};

function joinCollections(fetchedCollections: EntityCollection[], baseCollections: EntityCollection[] | undefined) {
    const resolvedFetchedCollections: EntityCollection[] = fetchedCollections.map(c => ({
        ...c,
        editable: true,
        deletable: true
    }));
    const updatedCollections = (baseCollections ?? [])
        .map((navigationCollection) => {
            const storedCollection = resolvedFetchedCollections?.find((collection) => collection.path === navigationCollection.path);
            if (!storedCollection) {
                return { ...navigationCollection, deletable: false };
            } else {
                const mergedCollection = mergeCollections(navigationCollection, storedCollection);
                return { ...mergedCollection, deletable: false };
            }
        });
    const storedCollections = resolvedFetchedCollections
        .filter((col) => !updatedCollections.map(c => c.path).includes(col.path));

    return [...updatedCollections, ...storedCollections];
}

export function useBuildNavigationContext<UserType>({
                                                        basePath,
                                                        baseCollectionPath,
                                                        authController,
                                                        collections: baseCollections,
                                                        views: baseViews,
                                                        collectionOverrideHandler,
                                                        configPersistence,
                                                        userConfigPersistence
                                                    }: BuildNavigationContextProps<UserType>): NavigationContext {

    const [collections, setCollections] = useState<EntityCollection[] | undefined>();
    const [views, setViews] = useState<CMSView[] | undefined>();
    const [initialised, setInitialised] = useState<boolean>(false);

    const [topLevelNavigation, setTopLevelNavigation] = useState<TopNavigationResult | undefined>(undefined);
    const [navigationLoading, setNavigationLoading] = useState<boolean>(true);
    const [navigationLoadingError, setNavigationLoadingError] = useState<Error | undefined>(undefined);

    const cleanBasePath = removeInitialAndTrailingSlashes(basePath);
    const cleanBaseCollectionPath = removeInitialAndTrailingSlashes(baseCollectionPath);

    const homeUrl = cleanBasePath ? `/${cleanBasePath}` : "/";

    const fullCollectionPath = cleanBasePath ? `/${cleanBasePath}/${cleanBaseCollectionPath}` : `/${cleanBaseCollectionPath}`;

    useEffect(() => {
        if (configPersistence?.loading) {
            return;
        }
        if (!authController.canAccessMainView) {
            setNavigationLoading(false);
            return;
        }
        setNavigationLoading(true);

        let collectionsResult = baseCollections;
        const viewsResult = baseViews;
        if (configPersistence?.collections) {
            const allCollections = joinCollections(configPersistence.collections, baseCollections);
            collectionsResult = resolveCollectionsPermissions(allCollections, authController);
        }
        setCollections(collectionsResult);
        setViews(viewsResult);

        setTopLevelNavigation(computeTopNavigation(collectionsResult ?? [], viewsResult ?? []));
        setNavigationLoading(false);
        setInitialised(true);

    }, [authController.user, authController.canAccessMainView, configPersistence]);

    const getCollection = useCallback(<M extends { [Key: string]: any }>(
        path: string,
        entityId?: string
    ): EntityCollection<M> => {

        const baseCollection = getCollectionByPath<M>(removeInitialAndTrailingSlashes(path), collections);

        const collectionOverride = getCollectionOverride(path);

        const overriddenCollection = baseCollection ? mergeDeep(baseCollection, collectionOverride) : undefined;

        let result: Partial<EntityCollection> = {};

        const resolvedProps: Partial<EntityCollection> | undefined = collectionOverrideHandler && collectionOverrideHandler({
            entityId,
            path: removeInitialAndTrailingSlashes(path)
        });

        if (resolvedProps)
            result = resolvedProps;

        if (overriddenCollection) {
            const subcollections = overriddenCollection.subcollections;
            const callbacks = overriddenCollection.callbacks;
            const permissions = overriddenCollection.permissions;
            result = {
                ...result,
                subcollections: result.subcollections ?? subcollections,
                callbacks: result.callbacks ?? callbacks,
                permissions: result.permissions ?? permissions
            };
        }

        return { ...overriddenCollection, ...(result as EntityCollection<M>) };

    }, [
        basePath,
        baseCollectionPath,
        collections,
        collectionOverrideHandler
    ]);

    const isUrlCollectionPath = useCallback(
        (path: string): boolean => removeInitialAndTrailingSlashes(path + "/").startsWith(removeInitialAndTrailingSlashes(fullCollectionPath) + "/"),
        [fullCollectionPath]);

    const urlPathToDataPath = useCallback((path: string): string => {
        if (path.startsWith(fullCollectionPath))
            return path.replace(fullCollectionPath, "");
        throw Error("Expected path starting with " + fullCollectionPath);
    }, [fullCollectionPath]);

    const buildUrlEditCollectionPath = useCallback(({
                                                        path
                                                    }: { path: string }): string => {
            return `s/edit/${encodePath(path)}`;
        },
        [baseCollectionPath]);

    const buildUrlCollectionPath = useCallback((path: string): string => `${baseCollectionPath}/${encodePath(path)}`,
        [baseCollectionPath]);

    const buildCMSUrlPath = useCallback((path: string): string => cleanBasePath ? `/${cleanBasePath}/${encodePath(path)}` : `/${encodePath(path)}`,
        [cleanBasePath]);

    const getCollectionOverride = useCallback(<M, >(path: string): LocalEntityCollection<M> | undefined => {
        if (!userConfigPersistence)
            return undefined
        return userConfigPersistence.getCollectionConfig<M>(path);
    }, [userConfigPersistence]);

    const computeTopNavigation = (collections: EntityCollection[], views: CMSView[]): TopNavigationResult => {

        const navigationEntries: TopNavigationEntry[] = [
            ...(collections ?? []).map(collection => ({
                url: buildUrlCollectionPath(collection.path),
                type: "collection",
                name: collection.name,
                path: collection.path,
                deletable: collection.deletable && canDeleteCollection(collection.permissions, collection, authController, fullPathToCollectionSegments(collection.path)),
                editable: collection.editable && canEditCollection(collection.permissions, collection, authController, fullPathToCollectionSegments(collection.path)),
                description: collection.description?.trim(),
                group: collection.group?.trim()
            } as TopNavigationEntry)),
            ...(views ?? []).map(view =>
                !view.hideFromNavigation
                    ? ({
                        url: buildCMSUrlPath(Array.isArray(view.path) ? view.path[0] : view.path),
                        name: view.name,
                        type: "view",
                        description: view.description,
                        group: view.group
                    })
                    : undefined)
                .filter((view) => !!view) as TopNavigationEntry[]
        ];

        const groups: string[] = Array.from(new Set(
            Object.values(navigationEntries).map(e => e.group).filter(Boolean) as string[]
        ).values());

        return { navigationEntries, groups };
    };

    return {
        collections,
        views,
        loading: !initialised || navigationLoading,
        navigationLoadingError,
        homeUrl,
        basePath,
        baseCollectionPath,
        initialised,
        getCollection,
        isUrlCollectionPath,
        urlPathToDataPath,
        buildUrlCollectionPath,
        buildUrlEditCollectionPath,
        buildCMSUrlPath,
        topLevelNavigation
    };
}

export function getSidePanelKey(path: string, entityId?: string) {
    if (entityId)
        return `${removeInitialAndTrailingSlashes(path)}/${removeInitialAndTrailingSlashes(entityId)}`;
    else
        return removeInitialAndTrailingSlashes(path);
}

function encodePath(input: string) {
    return encodeURIComponent(removeInitialAndTrailingSlashes(input))
        .replaceAll("%2F", "/")
        .replaceAll("%23", "#");
}

function resolveCollectionsPermissions<M>(collections: EntityCollection<M>[],
                                          authController: AuthController,
                                          paths: string[] = []): EntityCollection<M>[] {
    return collections.map((collection) => ({
        ...collection,
        subcollections: collection.subcollections
            ? resolveCollectionsPermissions(collection.subcollections, authController, [...paths, collection.path])
            : undefined,
        permissions: resolvePermissions(
            collection.permissions, collection, authController, [...paths, collection.path]
        )
    }))
        .filter(collection => collection.permissions.read === undefined || collection.permissions.read);
}
