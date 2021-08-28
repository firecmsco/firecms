import { DataSource } from "../models/datasource";
import { useCMSAppContext } from "../contexts";

export function useDataSource(): DataSource {
    const context = useCMSAppContext();
    return context.dataSource;
}
