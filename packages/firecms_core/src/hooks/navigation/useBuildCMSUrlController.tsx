import { useCallback } from "react";
import { removeInitialAndTrailingSlashes } from "@firecms/common";
import { CMSUrlController, NavigateOptions, CollectionRegistryController } from "@firecms/types";
import { useNavigate } from "react-router-dom";

export function useBuildCMSUrlController(props: {
    basePath: string,
    baseCollectionPath: string,
    collectionRegistryController: CollectionRegistryController
}): CMSUrlController {

    const { basePath, baseCollectionPath, collectionRegistryController } = props;
    const navigate = useNavigate();

    const homeUrl = basePath === "/" ? "/" : `/${removeInitialAndTrailingSlashes(basePath)}`;

    const buildUrlCollectionPath = useCallback((path: string): string => {
        const fullPath = basePath === "/" ? `${baseCollectionPath}/${path}` : `${basePath}${baseCollectionPath}/${path}`;
        return fullPath.replace(/\/\//g, "/");
    }, [basePath, baseCollectionPath]);

    const buildCMSUrlPath = useCallback((path: string): string => {
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
        const pathSegments = removeInitialAndTrailingSlashes(path).split("/");
        const resolvedPaths = collectionRegistryController.convertIdsToPaths(pathSegments);
        return resolvedPaths.join("/");

    }, [collectionRegistryController]);

    const navigateTo = useCallback((to: string, options?: NavigateOptions) => {
        navigate(to, options);
    }, [navigate]);

    return {
        basePath,
        baseCollectionPath,
        urlPathToDataPath,
        homeUrl,
        isUrlCollectionPath,
        buildUrlCollectionPath,
        buildCMSUrlPath,
        resolveDatabasePathsFrom,
        navigate: navigateTo
    };
}
