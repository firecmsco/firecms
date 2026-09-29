import { useCallback, useEffect, useRef, useState } from "react";
import { PartialEntityCollection, UserConfigurationPersistence } from "../types";
import { mergeDeep, stripCollectionPath } from "../util";
import { getLocalStorageJSON, setLocalStorageItem } from "../util/local_storage";

export function useBuildLocalConfigurationPersistence(): UserConfigurationPersistence {

    const configCache = useRef<Record<string, PartialEntityCollection>>({});

    const getCollectionFromStorage = useCallback((storageKey: string) => {
        return getLocalStorageJSON(storageKey, {});
    }, []);

    const getCollectionConfig = useCallback(<M extends Record<string, any>>(path: string): PartialEntityCollection<M> => {
        const storageKey = `collection_config::${stripCollectionPath(path)}`;
        if (configCache.current[storageKey]) {
            return configCache.current[storageKey] as PartialEntityCollection<M>;
        }
        return getCollectionFromStorage(storageKey);
    }, [getCollectionFromStorage]);

    const onCollectionModified = useCallback(<M extends Record<string, any>>(path: string, data: PartialEntityCollection<M>) => {
        const storageKey = `collection_config::${stripCollectionPath(path)}`;
        setLocalStorageItem(storageKey, JSON.stringify(data));
        const cachedConfig = configCache.current[storageKey];
        const newConfig = mergeDeep(cachedConfig ?? getCollectionFromStorage(path), data);
        configCache.current[storageKey] = mergeDeep(configCache.current[storageKey], newConfig);
    }, [getCollectionFromStorage]);

    const [recentlyVisitedPaths, _setRecentlyVisitedPaths] = useState<string[]>([]);
    const [favouritePaths, _setFavouritePaths] = useState<string[]>([]);
    const [collapsedGroups, _setCollapsedGroups] = useState<string[]>([]);

    useEffect(() => {
        _setRecentlyVisitedPaths(getLocalStorageJSON("recently_visited_paths", []));
        _setFavouritePaths(getLocalStorageJSON("favourite_paths", []));
        _setCollapsedGroups(getLocalStorageJSON("collapsed_groups", []));
    }, []);

    const setRecentlyVisitedPaths = useCallback((paths: string[]) => {
        setLocalStorageItem("recently_visited_paths", JSON.stringify(paths));
        _setRecentlyVisitedPaths(paths);
    }, []);

    const setFavouritePaths = useCallback((paths: string[]) => {
        setLocalStorageItem("favourite_paths", JSON.stringify(paths));
        _setFavouritePaths(paths);
    }, []);

    const setCollapsedGroups = useCallback((paths: string[]) => {
        setLocalStorageItem("collapsed_groups", JSON.stringify(paths));
        _setCollapsedGroups(paths);
    }, []);

    return {
        onCollectionModified,
        getCollectionConfig,
        recentlyVisitedPaths,
        setRecentlyVisitedPaths,
        favouritePaths,
        setFavouritePaths,
        collapsedGroups,
        setCollapsedGroups
    }
}
