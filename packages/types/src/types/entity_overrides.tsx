import { DataSource, StorageSource } from "../controllers";

export type EntityOverrides = {
    dataSource?: DataSource;
    storageSource?: StorageSource;
};
