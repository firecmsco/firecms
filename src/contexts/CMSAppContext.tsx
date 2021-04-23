import React, { useContext } from "react";
import { CMSAppProps, Navigation } from "../CMSAppProps";
import {
    SchemasRegistryController,
    useSchemasRegistry
} from "./SchemaRegistry";
import { useNavigation } from "./NavigationProvider";


/**
 * Context that includes the internal controllers used by the app
 */
export interface CMSAppContext {
    navigation?: Navigation;
    schemasRegistryController: SchemasRegistryController;
    cmsAppConfig: CMSAppProps;
    firebaseConfig: Object;
}

const CMSAppContext = React.createContext<CMSAppContext>({
    schemasRegistryController: {} as any,
    cmsAppConfig: {} as any,
    firebaseConfig: {}
});

/**
 * Use this hook to get the app context
 */
export const useCMSAppContext = () => useContext(CMSAppContext);

export interface CMSAppContextProps {
    cmsAppConfig: CMSAppProps;
    children: React.ReactNode;
    firebaseConfig: Object
}

export const CMSAppContextProvider: React.FC<CMSAppContextProps> = ({
                                                                         children,
                                                                         firebaseConfig,
                                                                         cmsAppConfig
                                                                     }) => {

    const navigationContext = useNavigation();
    const schemasRegistryController = useSchemasRegistry();

    return (
        <CMSAppContext.Provider
            value={{
                cmsAppConfig,
                firebaseConfig,
                navigation: navigationContext.navigation,
                schemasRegistryController
            }}
        >
            {children}
        </CMSAppContext.Provider>
    );
};
