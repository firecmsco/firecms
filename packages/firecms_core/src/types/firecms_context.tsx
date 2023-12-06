import { Locale } from "./locales";
import { DataSource } from "./datasource";
import { StorageSource } from "./storage";
import { NavigationContext } from "./navigation";
import { SideEntityController } from "./side_entity_controller";
import { AuthController } from "./auth";
import { EntityLinkBuilder } from "./entity_link_builder";
import { User } from "./user";
import { SnackbarController } from "../hooks";
import { UserConfigurationPersistence } from "./local_config_persistence";
import { SideDialogsController } from "./side_dialogs_controller";
import { FireCMSPlugin } from "./plugins";
import { CMSAnalyticsEvent } from "./analytics";
import { PropertyConfig } from "./property_config";
import { EntityCustomView } from "./collections";
import { DialogsController } from "./dialogs_controller";

/**
 * Context that includes the internal controllers and contexts used by the app.
 * Some controllers and context included in this context can be accessed
 * directly from their respective hooks.
 * @group Hooks and utilities
 * @see useFireCMSContext
 */
export type FireCMSContext<UserType extends User = User, AuthControllerType extends AuthController<UserType> = AuthController<UserType>> = {

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
     * Context that includes the resolved navigation and utility methods and
     * attributes.
     * @see useNavigation
     */
    navigation: NavigationContext;

    /**
     * Controller to open the side dialog displaying entity forms
     * @see useSideEntityController
     */
    sideEntityController: SideEntityController;

    /**
     * Controller used to open side dialogs
     * This is the controller used internally by side entity dialogs
     * or reference dialogs.
     */
    sideDialogsController: SideDialogsController;

    /**
     * Controller used to open regular dialogs
     */
    dialogsController: DialogsController;

    /**
     * Used auth controller
     */
    authController: AuthControllerType;

    /**
     * Builder for generating utility links for entities
     */
    entityLinkBuilder?: EntityLinkBuilder;

    /**
     * Use this controller to display snackbars
     */
    snackbarController: SnackbarController;

    /**
     * Use this controller to access data stored in the browser for the user
     */
    userConfigPersistence?: UserConfigurationPersistence;

    /**
     * Use plugins to modify the behaviour of the CMS.
     * Currently, in ALPHA, and likely subject to change.
     */
    plugins?: FireCMSPlugin[];

    /**
     * Callback used to get analytics events from the CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;

    /**
     * Record of custom form fields to be used in the CMS.
     * You can use the key to reference the custom field in
     * the `propertyConfig` prop of a property in a collection.
     */
    propertyConfigs: Record<string, PropertyConfig>;

    /**
     * List of additional custom views for entities.
     * You can use the key to reference the custom view in
     * the `entityViews` prop of a collection.
     *
     * You can also define an entity view from the UI.
     */
    entityViews?: EntityCustomView[];


    components?: {

        /**
         * Component to render when a reference is missing
         */
        missingReference?: React.ComponentType<{ path: string }>;

    }
};
