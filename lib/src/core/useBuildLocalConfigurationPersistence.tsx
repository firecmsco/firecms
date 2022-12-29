import { useCallback, useState } from "react";
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

    return {
        onCollectionModified,
        getCollectionConfig
    }
}
