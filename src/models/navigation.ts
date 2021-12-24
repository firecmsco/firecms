import { AuthController } from "./auth";
import { EntityCollection, EntityCollectionResolver } from "./collections";
import { User } from "./user";
import { Locale } from "./locales";
import { DataSource } from "./datasource";
import { StorageSource } from "./storage";
import {
    LocalEntityCollection,
    LocalEntitySchema
} from "./local_config_persistence";
import { EntitySchema } from "./entities";


/**
 * You can use this builder to customize the navigation, based on the logged in
 * user
 * @category Models
 */
export type NavigationBuilder<UserType extends User = User> =
    ((props: NavigationBuilderProps<UserType> ) => Promise<Navigation>)
    | ((props: NavigationBuilderProps<UserType> ) => Navigation);

/**
 * @category Models
 */
export interface NavigationBuilderProps<UserType extends User = User> {
    /**
     * Logged in user or null
     */
    user: UserType | null;

    /**
     * AuthController
     */
    authController: AuthController<UserType>;

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
}

/**
 * In this interface you define the main navigation entries of the CMS
 * @category Models
 */
export interface Navigation {

    /**
     * List of the mapped collections in the CMS.
     * Each entry relates to a collection in the root database.
     * Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    collections?: EntityCollection[];

    /**
     * Custom additional views created by the developer, added to the main
     * navigation
     */
    views?: CMSView[];

}

/**
 * @category Models
 */
export type ResolvedNavigation = Navigation & {
    storedCollections?: EntityCollection[];
}

/**
 * Context that includes the resolved navigation and utility methods and
 * attributes.
 * @category Models
 */
export type NavigationContext = {

    navigation?: ResolvedNavigation;

    schemas: EntitySchema[];

    loading: boolean;

    navigationLoadingError?: any;

    /**
     * Is the registry ready to be used
     */
    initialised: boolean;

    /**
     * Get the schema configuration for a given path.
     * If you use this method you can use a baseCollection that will be used
     * to resolve the initial properties of the collection, before applying
     * the collection configuration changes that are persisted.
     * If you don't specify it, the collection is fetched from the local navigation.
     */
    getCollectionResolver: <M>(path: string, entityId?: string, baseCollection?:EntityCollection<M>) => EntityCollectionResolver<M> | undefined;

    /**
     * Default path under the navigation routes of the CMS will be created
     */
    basePath: string;

    /**
     * Default path under the collection routes of the CMS will be created
     */
    baseCollectionPath: string;

    /**
     * Convert a URL path to a collection or entity path
     * `/c/products` => `products`
     * `/my_cms/c/products/B34SAP8Z` => `products/B34SAP8Z`
     * `/my_cms/my_view` => `my_view`
     * @param cmsPath
     */
    urlPathToDataPath: (cmsPath: string) => string;

    /**
     * Convert a collection or entity path to a URL path
     * @param path
     */
    buildCMSUrlPath: (path: string) => string;

    buildUrlEditSchemaPath: (props: { id?: string}) => string;

    buildUrlEditCollectionPath: (props: { path?: string, group?: string }) => string;

    /**
     * Base url path for the home screen
     */
    homeUrl: string;

    /**
     * Check if a url path belongs to a collection
     * @param path
     */
    isUrlCollectionPath: (urlPath: string) => boolean;

    /**
     * Build a URL collection path from a data path
     * `products` => `/c/products`
     * `products/B34SAP8Z` => `/c/products/B34SAP8Z`
     * @param path
     */
    buildUrlCollectionPath: (path: string) => string;


}


/**
 * Custom additional views created by the developer, added to the main
 * navigation.
 * @category Models
 */
export interface CMSView {

    /**
     * CMS Path (or paths) you can reach this view from.
     * If you include multiple paths, only the first one will be included in the
     * main menu
     */
    path: string | string[];

    /**
     * Name of this view
     */
    name: string;

    /**
     * Optional description of this view. You can use Markdown
     */
    description?: string;

    /**
     * Should this view be hidden from the main navigation panel.
     * It will still be accessible if you reach the specified path
     */
    hideFromNavigation?: boolean;

    /**
     * Component to be rendered. This can be any React component, and can use
     * any of the provided hooks
     */
    view: React.ReactNode;

    /**
     * Optional field used to group top level navigation entries under a
     * navigation view.
     */
    group?: string;

}

