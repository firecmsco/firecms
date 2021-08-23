import React, { useEffect } from "react";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";

import {
    Authenticator,
    EntityCollection,
    Locale,
    Navigation,
    NavigationBuilder,
    SchemaResolver
} from "../models";
import {
    AuthController,
    AuthProvider,
    useAuthHandler
} from "../contexts/AuthController";
import { SnackbarProvider } from "../contexts/SnackbarContext";
import {
    SchemaRegistryContext,
    SchemaRegistryProvider
} from "../contexts/SchemaRegistry";
import {
    CMSAppContext,
    CMSAppContextProvider
} from "../contexts/CMSAppContext";
import { SideEntityProvider } from "../contexts/SideEntityController";
import { BreadcrumbsProvider } from "../contexts/BreacrumbsContext";
import { EntitySideDialogs } from "./internal/EntitySideDialogs";
import { DataSource } from "../models/data/datasource";
import { FirestoreDatasource } from "../models/data/firestore_datasource";


/**
 * Main CMS configuration.
 * @category Core
 */
export interface CMSAppProviderProps {

    /**
     *
     * @param props
     */
    children: (props: { navigation: Navigation, authController: AuthController, cmsAppContext: CMSAppContext }) => React.ReactNode;

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
     * Do the users need to log in to access the CMS.
     * You can specify an Authenticator function to discriminate which users can
     * access the CMS or not.
     * If not specified, authentication is enabled but no user restrictions
     * apply
     */
    authentication?: boolean | Authenticator;

    /**
     * Firebase configuration of the project. This component is not in charge
     * of initialising Firebase and expects it to be already initialised.
     */
    firebaseConfig: Object;

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
}

/**
 * If you are using independent components of the CMS instead of `CMSApp`
 * you need to wrap them with this provider, so the internal hooks work.
 *
 * This provider also contains the component in charge of displaying the side
 * entity dialogs, so you can display them outside the main CMS view.
 *
 * @constructor
 * @category Core
 */
export function CMSAppProvider(props: PropsWithChildren<CMSAppProviderProps>) {

    const {
        children,
        navigation: navigationOrBuilder,
        authentication,
        firebaseConfig,
        schemaResolver,
        dataSource
    } = props;

    const [navigation, setNavigation] = React.useState<Navigation | undefined>(undefined);
    const [navigationLoadingError, setNavigationLoadingError] = React.useState<Error | undefined>(undefined);

    const authController: AuthController = useAuthHandler({
        authentication
    });

    useEffect(() => {
        if (!authController.canAccessMainView) {
            return;
        }
        getNavigation(navigationOrBuilder, authController.loggedUser, authController)
            .then((result: Navigation) => {
                setNavigation(result);
            }).catch(setNavigationLoadingError);
    }, [authController.loggedUser, authController.canAccessMainView, navigationOrBuilder]);

    return (
        <AuthProvider authController={authController}>
            <SnackbarProvider>
                <SchemaRegistryProvider
                    collections={navigation?.collections}
                    schemaResolver={schemaResolver}>
                    <SchemaRegistryContext.Consumer>
                        {(schemasRegistryController) => {
                            const cmsAppContext = {
                                cmsAppConfig: props,
                                firebaseConfig,
                                navigation,
                                navigationLoadingError,
                                dataSource,
                                schemasRegistryController,
                            };
                            return (
                                <CMSAppContextProvider {...cmsAppContext}>
                                    <SideEntityProvider
                                        collections={navigation?.collections}>
                                        <BreadcrumbsProvider>
                                            {navigation && children({
                                                navigation,
                                                authController,
                                                cmsAppContext
                                            })}
                                            <EntitySideDialogs/>
                                        </BreadcrumbsProvider>
                                    </SideEntityProvider>
                                </CMSAppContextProvider>
                            );
                        }}
                    </SchemaRegistryContext.Consumer>

                </SchemaRegistryProvider>
            </SnackbarProvider>
        </AuthProvider>);

}


async function getNavigation(navigationOrCollections: Navigation | NavigationBuilder | EntityCollection[],
                             user: firebase.User | null,
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



