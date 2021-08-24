
import { DataSource } from "../models/data/datasource";
import { useCMSAppContext } from "../contexts";

export function useDataSource(): DataSource {
    const context = useCMSAppContext();
    return context.cmsAppConfig.dataSource;
}
