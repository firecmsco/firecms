import { useCallback, useEffect, useState } from "react";
import {
    PartialEntityCollection,
    UserConfigurationPersistence
} from "../types";
import { mergeDeep, stripCollectionPath } from "./util";

export function useBuildLocalConfigurationPersistence(): UserConfigurationPersistence {

    const [configCache, setConfigCache] = useState<Record<string, PartialEntityCollection>>({});

    const getCollectionFromStorage = useCallback((storageKey: string) => {
        const item = localStorage.getItem(storageKey);
        return item ? JSON.parse(item) : {};
    }, []);

    const getCollectionConfig = useCallback(<M extends Record<string, any>>(path: string): PartialEntityCollection<M> => {
        const storageKey = `collection_config::${stripCollectionPath(path)}`;
        if (configCache[storageKey]) {
            return configCache[storageKey] as PartialEntityCollection<M>;
        }
        return getCollectionFromStorage(storageKey);
    }, [configCache, getCollectionFromStorage]);

    const onCollectionModified = useCallback(<M extends Record<string, any>>(path: string, data: PartialEntityCollection<M>) => {
        const storageKey = `collection_config::${stripCollectionPath(path)}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
        setConfigCache((currentCache) => {
            const cachedConfig = currentCache[storageKey];
            const newConfig = mergeDeep(cachedConfig ?? getCollectionFromStorage(path), data);
            return (mergeDeep(currentCache, newConfig));
        });
    }, [getCollectionFromStorage]);

    const [recentlyVisitedPaths, _setRecentlyVisitedPaths] = useState<string[]>([]);
    const [favouritePaths, _setFavouritePaths] = useState<string[]>([]);
    const [collapsedGroups, _setCollapsedGroups] = useState<string[]>([]);

    useEffect(() => {
        _setRecentlyVisitedPaths(localStorage.getItem("recently_visited_paths") ? JSON.parse(localStorage.getItem("recently_visited_paths")!) : []);
        _setFavouritePaths(localStorage.getItem("favourite_paths") ? JSON.parse(localStorage.getItem("favourite_paths")!) : []);
        _setCollapsedGroups(localStorage.getItem("collapsed_groups") ? JSON.parse(localStorage.getItem("collapsed_groups")!) : []);
    }, []);

    const setRecentlyVisitedPaths = useCallback((paths: string[]) => {
        localStorage.setItem("recently_visited_paths", JSON.stringify(paths));
        _setRecentlyVisitedPaths(paths);
    }, []);

    const setFavouritePaths = useCallback((paths: string[]) => {
        localStorage.setItem("favourite_paths", JSON.stringify(paths));
        _setFavouritePaths(paths);
    }, []);

    const setCollapsedGroups = useCallback((paths: string[]) => {
        localStorage.setItem("collapsed_groups", JSON.stringify(paths));
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
