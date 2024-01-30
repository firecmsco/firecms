import { DataSource } from "./datasource";
import { StorageSource } from "./storage";
import { NavigationController } from "./navigation";
import { SideEntityController } from "./side_entity_controller";
import { AuthController } from "./auth";
import { User } from "./user";
import { SnackbarController } from "../hooks";
import { UserConfigurationPersistence } from "./local_config_persistence";
import { SideDialogsController } from "./side_dialogs_controller";
import { DialogsController } from "./dialogs_controller";
import { CustomizationController } from "./customization_controller";
import { AnalyticsController } from "./analytics_controller";

/**
 * Context that includes the internal controllers and contexts used by the app.
 * Some controllers and context included in this context can be accessed
 * directly from their respective hooks.
 * @group Hooks and utilities
 * @see useFireCMSContext
 */
export type FireCMSContext<UserType extends User = User, AuthControllerType extends AuthController<UserType> = AuthController<UserType>> = {

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
    navigation: NavigationController;

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
     * This controller holds the customization options for the CMS.
     */
    customizationController: CustomizationController;

    /**
     * Use this controller to display snackbars
     */
    snackbarController: SnackbarController;

    /**
     * Use this controller to access data stored in the browser for the user
     */
    userConfigPersistence?: UserConfigurationPersistence;

    /**
     * Callback to send analytics events
     */
    analyticsController?: AnalyticsController;

};
