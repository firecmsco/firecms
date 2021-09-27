import React, { useEffect } from "react";

import {
    DataSource,
    EntityCollection,
    EntityLinkBuilder,
    Locale,
    Navigation,
    NavigationBuilder,
    SchemaResolver,
    StorageSource,
    User
} from "../models";
import {
    SchemaRegistryProvider,
    useSchemaRegistryController
} from "../contexts/SchemaRegistry";
import { AuthController, CMSAppContext } from "../contexts";
import { AuthProvider } from "../contexts/AuthController";
import { SnackbarProvider } from "../contexts/SnackbarContext";
import { CMSAppContextProvider } from "../contexts/CMSAppContext";
import { SideEntityProvider } from "../contexts/SideEntityController";
import { BreadcrumbsProvider } from "../contexts/BreacrumbsContext";
import { ModeProvider, ModeStateContext } from "../contexts/ModeState";

import "@camberi/firecms/dist/index.css";

const DEFAULT_COLLECTION_PATH = `/c`;

/**
 * Main CMS configuration.
 * @category Core
 */
export interface CMSAppProviderProps {

    /**
     *
     * @param props
     */
    children: (props: { context: CMSAppContext, mode: "dark" | "light" }) => React.ReactNode;

    /**
     * Use this prop to specify the views that will be generated in the CMS.
     * You usually will want to create a `Navigation` object that includes
     * collection views where you specify the path and the schema.
     * Additionally you can add custom views to the root navigation.
     * In you need to customize the navigation based on the logged user you
     * can use a `NavigationBuilder`
     */
    navigation: Navigation | NavigationBuilder | EntityCollection[];

    /**
     * Used to override schemas based on the collection path and entityId.
     * This resolver allows to override the schema for specific entities, or
     * specific collections, app wide. This overrides schemas all through the app.
     *
     * You can also override schemas in place, when using `useSideEntityController`
     */
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

    /**
     * Connector to your file upload/fetch implementation
     */
    storageSource: StorageSource;

    /**
     * Perform your auth operations here
     */
    authController: AuthController;

    /**
     * Optional link builder you can add to generate a button in your entity forms.
     * The function must return a URL that gets opened when the button is clicked
     */
    entityLinkBuilder?: EntityLinkBuilder;

    /**
     * Default path under the navigation routes of the CMS will be created
     */
    basePath?: string;

    /**
     * Default path under the collection routes of the CMS will be created
     */
    baseCollectionPath?: string;

}

/**
 * If you are using independent components of the CMS
 * you need to wrap them with this provider, so the internal hooks work.
 *
 * This provider also contains the component in charge of displaying the side
 * entity dialogs, so you can display them outside the main CMS view.
 *
 * @constructor
 * @category Core
 */
export function CMSAppProvider(props: CMSAppProviderProps) {

    const {
        children,
        navigation: navigationOrBuilder,
        entityLinkBuilder,
        dateTimeFormat,
        locale,
        authController,
        schemaResolver,
        storageSource,
        dataSource,
        basePath,
        baseCollectionPath
    } = props;

    const [navigation, setNavigation] = React.useState<Navigation | undefined>(undefined);
    const [navigationLoading, setNavigationLoading] = React.useState<boolean>(false);
    const [navigationLoadingError, setNavigationLoadingError] = React.useState<Error | undefined>(undefined);

    async function getNavigation(navigationOrCollections: Navigation | NavigationBuilder | EntityCollection[],
                                 user: User | null,
                                 authController: AuthController): Promise<Navigation> {

        if (Array.isArray(navigationOrCollections)) {
            return {
                collections: navigationOrCollections
            };
        } else if (typeof navigationOrCollections === "function") {
            return navigationOrCollections({ user, authController });
        } else {
            return navigationOrCollections;
        }
    }

    useEffect(() => {
        if (!authController.canAccessMainView) {
            return;
        }
        setNavigationLoading(true);
        getNavigation(navigationOrBuilder, authController.user, authController)
            .then((result: Navigation) => {
                setNavigation(result);
                setNavigationLoading(false);
            }).catch(setNavigationLoadingError);
    }, [authController.user, authController.canAccessMainView, navigationOrBuilder]);

    if (navigationLoadingError) {
        return (
            <div>
                <p>There was an error while loading your navigation config</p>
                <p>{navigationLoadingError}</p>
            </div>
        );
    }
    const schemaRegistryController = useSchemaRegistryController(navigation?.collections, schemaResolver);

    const context: CMSAppContext = {
        authController,
        entityLinkBuilder,
        dateTimeFormat,
        locale,
        navigation,
        navigationLoading,
        dataSource,
        storageSource,
        schemaRegistryController,
        basePath: basePath ?? "/",
        baseCollectionPath: baseCollectionPath ?? DEFAULT_COLLECTION_PATH
    };

    return (
        <ModeProvider>
            <AuthProvider authController={authController}>
                <SnackbarProvider>
                    <SchemaRegistryProvider
                        schemaRegistryController={schemaRegistryController}>
                        <CMSAppContextProvider {...context} >
                            <SideEntityProvider
                                collections={navigation?.collections}>
                                <BreadcrumbsProvider>
                                    <ModeStateContext.Consumer>
                                        {({ mode }) => {
                                            return children({
                                                context,
                                                mode
                                            });
                                        }}
                                    </ModeStateContext.Consumer>
                                </BreadcrumbsProvider>
                            </SideEntityProvider>
                        </CMSAppContextProvider>
                    </SchemaRegistryProvider>
                </SnackbarProvider>
            </AuthProvider>
        </ModeProvider>
    );

}






