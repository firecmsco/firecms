import { useContext } from "react";
import { DataSource, EntityCollection } from "../../types";
import { DataSourceContext } from "../../contexts/DataSourceContext";

/**
 * Use this hook to get the datasource being used
 * @group Hooks and utilities
 */
export const useDataSource = (collection?: EntityCollection<any, any>): DataSource => {
    const defaultDataSource = useContext(DataSourceContext);
    if (collection?.overrides?.dataSource)
        return collection?.overrides.dataSource;
    return defaultDataSource;
};
