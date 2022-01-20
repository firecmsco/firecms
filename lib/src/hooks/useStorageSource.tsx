import { StorageSource } from "../models";
import { useFireCMSContext } from "./useFireCMSContext";

/**
 * Use this hook to get the storage source being used
 * @category Hooks and utilities
 */
export function useStorageSource(): StorageSource {
    const context = useFireCMSContext();
    return context.storageSource;
}
