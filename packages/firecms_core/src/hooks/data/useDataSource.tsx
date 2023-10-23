import { useContext } from "react";
import { DataSource } from "../../types";
import { DataSourceContext } from "../../core/contexts/DataSourceContext";

/**
 * Use this hook to get the datasource being used
 * @category Hooks and utilities
 */
export const useDataSource = (): DataSource => useContext(DataSourceContext);
