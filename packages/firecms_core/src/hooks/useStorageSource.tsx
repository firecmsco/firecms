import { EntityCollection, StorageSource } from "../types/index.js";
import { StorageSourceContext } from "../contexts/StorageSourceContext.js";
import { useContext } from "react";

/**
 * Use this hook to get the storage source being used
 * @group Hooks and utilities
 */
export const useStorageSource = (collection?: EntityCollection): StorageSource => {
    const defaultStorageSource = useContext(StorageSourceContext);
    if (collection?.overrides?.storageSource)
        return collection.overrides.storageSource;
    return defaultStorageSource;
};
