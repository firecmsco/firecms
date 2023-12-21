import React from "react";
import { User } from "./user";
import { AuthController } from "./auth";
import { DataSourceDelegate } from "./datasource";
import { EntityCollection, EntityCustomView } from "./collections";
import { CMSView } from "./navigation";
import { FireCMSContext } from "./firecms_context";
import { PropertyConfig } from "./property_config";
import { Locale } from "./locales";
import { StorageSource } from "./storage";
import { EntityLinkBuilder } from "./entity_link_builder";
import { UserConfigurationPersistence } from "./local_config_persistence";
import { FireCMSPlugin } from "./plugins";
import { CMSAnalyticsEvent } from "./analytics";

/**
 * Use this callback to build entity collections dynamically.
 * You can use the user to decide which collections to show.
 * You can also use the data source to fetch additional data to build the
 * collections.
 * Note: you can use any type of synchronous or asynchronous code here,
 * including fetching data from external sources, like using the Firestore
 * APIs directly, or a REST API.
 * @group Models
 */
export type EntityCollectionsBuilder<EC extends EntityCollection = EntityCollection> = (params: {
    user: User | null,
    authController: AuthController,
    dataSource: DataSourceDelegate
}) => EC[] | Promise<EC[]>;

/**
 * Use this callback to build custom views dynamically.
 * You can use the user to decide which views to show.
 * You can also use the data source to fetch additional data to build the
 * views. Note: you can use any type of synchronous or asynchronous code here,
 * including fetching data from external sources, like using the Firestore
 * APIs directly, or a REST API.
 * @group Models
 */
export type CMSViewsBuilder = (params: {
    user: User | null,
    authController: AuthController,
    dataSource: DataSourceDelegate
}) => CMSView[] | Promise<CMSView[]>;

/**
 * @group Models
 */
export type FireCMSProps<UserType extends User, EC extends EntityCollection> = {

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
    collections?: EC[] | EntityCollectionsBuilder<EC>;

    /**
     * Custom additional views created by the developer, added to the main
     * navigation
     */
    views?: CMSView[] | CMSViewsBuilder;

    /**
     * Record of custom form fields to be used in the CMS.
     * You can use the key to reference the custom field in
     * the `propertyConfig` prop of a property in a collection.
     */
    propertyConfigs?: Record<string, PropertyConfig>;

    /**
     * List of additional custom views for entities.
     * You can use the key to reference the custom view in
     * the `entityViews` prop of a collection.
     *
     * You can also define an entity view from the UI.
     */

    entityViews?: EntityCustomView[];

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
    dataSourceDelegate: DataSourceDelegate;

    /**
     * Connector to your file upload/fetch implementation
     */
    storageSource: StorageSource;

    /**
     * Delegate for implementing your auth operations.
     */
    authController: AuthController<UserType>;

    /**
     * Path under the navigation routes of the CMS will be created. Defaults to `/`.
     * Internally FireCMS uses `react-router` to create the routes, the base path is attached to the
     * `BrowserRouter` component. If you are using FireCMS in a subpath of your website, you can use
     * this prop to specify the base path.
     */
    basePath?: string;

    /**
     * Path under the collection routes of the CMS will be created.
     * Defaults to `/c`.
     */
    baseCollectionPath?: string;

    /**
     * Use this controller to access the configuration that is stored locally,
     * and not defined in code
     */
    userConfigPersistence?: UserConfigurationPersistence;

    /**
     * Use plugins to modify the behaviour of the CMS.
     * Currently, in ALPHA, and likely subject to change.
     */
    plugins?: FireCMSPlugin<any, any, any>[];

    /**
     * Callback used to get analytics events from the CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;

    /**
     * Optional link builder you can add to generate a button in your entity forms.
     * The function must return a URL that gets opened when the button is clicked
     */
    entityLinkBuilder?: EntityLinkBuilder;

    components?: {

        /**
         * Component to render when a reference is missing
         */
        missingReference?: React.ComponentType<{
            path: string,
        }>;

    }

};
