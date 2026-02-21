import { useCallback } from "react";
import { removeInitialAndTrailingSlashes, resolveCollectionPathIds } from "@firecms/common";
import { CollectionRegistry } from "@firecms/common";

export function encodePath(input: string) {
    return encodeURIComponent(removeInitialAndTrailingSlashes(input))
        .replaceAll("%2F", "/")
        .replaceAll("%23", "#");
}

export function useNavigationURLs(basePath: string, baseCollectionPath: string, collectionRegistryRef: React.MutableRefObject<CollectionRegistry>) {

    const cleanBasePath = removeInitialAndTrailingSlashes(basePath);
    const cleanBaseCollectionPath = removeInitialAndTrailingSlashes(baseCollectionPath);

    const homeUrl = cleanBasePath ? `/${cleanBasePath}` : "/";
    const fullCollectionPath = cleanBasePath ? `/${cleanBasePath}/${cleanBaseCollectionPath}` : `/${cleanBaseCollectionPath}`;

    const buildCMSUrlPath = useCallback((path: string): string => {
        // Strip trailing /* wildcard from paths (used for nested routes in React Router)
        const cleanPath = path.replace(/\/\*$/, "");
        return cleanBasePath ? `/${cleanBasePath}/${encodePath(cleanPath)}` : `/${encodePath(cleanPath)}`;
    }, [cleanBasePath]);

    const buildUrlCollectionPath = useCallback((path: string): string => `${removeInitialAndTrailingSlashes(baseCollectionPath)}/${encodePath(path)}`,
        [baseCollectionPath]);

    const isUrlCollectionPath = useCallback(
        (path: string): boolean => removeInitialAndTrailingSlashes(path + "/").startsWith(removeInitialAndTrailingSlashes(fullCollectionPath) + "/"),
        [fullCollectionPath]);

    const urlPathToDataPath = useCallback((path: string): string => {
        const decodedPath = decodeURIComponent(path);
        if (decodedPath.startsWith(fullCollectionPath))
            return decodedPath.replace(fullCollectionPath, "");
        throw Error("Expected path starting with " + fullCollectionPath);
    }, [fullCollectionPath]);

    const resolveDatabasePathsFrom = useCallback((path: string): string => {
        const registry = collectionRegistryRef.current;
        if (!registry) {
            return resolveCollectionPathIds(path, []);
        }
        return resolveCollectionPathIds(path, registry.getCollections());
    }, [collectionRegistryRef]);

    return {
        homeUrl,
        fullCollectionPath,
        buildCMSUrlPath,
        buildUrlCollectionPath,
        isUrlCollectionPath,
        urlPathToDataPath,
        resolveDatabasePathsFrom
    };
}
