import { StorageSource } from "../types";
import { StorageSourceContext } from "../contexts/StorageSourceContext";
import { useContext } from "react";

/**
 * Use this hook to get the storage source being used
 * @group Hooks and utilities
 */
export const useStorageSource = (): StorageSource => useContext(StorageSourceContext);
