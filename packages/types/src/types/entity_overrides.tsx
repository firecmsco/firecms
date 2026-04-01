import { DataDriver, StorageSource } from "../controllers";

export type EntityOverrides = {
    /**
     * Internal driver override for this collection.
     * Used by the CMS engine to route data operations.
     */
    driver?: DataDriver;
    storageSource?: StorageSource;
};
