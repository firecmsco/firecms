import React, { useEffect, useState } from "react";
import {
    AuthController,
    DataSource,
    EntityCollection,
    Locale,
    Navigation,
    NavigationBuilder,
    NavigationContext,
    StorageSource,
    User
} from "../../models";
import { removeInitialAndTrailingSlashes } from "../util/navigation_utils";

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

    const fullCollectionPath = cleanBasePath ? `/${cleanBasePath}/${cleanBaseCollectionPath}` : `/${cleanBaseCollectionPath}`;

    function isCollectionPath(path: string): boolean {
        return removeInitialAndTrailingSlashes(path + "/").startsWith(removeInitialAndTrailingSlashes(fullCollectionPath) + "/");
    }

    function getEntityOrCollectionPath(path: string): string {
        if (path.startsWith(fullCollectionPath))
            return path.replace(fullCollectionPath, "");
        throw Error("Expected path starting with " + fullCollectionPath);
    }

    function buildCollectionPath(path: string): string {
        return `${baseCollectionPath}/${removeInitialAndTrailingSlashes(path)}`;
    }

    function buildCMSUrl(path: string): string {
        return cleanBasePath ? `/${cleanBasePath}/${removeInitialAndTrailingSlashes(path)}` : `/${path}`;
    }

    function buildHomeUrl(): string {
        return cleanBasePath ? `/${cleanBasePath}` : "/";
    }

    return {
        navigation,
        loading: navigationLoading,
        navigationLoadingError,
        isCollectionPath,
        getEntityOrCollectionPath,
        buildCollectionPath,
        buildCMSUrl,
        buildHomeUrl,
        basePath,
        baseCollectionPath
    };
}
