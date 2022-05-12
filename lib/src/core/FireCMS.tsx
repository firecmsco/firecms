import React from "react";

import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateFnsUtils from "@date-io/date-fns";
import * as locales from "date-fns/locale";

import {
    AuthDelegate,
    Authenticator,
    CMSView,
    CollectionOverrideHandler,
    DataSource,
    EntityCollection,
    EntityLinkBuilder,
    FireCMSContext,
    Locale,
    Roles,
    StorageSource,
    User,
    UserConfigurationPersistence
} from "../models";
import { SnackbarContext, SnackbarProvider } from "./contexts/SnackbarContext";
import { FireCMSContextProvider } from "./contexts/FireCMSContext";
import { BreadcrumbsProvider } from "./contexts/BreacrumbsContext";
import { ModeProvider, ModeStateContext } from "./contexts/ModeState";
import {
    useBuildSideEntityController
} from "./internal/useBuildSideEntityController";
import {
    useBuildNavigationContext
} from "./internal/useBuildNavigationContext";
import { useBuildAuthController } from "./internal/useBuildAuthController";
import {
    useBuildSideDialogsController
} from "./internal/useBuildSideDialogsController";
import {
    CMSViewsBuilder,
    EntityCollectionsBuilder
} from "../firebase_app/FirebaseCMSAppProps";

const DEFAULT_COLLECTION_PATH = "/c";

/**
 * @category Core
 */
export interface FireCMSProps<UserType extends User> {

    /**
     * Use this function to return the components you want to render under
     * FireCMS
     * @param props
     */
    children: (props: {
        /**
         * Context of the app
         */
        context: FireCMSContext;
        /**
         * Main color scheme
         */
        mode: "dark" | "light";
        /**
         * Is one of the main processes, auth and navigation resolving, currently
         * loading. If you are building your custom implementation, you probably
         * want to show a loading indicator if this flag is `true`
         */
        loading: boolean;
    }) => React.ReactNode;

    /**
     * List of the mapped collections in the CMS.
     * Each entry relates to a collection in the root database.
     * Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    collections?: EntityCollection[] | EntityCollectionsBuilder;

    /**
     * Custom additional views created by the developer, added to the main
     * navigation
     */
    views?: CMSView[] | CMSViewsBuilder;

    /**
     * Do the users need to log in to access the CMS.
     * You can specify an Authenticator function to discriminate which users can
     * access the CMS or not.
     * If not specified, authentication is enabled but no user restrictions
     * apply.
     */
    authentication?: boolean | Authenticator<UserType>;

    /**
     * Used to override collections based on the collection path and entityId.
     * This resolver allows to override the collection for specific entities, or
     * specific collections, app wide.
     *
     * This overrides collections **all through the app.**
     *
     * You can also override collections in place, when using {@link useSideEntityController}
     */
    collectionOverrideHandler?: CollectionOverrideHandler;

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
     * Delegate for implementing your auth operations.
     * @see useFirebaseAuthDelegate
     */
    authDelegate: AuthDelegate<UserType>;

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

    /**
     * Use this controller to access the configuration that is stored locally,
     * and not defined in code
     */
    userConfigPersistence?: UserConfigurationPersistence;

    /**
     * Set of roles defined in the CMS.
     * The keys of the record are the IDs of the roles.
     * If not specified the default values will be used.
     */
    roles?: Roles;

}

/**
 * If you are using independent components of the CMS
 * you need to wrap them with this main component, so the internal hooks work.
 *
 * @constructor
 * @category Core
 */
export function FireCMS<UserType extends User>(props: FireCMSProps<UserType>) {

    const {
        children,
        collections,
        views,
        entityLinkBuilder,
        authentication,
        userConfigPersistence,
        dateTimeFormat,
        locale,
        authDelegate,
        collectionOverrideHandler,
        storageSource,
        dataSource,
        basePath,
        baseCollectionPath,
    } = props;

    const usedBasePath = basePath ?? "/";
    const usedBasedCollectionPath = baseCollectionPath ?? DEFAULT_COLLECTION_PATH;

    const dateUtilsLocale = locale ? locales[locale] : undefined;
    const authController = useBuildAuthController({
        authDelegate,
        authentication,
        dateTimeFormat,
        locale,
        dataSource,
        storageSource
    });

    const navigation = useBuildNavigationContext({
        basePath: usedBasePath,
        baseCollectionPath: usedBasedCollectionPath,
        authController,
        collections,
        views,
        collectionOverrideHandler,
        userConfigPersistence
    });

    const sideDialogsController = useBuildSideDialogsController();
    const sideEntityController = useBuildSideEntityController(navigation, sideDialogsController);

    const loading = authController.authLoading || authController.initialLoading || navigation.loading;

    if (navigation.navigationLoadingError) {
        return (
            <div>
                <p>There was an error while loading your navigation config</p>
                <p>{navigation.navigationLoadingError}</p>
            </div>
        );
    }

    return (
        <ModeProvider>
            <SnackbarProvider>
                <SnackbarContext.Consumer>
                    {(snackbarController) => {

                        const context: FireCMSContext = {
                            authController,
                            sideDialogsController,
                            sideEntityController,
                            entityLinkBuilder,
                            dateTimeFormat,
                            locale,
                            navigation,
                            dataSource,
                            storageSource,
                            snackbarController,
                            userConfigPersistence
                        };

                        return (
                            <FireCMSContextProvider {...context} >
                                <BreadcrumbsProvider>
                                    <LocalizationProvider
                                        dateAdapter={AdapterDateFns}
                                        utils={DateFnsUtils}
                                        locale={dateUtilsLocale}>
                                        <ModeStateContext.Consumer>
                                            {({ mode }) =>
                                                children({
                                                    context,
                                                    mode,
                                                    loading
                                                })}
                                        </ModeStateContext.Consumer>
                                    </LocalizationProvider>
                                </BreadcrumbsProvider>
                            </FireCMSContextProvider>
                        );
                    }}
                </SnackbarContext.Consumer>
            </SnackbarProvider>
        </ModeProvider>
    );

}
