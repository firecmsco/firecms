import React, { useContext } from "react";
import {
    DataSource,
    EntityLinkBuilder,
    Locale,
    Navigation,
    StorageSource
} from "../models";
import { SchemaRegistryController } from "./SchemaRegistry";
import { AuthController } from "./AuthController";


/**
 * Context that includes the internal controllers used by the app
 * @category Hooks and utilities
 */
export interface CMSAppContext {

    /**
     * Resolved navigation. This means that if you are using a
     * {@link NavigationBuilder} this field will be undefined until resolved
     */
    navigation?: Navigation;

    navigationLoading: boolean;

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
     * Connector to your database, e.g. your Firestore database
     */
    dataSource: DataSource;

    /**
     * Used storage implementation
     */
    storageSource: StorageSource;

    /**
     * This controller is in charge of resolving the entity schemas from a given
     * path. It takes into account the `navigation` prop set in the main level of the
     * CMSApp as well as the `schemaResolver` in case you want to override schemas
     * to specific entities.
     */
    schemaRegistryController: SchemaRegistryController;

    /**
     * Used auth controller
     */
    authController: AuthController;

    /**
     * Builder for generating utility links for entities
     */
    entityLinkBuilder?: EntityLinkBuilder;

    /**
     * Default path under the navigation routes of the CMS will be created
     */
    basePath: string;

    /**
     * Default path under the collection routes of the CMS will be created
     */
    baseCollectionPath:string;

}

const CMSAppContextInstance = React.createContext<CMSAppContext>({
    navigationLoading: false,
    schemaRegistryController: {} as any,
    dataSource: {} as any,
    storageSource: {} as any,
    authController: {} as any,
    basePath: "",
    baseCollectionPath:"",
});

/**
 * Hook to retrieve the CMSAppContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `CMSAppProvider`
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
