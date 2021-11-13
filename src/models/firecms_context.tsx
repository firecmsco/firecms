import { Locale } from "./locales";
import { DataSource } from "./datasource";
import { StorageSource } from "./storage";
import { SchemaRegistryController } from "./schema_registry_controller";
import { NavigationContext } from "./navigation";
import { SideEntityController } from "./side_entity_controller";
import { AuthController } from "./auth";
import { EntityLinkBuilder } from "./entity_link_builder";
import { User } from "./user";

/**
 * Context that includes the internal controllers and contexts used by the app.
 * Some controllers and context included in this context can be accessed
 * directly from their respective hooks.
 * @category Hooks and utilities
 * @see useFireCMSContext
 */
export interface FireCMSContext<UserType extends User = User> {

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
     * Context that includes the resolved navigation and utility methods and
     * attributes.
     * @see useNavigation
     */
    navigationContext: NavigationContext;

    /**
     * Controller to open the side dialog displaying entity forms
     * @see useSideEntityController
     */
    sideEntityController: SideEntityController;

    /**
     * Used auth controller
     */
    authController: AuthController<UserType>;

    /**
     * Builder for generating utility links for entities
     */
    entityLinkBuilder?: EntityLinkBuilder;


}
