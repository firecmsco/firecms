import { StorageSource } from "../types";
import { StorageSourceContext } from "../core/contexts/StorageSourceContext";
import { useContext } from "react";

/**
 * Use this hook to get the storage source being used
 * @category Hooks and utilities
 */
export const useStorageSource = (): StorageSource => useContext(StorageSourceContext);
