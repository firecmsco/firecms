import { DataSource } from "./datasource";
import { StorageSource } from "./storage";

export type EntityOverrides = {
    dataSource?: DataSource;
    storageSource?: StorageSource;
};
