import React from "react";
import { Locale, User, AuthController, CMSAnalyticsEvent, DataDriver, StorageSource, UserConfigurationPersistence, CollectionRegistryController, DatabaseAdmin, CMSUrlController, NavigationStateController, RebaseData, RebaseClient, RebaseContext, UserManagementDelegate, EntityLinkBuilder, RebasePlugin, SlotContribution, PropertyConfig, EntityCustomView, EntityAction } from "@rebasepro/types";

/**
 * Controller to simulate different roles when dev mode is active.
 * @group Models
 */
export interface EffectiveRoleController {
    effectiveRole: string | null;
    setEffectiveRole: (role: string | null) => void;
}



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

    /**
     * Plugins loaded in the CMS
     */
    plugins?: RebasePlugin[];

    /**
     * Extra slots for the CMS
     */
    slots?: SlotContribution[];

    /**
     * Property configs (widgets)
     */
    propertyConfigs?: Record<string, PropertyConfig>;

    /**
     * Entity Views
     */
    entityViews?: EntityCustomView<any>[];

    /**
     * Entity Actions
     */
    entityActions?: EntityAction[];

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
