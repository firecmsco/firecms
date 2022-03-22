import {
    LocalEntityCollection,
    UserConfigurationPersistence
} from "../../models";
import { stripCollectionPath } from "../util/paths";


export function useBuildLocalConfigurationPersistence(): UserConfigurationPersistence {

    function saveStorageCollectionConfig<M>(path: string, data: LocalEntityCollection<M>) {
        const storageKey = `collection_config_${stripCollectionPath(path)}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
    }

    function getStorageCollectionConfig<M>(path: string): LocalEntityCollection<M> {
        const storageKey = `collection_config_${stripCollectionPath(path)}`;
        const item = localStorage.getItem(storageKey);
        return item ? JSON.parse(item) : {};
    }

    return {
        onCollectionModified: saveStorageCollectionConfig,
        getCollectionConfig: getStorageCollectionConfig,
    }
}
