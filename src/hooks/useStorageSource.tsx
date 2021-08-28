import { useCMSAppContext } from "../contexts";
import { StorageSource } from "../models/storage";

export function useStorageSource(): StorageSource {
    const context = useCMSAppContext();
    return context.storageSource;
}
