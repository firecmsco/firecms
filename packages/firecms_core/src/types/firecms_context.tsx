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
import { InternalUserManagement } from "./internal_user_management";

/**
 * Context that includes the internal controllers and contexts used by the app.
 * Some controllers and context included in this context can be accessed
 * directly from their respective hooks.
 * @group Hooks and utilities
 * @see useFireCMSContext
 */
export type FireCMSContext<USER extends User = User, AuthControllerType extends AuthController<USER> = AuthController<USER>> = {

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

    /**
     * This section is used to manage users in the CMS.
     * It is used to show user information in various places of the CMS,
     * for example, to show who created or modified an entity,
     * or to assign ownership of an entity.
     *
     * In the base CMS, this information is not used for access control.
     * You can pass your own implementation of this section, to populate
     * the dropdown of users when assigning ownership of an entity,
     * or to show more information about the user.
     *
     * If you are using the FireCMS user management plugin, this
     * section will be implemented automatically.
     */
    userManagement: InternalUserManagement<USER>

    /**
     * Retrieve a user by its uid. Note that this function is not implemented by
     * default. You can pass your own implementation in the main `FireCMS` component.
     * Alternatively, if you are using the FireCMS user management system, it will
     * be implemented automatically.
     *
     * @param uid
     */
    getUser: (uid: string) => USER | null;

};
