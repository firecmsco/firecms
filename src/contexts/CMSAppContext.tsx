import React, { useContext } from "react";
import { DataSource, Locale, Navigation, SchemaResolver } from "../models";
import { SchemasRegistryController } from "./SchemaRegistry";
import { StorageSource } from "../models/storage";
import { AuthController } from "./AuthController";
import { EntityLinkBuilder } from "../core/CMSAppProvider";


/**
 * Context that includes the internal controllers used by the app
 * @category Hooks and utilities
 */
export interface CMSAppContext {
    navigation?: Navigation;
    navigationLoadingError?: Error;
    schemasRegistryController: SchemasRegistryController;
    schemaResolver?: SchemaResolver;

    /**
     * Format of the dates in the CMS.
     * Defaults to 'MMMM dd, yyyy, HH:mm:ss'
     */
    dateTimeFormat?: string;

    /**
     * Locale of the CMS, currently only affecting dates
     */
    locale?: Locale;

    /**
     * Connector to your database
     */
    dataSource: DataSource;

    storageSource: StorageSource;

    authController: AuthController;

    entityLinkBuilder?: EntityLinkBuilder;

}

const CMSAppContextInstance = React.createContext<CMSAppContext>({
    schemasRegistryController: {} as any,
    dataSource: {} as any,
    storageSource: {} as any,
    authController: {} as any,
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
export const CMSAppContextProvider: React.FC<React.PropsWithChildren<CMSAppContext>> = ({
                                                                                            children,
                                                                                            ...context
                                                                                        }) => {

    return (
        <CMSAppContextInstance.Provider
            value={context}
        >
            {children}
        </CMSAppContextInstance.Provider>
    );
};
