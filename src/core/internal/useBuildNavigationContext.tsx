import React, { useEffect, useState } from "react";
import {
    EntityCollection,
    Navigation,
    NavigationBuilder,
    NavigationContext, User
} from "../../models";
import { removeInitialAndTrailingSlashes } from "../util/navigation_utils";
import { AuthController } from "../../models/auth";

export function useBuildNavigationContext({
                                       basePath,
                                       baseCollectionPath,
                                       authController,
                                       navigationOrBuilder
                                   }: {
    basePath: string,
    baseCollectionPath: string,
    authController: AuthController;
    navigationOrBuilder: Navigation | NavigationBuilder | EntityCollection[]
}): NavigationContext {

    const [navigation, setNavigation] = useState<Navigation | undefined>(undefined);
    const [navigationLoading, setNavigationLoading] = useState<boolean>(false);
    const [navigationLoadingError, setNavigationLoadingError] = useState<Error | undefined>(undefined);

    async function getNavigation(navigationOrCollections: Navigation | NavigationBuilder | EntityCollection[],
                                 user: User | null,
                                 authController: AuthController): Promise<Navigation> {

        if (Array.isArray(navigationOrCollections)) {
            return {
                collections: navigationOrCollections
            };
        } else if (typeof navigationOrCollections === "function") {
            return navigationOrCollections({ user, authController });
        } else {
            return navigationOrCollections;
        }
    }

    useEffect(() => {
        if (!authController.canAccessMainView) {
            return;
        }
        setNavigationLoading(true);
        getNavigation(navigationOrBuilder, authController.user, authController)
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
