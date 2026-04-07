import React from "react";
import { EntityCollection, EntityCustomView } from "./collections";
import { PropertyConfig } from "./property_config";
import { Locale } from "../types/locales";
import { EntityLinkBuilder } from "../types/entity_link_builder";
import { RebasePlugin } from "./plugins";
import { SlotContribution } from "./slots";
import { EntityAction } from "./entity_actions";
import { User } from "../users";
import {
    AuthController, CMSAnalyticsEvent, DataDriver, StorageSource,
    UserConfigurationPersistence, CollectionRegistryController,
    DatabaseAdmin
} from "../controllers";
import { CMSView, CMSUrlController, NavigationStateController } from "./controllers";
import { RebaseData } from "../controllers/data";
import { RebaseClient } from "../controllers/client";
import { RebaseContext } from "../rebase_context";
import { UserManagementDelegate } from "../types/user_management_delegate";

/**
 * Controller to simulate different roles when dev mode is active.
 * @group Models
 */
export interface EffectiveRoleController {
    effectiveRole: string | null;
    setEffectiveRole: (role: string | null) => void;
}

/**
 * Use this callback to build entity collections dynamically.
 * You can use the user to decide which collections to show, or how to render them.
 * You can also use the data API to fetch additional data to build the
 * collections (e.g., for enums).
 *
 * Note: The underlying schema of the collections built here must map to your
 * strictly typed static backend schema. You cannot define new database columns
 * or arbitrary schemas here that aren't represented in your backend constraints.
 *
 * Note: you can use any type of synchronous or asynchronous code here,
 * including fetching data from external sources, like using a REST API.
 * @group Models
 */
export type EntityCollectionsBuilder<EC extends EntityCollection = EntityCollection> = (params: {
    user: User | null,
    authController: AuthController,
    data: RebaseData
}) => EC[] | Promise<EC[]>;

/**
 * Use this callback to build custom views dynamically.
 * You can use the user to decide which views to show.
 * You can also use the data API to fetch additional data to build the
 * views. Note: you can use any type of synchronous or asynchronous code here,
 * including fetching data from external sources, like using a REST API.
 * @group Models
 */
export type CMSViewsBuilder = (params: {
    user: User | null,
    authController: AuthController,
    data: RebaseData
}) => CMSView[] | Promise<CMSView[]>;

/**
 * @group Models
 */
export type RebaseProps<USER extends User> = {

    /**
     * Use this function to return the components you want to render under
     * Rebase
     * @param props
     */
    children: (props: {
        /**
         * Context of the app
         */
        context: RebaseContext;
        /**
         * Is one of the main processes, auth and navigation resolving, currently
         * loading. If you are building your custom implementation, you probably
         * want to show a loading indicator if this flag is `true`
         */
        loading: boolean;
    }) => React.ReactNode;

    /**
     * If you have a custom API key, you can use it here.
     */
    apiKey?: string;

    /**
     * Base URL for the backend API (e.g. "http://localhost:3001").
     * When provided, this is available via `useApiConfig()` to any hook
     * in the tree, reducing repetitive `apiUrl` threading.
     */
    apiUrl?: string;

    /**
     * Record of custom form fields to be used in the CMS.
     * You can use the key to reference the custom field in
     * the `propertyConfig` prop of a property in a collection.
     */
    propertyConfigs?: Record<string, PropertyConfig>;

    /**
     * This controller is in charge of resolving the collection and entity paths.
     */
    collectionRegistryController: CollectionRegistryController;

    /**
     * This controller is in charge of resolving the URL configurations map and building paths
     */
    cmsUrlController: CMSUrlController;

    /**
     * This controller is in charge of resolving the navigation views and state
     */
    navigationStateController: NavigationStateController;

    /**
     * List of additional custom views for entities.
     * You can use the key to reference the custom view in
     * the `entityViews` prop of a collection.
     *
     * You can also define an entity view from the UI.
     */
    entityViews?: EntityCustomView[];

    /**
     * List of actions that can be performed on entities.
     * These actions are displayed in the entity view and in the collection view.
     * You can later reuse these actions in the `entityActions` prop of a collection,
     * by specifying the `key` of the action.
     */
    entityActions?: EntityAction[];

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
     * Unified RebaseClient for data, auth, and storage.
     */
    client?: RebaseClient;

    /**
     * Optional override for RebaseData if not using `client`
     */
    data?: RebaseData;

    /**
     * Optional override for DataDriver if not using `client`
     */
    driver?: DataDriver;

    /**
     * Optional override for AuthController if not using `client`
     */
    authController?: AuthController<USER>;

    /**
     * Optional override for StorageSource if not using `client`
     */
    storageSource?: StorageSource;

    /**
     * Administrative database operations (SQL, schema discovery).
     * Only needed when the studio/admin features are enabled.
     */
    databaseAdmin?: DatabaseAdmin;

    /**
     * Use this controller to access the configuration that is stored locally,
     * and not defined in code
     */
    userConfigPersistence?: UserConfigurationPersistence;

    /**
     * Direct slot contributions (no plugin needed).
     * These are merged with any slots provided by plugins.
     */
    slots?: SlotContribution[];

    /**
     * Use plugins to modify the behaviour of the CMS.
     */
    plugins?: RebasePlugin[];

    /**
     * Callback used to get analytics events from the CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;

    /**
     * Optional link builder you can add to generate a button in your entity forms.
     * The function must return a URL that gets opened when the button is clicked
     */
    entityLinkBuilder?: EntityLinkBuilder;

    /**
     * You can use this props to provide your own user management implementation.
     * Note that this will not affect the UI, but it will be used to show user information
     * in various places of the CMS, for example, to show who created or modified an entity,
     * or to assign ownership of an entity.
     *
     * You can also use this data to be retrieved in your custom properties,
     * for example, to show a list of users in a dropdown.
     *
     * If you are using the Rebase user management plugin, this
     * prop will be implemented automatically.
     */
    userManagement?: UserManagementDelegate;

    components?: {

        /**
         * Component to render when a reference is missing
         */
        missingReference?: React.ComponentType<{
            path: string,
        }>;

    };

    /**
     * Controller to simulate different roles when dev mode is active.
     */
    effectiveRoleController?: EffectiveRoleController;

};
