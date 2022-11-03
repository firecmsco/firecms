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
import { EntityCollectionViewProps } from "../core";
import { CollectionActionsProps } from "./collections";

/**
 * Context that includes the internal controllers and contexts used by the app.
 * Some controllers and context included in this context can be accessed
 * directly from their respective hooks.
 * @category Hooks and utilities
 * @see useFireCMSContext
 */
export interface FireCMSContext<UserType extends User = User, AuthControllerType extends AuthController<UserType> = AuthController<UserType>> {

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
     */
    sideDialogsController: SideDialogsController;

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
     * Component used to render a collection view.
     * Defaults to {@link EntityCollectionView}
     */
    EntityCollectionViewComponent: React.ComponentType<EntityCollectionViewProps<any>>;

    /**
     * Builder for adding extra actions to the entity list.
     * This is useful for adding actions that are not related to the CRUD operations.
     * You can add this general prop to add actions to all the collections, or you can
     * add the {@link EntityCollection.Actions} to add actions to a specific
     * collection.
     */
    CollectionActions?: React.ComponentType<CollectionActionsProps> | React.ComponentType<CollectionActionsProps>[];

}
