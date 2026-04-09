import type { UrlController, NavigateOptions } from "@rebasepro/types";
import { useCallback, useMemo } from "react";
import { removeInitialAndTrailingSlashes, resolveCollectionPathIds } from "@rebasepro/common";
import { CollectionRegistryController } from "@rebasepro/types";
import { useNavigate } from "react-router-dom";

export function useBuildUrlController(props: {
    basePath: string,
    baseCollectionPath: string,
    collectionRegistryController: CollectionRegistryController
}): UrlController {

    const { basePath, baseCollectionPath, collectionRegistryController } = props;
    const navigate = useNavigate();

    const homeUrl = basePath === "/" ? "/" : `/${removeInitialAndTrailingSlashes(basePath)}`;

    const buildUrlCollectionPath = useCallback((path: string): string => {
        const fullPath = basePath === "/" ? `${baseCollectionPath}/${path}` : `${basePath}${baseCollectionPath}/${path}`;
        return fullPath.replace(/\/\//g, "/");
    }, [basePath, baseCollectionPath]);

    const buildAppUrlPath = useCallback((path: string): string => {
        const fullPath = basePath === "/" ? `/${path}` : `${basePath}/${path}`;
        return fullPath.replace(/\/\//g, "/");
    }, [basePath]);

    const urlPathToDataPath = useCallback((cmsPath: string): string => {
        let path = cmsPath;
        if (basePath !== "/" && path.startsWith(basePath)) {
            path = path.replace(basePath, "");
        }
        if (path.startsWith(baseCollectionPath)) {
            path = path.replace(baseCollectionPath, "");
        }
        return removeInitialAndTrailingSlashes(path);
    }, [basePath, baseCollectionPath]);

    const isUrlCollectionPath = useCallback((urlPath: string): boolean => {
        let path = urlPath;
        if (basePath !== "/" && path.startsWith(basePath)) {
            path = path.replace(basePath, "");
        }
        return path.startsWith(baseCollectionPath);
    }, [basePath, baseCollectionPath]);

    const resolveDatabasePathsFrom = useCallback((path: string): string => {
        return resolveCollectionPathIds(path, collectionRegistryController.collections ?? []);
    }, [collectionRegistryController]);

    const navigateTo = useCallback((to: string, options?: NavigateOptions) => {
        navigate(to, options);
    }, [navigate]);

    return useMemo(() => ({
        basePath,
        baseCollectionPath,
        urlPathToDataPath,
        homeUrl,
        isUrlCollectionPath,
        buildUrlCollectionPath,
        buildAppUrlPath,
        resolveDatabasePathsFrom,
        navigate: navigateTo
    }), [basePath, baseCollectionPath, urlPathToDataPath, homeUrl, isUrlCollectionPath, buildUrlCollectionPath, buildAppUrlPath, resolveDatabasePathsFrom, navigateTo]);
}
