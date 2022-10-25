import React from "react";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import DateFnsUtils from "@date-io/date-fns";
import * as locales from "date-fns/locale";

import {
    AuthController,
    CMSView,
    CollectionOverrideHandler,
    DataSource,
    EntityCollection,
    EntityLinkBuilder, CollectionActionsProps,
    FireCMSContext,
    Locale,
    StorageSource,
    User,
    UserConfigurationPersistence
} from "../types";
import { FireCMSContextProvider } from "./contexts/FireCMSContext";
import { BreadcrumbsProvider } from "./contexts/BreacrumbsContext";
import { ModeStateContext } from "./contexts/ModeController";
import {
    useBuildSideEntityController
} from "./internal/useBuildSideEntityController";
import {
    useBuildNavigationContext
} from "./internal/useBuildNavigationContext";
import {
    useBuildSideDialogsController
} from "./internal/useBuildSideDialogsController";
import { CMSViewsBuilder, EntityCollectionsBuilder } from "../firebase_app";
import { EntityCollectionView, EntityCollectionViewProps } from "./components";
import { ModeController, useSnackbarController } from "../hooks";
import { FireCMSPlugin } from "../types/plugins";

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
     */
    authController: AuthController<UserType>;

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
     * Controller in charge of switching dark or light mode in the app.
     * {@link useBuildModeController}
     */
    modeController: ModeController;

    // /**
    //  * Component used to render a collection view.
    //  * Defaults to {@link EntityCollectionView}
    //  */
    // EntityCollectionViewComponent?: React.ComponentType<EntityCollectionViewProps<any>>;
    //
    // /**
    //  * Builder for adding extra actions to the entity list.
    //  * This is useful for adding actions that are not related to the CRUD operations.
    //  * You can add this general prop to add actions to all the collections, or you can
    //  * add the {@link EntityCollection.Actions} to add actions to a specific
    //  * collection.
    //  */
    // CollectionActions?: React.ComponentType<CollectionActionsProps> | React.ComponentType<CollectionActionsProps>[];

    plugins?: FireCMSPlugin<any>[];
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
        modeController,
        entityLinkBuilder,
        userConfigPersistence,
        dateTimeFormat,
        locale,
        authController,
        collectionOverrideHandler,
        storageSource,
        dataSource,
        basePath,
        baseCollectionPath,
        // EntityCollectionViewComponent = EntityCollectionView,
        // CollectionActions,
        plugins
    } = props;

    const usedBasePath = basePath ?? "/";
    const usedBasedCollectionPath = baseCollectionPath ?? DEFAULT_COLLECTION_PATH;

    const dateUtilsLocale = locale ? locales[locale] : undefined;

    const navigation = useBuildNavigationContext({
        basePath: usedBasePath,
        baseCollectionPath: usedBasedCollectionPath,
        authController,
        collections,
        views,
        collectionOverrideHandler,
        userConfigPersistence,
        plugins
    });

    const sideDialogsController = useBuildSideDialogsController();
    const sideEntityController = useBuildSideEntityController(navigation, sideDialogsController);

    const snackbarController = useSnackbarController();

    const loading = authController.initialLoading || navigation.loading || (plugins?.some(p => p.loading) ?? false);

    if (navigation.navigationLoadingError) {
        return (
            <div>
                <p>There was an error while loading your navigation config</p>
                <p>{navigation.navigationLoadingError}</p>
            </div>
        );
    }

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
        userConfigPersistence,
        plugins
    };

    let childrenResult = children({
        context,
        loading
    })

    if (!loading && plugins) {
        plugins.forEach((plugin: FireCMSPlugin<any>) => {
            if (plugin.wrapContent) {
                childrenResult = plugin.wrapContent({ context, children: childrenResult });
            }
        });
    }

    return (

        <ModeStateContext.Provider value={modeController}>
            <FireCMSContextProvider {...context} >
                <BreadcrumbsProvider>
                    <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        utils={DateFnsUtils}
                        locale={dateUtilsLocale}>
                        {childrenResult}
                    </LocalizationProvider>
                </BreadcrumbsProvider>
            </FireCMSContextProvider>
        </ModeStateContext.Provider>
    );
}
