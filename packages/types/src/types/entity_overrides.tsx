import { DataSource, DataSourceDelegate } from "./datasource";
import { StorageSource } from "./storage";

export type EntityOverrides = {
    dataSourceDelegate?: DataSourceDelegate;
    storageSource?: StorageSource;
};
