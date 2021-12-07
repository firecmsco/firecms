import React, { useEffect, useState } from "react";
import {
    AuthController,
    DataSource,
    EntityCollection,
    Locale,
    Navigation,
    NavigationBuilder,
    NavigationContext,
    PartialEntityCollection,
    PartialSchema,
    StorageSource,
    User
} from "../../models";
import {
    getCollectionFromCollections,
    removeInitialAndTrailingSlashes
} from "../util/navigation_utils";
import {
    getStorageCollectionConfig,
    saveStorageCollectionConfig
} from "../util/storage";
import { mergeDeep } from "../util/objects";

export function useBuildNavigationContext<UserType>({
                                                        basePath,
                                                        baseCollectionPath,
                                                        authController,
                                                        navigationOrBuilder,
                                                        dateTimeFormat,
                                                        locale,
                                                        dataSource,
                                                        storageSource
                                          }: {
    basePath: string,
    baseCollectionPath: string,
    authController: AuthController<UserType>;
    navigationOrBuilder: Navigation | NavigationBuilder<UserType>  | EntityCollection[];
    dateTimeFormat?: string;
    locale?: Locale;
    dataSource: DataSource;
    storageSource: StorageSource;
}): NavigationContext {

    const [navigation, setNavigation] = useState<Navigation | undefined>(undefined);
    const [navigationLoading, setNavigationLoading] = useState<boolean>(false);
    const [navigationLoadingError, setNavigationLoadingError] = useState<Error | undefined>(undefined);

    async function getNavigation<UserType>({ navigationOrCollections, user, authController, dateTimeFormat, locale, dataSource, storageSource }:
                                     {
                                         navigationOrCollections: Navigation | NavigationBuilder<UserType>  | EntityCollection[],
                                         user: User | null,
                                         authController: AuthController<UserType>,
                                         dateTimeFormat?: string,
                                         locale?: Locale,
                                         dataSource: DataSource,
                                         storageSource: StorageSource
                                     }
    ): Promise<Navigation> {

        if (Array.isArray(navigationOrCollections)) {
            return {
                collections: navigationOrCollections
            };
        } else if (typeof navigationOrCollections === "function") {
            return navigationOrCollections({ user, authController, dateTimeFormat,locale, dataSource, storageSource });
        } else {
            return navigationOrCollections;
        }
    }

    useEffect(() => {
        if (!authController.canAccessMainView) {
            return;
        }
        setNavigationLoading(true);
        getNavigation({
            navigationOrCollections: navigationOrBuilder,
            user: authController            .user,
            authController,
            dateTimeFormat,
            locale,
            dataSource,
            storageSource
        })
            .then((result: Navigation) => {
                setNavigation(result);
                setNavigationLoading(false);
            }).catch(setNavigationLoadingError);
    }, [authController.user, authController.canAccessMainView, navigationOrBuilder]);


    const cleanBasePath = removeInitialAndTrailingSlashes(basePath);
    const cleanBaseCollectionPath = removeInitialAndTrailingSlashes(baseCollectionPath);

    const homeUrl = cleanBasePath ? `/${cleanBasePath}` : "/";

    const fullCollectionPath = cleanBasePath ? `/${cleanBasePath}/${cleanBaseCollectionPath}` : `/${cleanBaseCollectionPath}`;

    function isUrlCollectionPath(path: string): boolean {
        return removeInitialAndTrailingSlashes(path + "/").startsWith(removeInitialAndTrailingSlashes(fullCollectionPath) + "/");
    }

    function urlPathToDataPath(path: string): string {
        if (path.startsWith(fullCollectionPath))
            return path.replace(fullCollectionPath, "");
        throw Error("Expected path starting with " + fullCollectionPath);
    }

    function buildUrlCollectionPath(path: string): string {
        return `${baseCollectionPath}/${removeInitialAndTrailingSlashes(path)}`;
    }

    function buildCMSUrlPath(path: string): string {
        return cleanBasePath ? `/${cleanBasePath}/${removeInitialAndTrailingSlashes(path)}` : `/${path}`;
    }


    const onCollectionModifiedForUser = <M extends any>(path: string, partialCollection: PartialEntityCollection<M>) => {
        saveStorageCollectionConfig(path, partialCollection);
    }

    /**
     * Find the corresponding view at any depth for a given path.
     * @param path
     */
    function getCollection<M>(path: string): EntityCollection<M> | undefined {

        const collections = navigation?.collections;
        if (!collections)
            return undefined;

        const collection = getCollectionFromCollections<M>(removeInitialAndTrailingSlashes(path), collections);

        const dynamicCollectionConfig = { ...getStorageCollectionConfig(path) };
        delete dynamicCollectionConfig["schema"];

        return collection ? mergeDeep(collection, dynamicCollectionConfig) : undefined;
    }

    const getSchemaOverride = <M extends any>(path: string): PartialSchema<M> | undefined => {
        let storageCollectionConfig = getStorageCollectionConfig<M>(path);
        if (!storageCollectionConfig) return undefined;
        return storageCollectionConfig.schema;
    }

    return {
        navigation,
        loading: navigationLoading,
        navigationLoadingError,
        isUrlCollectionPath,
        urlPathToDataPath,
        buildUrlCollectionPath,
        buildCMSUrlPath,
        homeUrl,
        basePath,
        baseCollectionPath,
        onCollectionModifiedForUser,
        getCollection,
        getSchemaOverride
    };
}