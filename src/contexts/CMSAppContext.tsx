import React, { useContext } from "react";
import { Navigation } from "../models";
import {
    SchemasRegistryController,
    useSchemasRegistry
} from "./SchemaRegistry";
import { CMSAppProviderProps } from "../core/CMSAppProvider";


/**
 * Context that includes the internal controllers used by the app
 * @category Hooks and utilities
 */
export interface CMSAppContext {
    navigation?: Navigation;
    navigationLoadingError?: Error;
    schemasRegistryController: SchemasRegistryController;
    cmsAppConfig: CMSAppProviderProps;
    firebaseConfig: Object;
}

const CMSAppContextInstance = React.createContext<CMSAppContext>({
    schemasRegistryController: {} as any,
    cmsAppConfig: {} as any,
    firebaseConfig: {}
});

/**
 * Hook to retrieve the CMSAppContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `CMSApp` or a `CMSAppProvider`
 *
 * @see CMSAppContext
 * @category Hooks and utilities
 */
export const useCMSAppContext = () => useContext(CMSAppContextInstance);

/**
 *
 * @category Core
 */
export interface CMSAppContextProps {
    cmsAppConfig: CMSAppProviderProps;
    children: React.ReactNode;
    firebaseConfig: Object;
    navigation?: Navigation;
    navigationLoadingError?: Error;
    schemasRegistryController: SchemasRegistryController;
}

export const CMSAppContextProvider: React.FC<CMSAppContextProps> = ({
                                                                        children,
                                                                        firebaseConfig,
                                                                        cmsAppConfig,
                                                                        navigation,
                                                                        navigationLoadingError,
                                                                        schemasRegistryController
                                                                    }) => {


    return (
        <CMSAppContextInstance.Provider
            value={{
                cmsAppConfig,
                firebaseConfig,
                navigation,
                navigationLoadingError,
                schemasRegistryController,
            }}
        >
            {children}
        </CMSAppContextInstance.Provider>
    );
};
