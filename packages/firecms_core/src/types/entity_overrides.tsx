import { DataSource, DataSourceDelegate } from "./datasource.js";
import { StorageSource } from "./storage.js";

export type EntityOverrides = {
    dataSourceDelegate?: DataSourceDelegate;
    storageSource?: StorageSource;
};
