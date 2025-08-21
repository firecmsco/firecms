import { useContext } from "react";
import { DataSource, EntityCollection } from "@firecms/types";
import { DataSourceContext } from "../../contexts/DataSourceContext";

/**
 * Use this hook to get the datasource being used
 * @group Hooks and utilities
 */
export const useDataSource = (collection?: EntityCollection<any, any>): DataSource => {
    // const customizationController = useCustomizationController();
    // const navigationController = useNavigationController();
    const defaultDataSource = useContext(DataSourceContext);
    // if (collection?.overrides?.dataSourceDelegate) {
    //     console.trace("Using custom data source for collection " + collection.id);
    //     return useBuildDataSource({
    //         delegate: collection.overrides.dataSourceDelegate,
    //         propertyConfigs: customizationController?.propertyConfigs,
    //         navigationController: navigationController
    //     });
    // }
    return defaultDataSource;
};
