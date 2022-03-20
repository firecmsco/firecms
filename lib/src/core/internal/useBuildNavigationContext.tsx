import React, { useCallback, useEffect, useState } from "react";
import {
    AuthController,
    DataSource,
    EntityCollection,
    Locale,
    LocalEntityCollection,
    Navigation,
    NavigationBuilder,
    NavigationContext,
    SchemaOverrideHandler,
    StorageSource,
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

type BuildNavigationContextProps<UserType> = {
    basePath: string,
    baseCollectionPath: string,
    authController: AuthController<UserType>;
    navigationOrBuilder?: Navigation | NavigationBuilder<UserType>;
    schemaOverrideHandler: SchemaOverrideHandler | undefined;
    dateTimeFormat?: string;
    locale?: Locale;
    dataSource: DataSource;
    storageSource: StorageSource;
    configPersistence?: ConfigurationPersistence;
    userConfigPersistence?: UserConfigurationPersistence;
};

export function useBuildNavigationContext<UserType>({
                                                        basePath,
                                                        baseCollectionPath,
                                                        authController,
                                                        navigationOrBuilder,
                                                        schemaOverrideHandler,
                                                        dateTimeFormat,
                                                        locale,
                                                        dataSource,
                                                        storageSource,
                                                        configPersistence,
                                                        userConfigPersistence
                                                    }: BuildNavigationContextProps<UserType>): NavigationContext {

    const [navigation, setNavigation] = useState<Navigation | undefined>(undefined);
    const [topLevelNavigation, setTopLevelNavigation] = useState<TopNavigationResult | undefined>(undefined);
    const [navigationLoading, setNavigationLoading] = useState<boolean>(true);
    const [persistenceLoading, setPersistenceLoading] = useState<boolean>(true);
    const [navigationLoadingError, setNavigationLoadingError] = useState<Error | undefined>(undefined);

    const cleanBasePath = removeInitialAndTrailingSlashes(basePath);
    const cleanBaseCollectionPath = removeInitialAndTrailingSlashes(baseCollectionPath);

    const homeUrl = cleanBasePath ? `/${cleanBasePath}` : "/";

    const fullCollectionPath = cleanBasePath ? `/${cleanBasePath}/${cleanBaseCollectionPath}` : `/${cleanBaseCollectionPath}`;

    const initialised = navigation?.collections !== undefined;

    const [resolvedUserNavigation, setResolvedUserNavigation] = useState<Navigation | undefined>();

    useEffect(() => {
        if (!authController.canAccessMainView) {
            setNavigationLoading(false);
            return;
        }
        setNavigationLoading(true);
        resolveNavigationBuilder({
            navigationOrBuilder,
            authController,
            dateTimeFormat,
            locale,
            dataSource,
            storageSource
        }).then((res) => {
            setNavigationLoading(false);
            setResolvedUserNavigation(res);
        }).catch(e => {
            setNavigationLoading(false);
            setNavigationLoadingError(e);
        });
    }, [authController.user, authController.canAccessMainView, navigationOrBuilder]);

    useEffect(() => {
        if (!configPersistence || (!configPersistence.collections && configPersistence.loading)) {
            return;
        }

        if (!navigation) {
            setPersistenceLoading(true);
        }

        try {
            const result: Navigation = resolveNavigation({
                navigation: resolvedUserNavigation,
                configPersistence
            })
            setNavigation(result);
            setTopLevelNavigation(computeTopNavigation(result));
            setPersistenceLoading(false);
        } catch (e) {
            setPersistenceLoading(false);
            setNavigationLoadingError(e as Error);
        }
    }, [
        resolvedUserNavigation,
        configPersistence?.loading,
        configPersistence?.collections
    ]);

    const getCollection = useCallback(<M extends { [Key: string]: any }>(
        path: string,
        entityId?: string
    ): EntityCollection<M> => {

        const collections = [...(navigation?.collections ?? [])];

        const baseCollection = getCollectionByPath<M>(removeInitialAndTrailingSlashes(path), collections);

        const collectionOverride = getCollectionOverride(path);

        const resolvedCollection = baseCollection ? mergeDeep(baseCollection, collectionOverride) : undefined;

        let result: Partial<EntityCollection> = {};

        const resolvedProps: Partial<EntityCollection> | undefined = schemaOverrideHandler && schemaOverrideHandler({
            entityId,
            path: removeInitialAndTrailingSlashes(path)
        });

        if (resolvedProps)
            result = resolvedProps;

        if (resolvedCollection) {
            const subcollections = resolvedCollection.subcollections;
            const callbacks = resolvedCollection.callbacks;
            const permissions = resolvedCollection.permissions;
            result = {
                ...result,
                subcollections: result.subcollections ?? subcollections,
                callbacks: result.callbacks ?? callbacks,
                permissions: result.permissions ?? permissions
            };
        }

        return { ...resolvedCollection, ...(result as EntityCollection<M>) };

    }, [
        navigation,
        basePath,
        baseCollectionPath,
        schemaOverrideHandler
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
                                                    }: { path?: string }): string => {
            if (path)
                return `${baseCollectionPath}/edit/${encodePath(path)}`;
            else
                return "newcollection";
        }, //
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

    const computeTopNavigation = (resolvedNavigation: Navigation): TopNavigationResult => {

        if (!resolvedNavigation)
            throw Error("You can only use `computeTopNavigation` with an initialised navigationContext");

        const navigationEntries: TopNavigationEntry[] = [
            ...(resolvedNavigation.collections ?? []).map(collection => ({
                url: buildUrlCollectionPath(collection.path),
                name: collection.name,
                path: collection.path,
                type: "collection",
                deletable: collection.deletable,
                editable: collection.editable,
                editUrl: collection.editable ? buildUrlEditCollectionPath({ path: collection.path }) : undefined,
                description: collection.description?.trim(),
                group: collection.group?.trim()
            } as TopNavigationEntry)),
            ...(resolvedNavigation.views ?? []).map(view =>
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
        navigation,
        loading: navigationLoading || persistenceLoading,
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

async function resolveNavigationBuilder<UserType = any>({
                                                            navigationOrBuilder,
                                                            authController,
                                                            dateTimeFormat,
                                                            locale,
                                                            dataSource,
                                                            storageSource
                                                        }:
                                                            {
                                                                navigationOrBuilder?: Navigation | NavigationBuilder<UserType>,
                                                                authController: AuthController<UserType>,
                                                                dateTimeFormat?: string,
                                                                locale?: Locale,
                                                                dataSource: DataSource,
                                                                storageSource: StorageSource
                                                            }): Promise<Navigation | undefined> {
    if (typeof navigationOrBuilder === "function") {
        return navigationOrBuilder({
            user: authController.user,
            authController,
            dateTimeFormat,
            locale,
            dataSource,
            storageSource
        });
    } else {
        return navigationOrBuilder;
    }
}

const resolveNavigation = ({
                               navigation,
                               configPersistence
                           }:
                               {
                                   navigation?: Navigation,
                                   configPersistence?: ConfigurationPersistence
                               }
): Navigation => {

    if (!navigation && !configPersistence) {
        throw Error("You need to specify a navigation configuration or a `ConfigurationPersistence`");
    }

    const fetchedCollections = configPersistence?.collections;
    if (fetchedCollections) {
        const resolvedFetchedCollections: EntityCollection[] = fetchedCollections.map(c => ({
            ...c,
            editable: true,
            deletable: true
        }));
        if (navigation) {
            const updatedCollections = (navigation?.collections ?? [])
                .map((navigationCollection) => {
                    const storedCollection = resolvedFetchedCollections?.find((schema) => schema.path === navigationCollection.path);
                    if (!storedCollection) {
                        return navigationCollection;
                    } else {
                        return mergeCollections(navigationCollection, storedCollection);
                    }
                });
            const storedCollections = resolvedFetchedCollections
                .filter((col) => !updatedCollections.map(c => c.path).includes(col.path));
            navigation.collections = [...updatedCollections, ...storedCollections];
        } else {
            navigation = { collections: fetchedCollections };
        }

    }

    if (!navigation) {
        throw Error("You need to specify a navigation configuration or a `ConfigurationPersistence`");
    }

    return navigation;
};

export function getSidePanelKey(path: string, entityId?: string) {
    if (entityId)
        return `${removeInitialAndTrailingSlashes(path)}/${removeInitialAndTrailingSlashes(entityId)}`;
    else
        return removeInitialAndTrailingSlashes(path);
}

function encodePath(input:string){
    return encodeURIComponent(removeInitialAndTrailingSlashes(input)).replaceAll("%2F", "/");
}
