import { useContext } from "react";
import { DataSource } from "../../types";
import { DataSourceContext } from "../../contexts/DataSourceContext";

/**
 * Use this hook to get the datasource being used
 * @group Hooks and utilities
 */
export const useDataSource = (): DataSource => useContext(DataSourceContext);
