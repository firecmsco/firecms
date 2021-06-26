import React, { useContext } from "react";
import { Navigation } from "../models";
import {
    SchemasRegistryController,
    useSchemasRegistry
} from "./SchemaRegistry";
import { CMSAppProviderProps } from "../core/CMSAppProvider";


/**
 * Context that includes the internal controllers used by the app
 */
export interface CMSAppContext {
    navigation?: Navigation;
    navigationLoadingError?: Error;
    schemasRegistryController: SchemasRegistryController;
    cmsAppConfig: CMSAppProviderProps;
    firebaseConfig: Object;
    theme: any;
}

const CMSAppContext = React.createContext<CMSAppContext>({
    schemasRegistryController: {} as any,
    cmsAppConfig: {} as any,
    theme: {} as any,
    firebaseConfig: {}
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
    theme: any;
}

export const CMSAppContextProvider: React.FC<CMSAppContextProps> = ({
                                                                        children,
                                                                        firebaseConfig,
                                                                        cmsAppConfig,
                                                                        navigation,
                                                                        navigationLoadingError,
                                                                        theme
                                                                    }) => {

    const schemasRegistryController = useSchemasRegistry();

    return (
        <CMSAppContext.Provider
            value={{
                cmsAppConfig,
                firebaseConfig,
                navigation,
                navigationLoadingError,
                schemasRegistryController,
                theme
            }}
        >
            {children}
        </CMSAppContext.Provider>
    );
};
