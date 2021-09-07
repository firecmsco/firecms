import { DataSource } from "../models";
import { useCMSAppContext } from "../contexts";

/**
 * Use this hook to get the datasource being used
 * @category Hooks and utilities Functions
 */
export function useDataSource(): DataSource {
    const context = useCMSAppContext();
    return context.dataSource;
}
