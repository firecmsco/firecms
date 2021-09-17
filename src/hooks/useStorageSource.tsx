import { useCMSAppContext } from "../contexts";
import { StorageSource } from "../models/storage";

/**
 * Use this hook to get the storage source being used
 * @category Hooks and utilities
 */
export function useStorageSource(): StorageSource {
    const context = useCMSAppContext();
    return context.storageSource;
}
