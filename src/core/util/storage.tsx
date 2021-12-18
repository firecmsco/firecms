import {
    LocalConfigurationPersistence,
    LocalEntityCollection,
    ResolvedEntitySchema
} from "../../models";

/**
 * Remove the entity ids from a given path
 * `products/B44RG6APH/locales` => `products/locales`
 * @param path
 */
function stripCollectionPath(path: string): string {
    return path
        .split("/")
        .filter((e, i) => i % 2 == 0)
        .reduce((a, b) => `${a}/${b}`);
}

export function useBuildStorageConfigurationPersistence(): LocalConfigurationPersistence {

    function saveStorageCollectionConfig<M>(path: string, data: LocalEntityCollection<M>) {
        const storageKey = `collection_config_${stripCollectionPath(path)}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
    }

    function getStorageCollectionConfig<M>(path: string): LocalEntityCollection<M> {
        const storageKey = `collection_config_${stripCollectionPath(path)}`;
        const item = localStorage.getItem(storageKey);
        return item ? JSON.parse(item) : {};
    }

    function getSchema<M>(schemaId: string): ResolvedEntitySchema<M> {
        const storageKey = `schema_config_${schemaId}`;
        const item = localStorage.getItem(storageKey);
        return item ? JSON.parse(item) : {};
    }

    return {
        onCollectionModified: saveStorageCollectionConfig,
        getCollectionConfig: getStorageCollectionConfig
    }
}


