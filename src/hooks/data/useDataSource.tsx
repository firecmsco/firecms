import { DataSource } from "../../models";
import { useFireCMSContext } from "../useFireCMSContext";

/**
 * Use this hook to get the datasource being used
 * @category Hooks and utilities
 */
export function useDataSource(): DataSource {
    const context = useFireCMSContext();
    return context.dataSource;
}
