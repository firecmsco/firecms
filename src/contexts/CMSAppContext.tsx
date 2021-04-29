import React, { useContext } from "react";
import { Navigation } from "../CMSAppProps";
import {
    SchemasRegistryController,
    useSchemasRegistry
} from "./SchemaRegistry";
import { AuthController } from "./AuthContext";
import { CMSAppProviderProps } from "../CMSAppProvider";


/**
 * Context that includes the internal controllers used by the app
 */
export interface CMSAppContext {
    navigation?: Navigation;
    navigationLoadingError?: Error;
    schemasRegistryController: SchemasRegistryController;
    cmsAppConfig: CMSAppProviderProps;
    firebaseConfig: Object;
}

const CMSAppContext = React.createContext<CMSAppContext>({
    schemasRegistryController: {} as any,
    cmsAppConfig: {} as any,
    firebaseConfig: {},
});

/**
 * Use this hook to get the app context
 */
export const useCMSAppContext = () => useContext(CMSAppContext);

export interface CMSAppContextProps {
    cmsAppConfig: CMSAppProviderProps;
    children: React.ReactNode;
    firebaseConfig: Object;
    navigation?: Navigation;
    navigationLoadingError?: Error;
}

export const CMSAppContextProvider: React.FC<CMSAppContextProps> = ({
                                                                        children,
                                                                        firebaseConfig,
                                                                        cmsAppConfig,
                                                                        navigation,
                                                                        navigationLoadingError,

                                                                    }) => {

    const schemasRegistryController = useSchemasRegistry();

    return (
        <CMSAppContext.Provider
            value={{
                cmsAppConfig,
                firebaseConfig,
                navigation,
                navigationLoadingError,
                schemasRegistryController
            }}
        >
            {children}
        </CMSAppContext.Provider>
    );
};
