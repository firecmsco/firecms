import { DataSourceDelegate, StorageSource } from "../controllers";

export type EntityOverrides = {
    dataSourceDelegate?: DataSourceDelegate;
    storageSource?: StorageSource;
};
