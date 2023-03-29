import { EntityCollection } from "./collections";

/**
 * Context that includes the resolved navigation and utility methods and
 * attributes.
 * @category Models
 */
export type NavigationContext = {

    /**
     * List of the mapped collections in the CMS.
     * Each entry relates to a collection in the root database.
     * Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    collections: EntityCollection[];

    /**
     * Custom additional views created by the developer, added to the main
     * navigation
     */
    views: CMSView[];

    /**
     * Configuration for the views that should be displayed at the top
     * level of the navigation (e.g. in the home page or the navigation
     * drawer)
     */
    topLevelNavigation?: TopNavigationResult;

    /**
     * Is the navigation loading (the configuration persistence has not
     * loaded yet, or a specified navigation builder has not completed)
     */
    loading: boolean;

    /**
     * Was there an error while loading the navigation data
     */
    navigationLoadingError?: any;

    /**
     * Is the registry ready to be used
     */
    initialised: boolean;

    /**
     * Get the collection configuration for a given path.
     * The collection is resolved from the given path or alias, located
     * among the
     */
    getCollection: <EC extends EntityCollection = EntityCollection<any>>(pathOrAlias: string,
                                                                         entityId?: string,
                                                                         includeUserOverride?: boolean) => EC | undefined;

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

    buildUrlEditCollectionPath: (props: { path: string }) => string;

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

    /**
     * Turn a path with aliases into a resolved path
     * @param pathWithAliases
     */
    resolveAliasesFrom: (pathWithAliases: string) => string;

    /**
     * Location used as the base for routes.
     * This is the location that will be used underneath, when the url changes while
     * opening a side dialog
     */
    baseLocation: string;

    /**
     * Call this method to recalculate the navigation
     */
    refreshNavigation: () => void;
}

/**
 * Custom additional views created by the developer, added to the main
 * navigation.
 * @category Models
 */
export interface CMSView {

    /**
     * CMS Path you can reach this view from.
     */
    path: string;

    /**
     * Name of this view
     */
    name: string;

    /**
     * Optional description of this view. You can use Markdown
     */
    description?: string;

    /**
     * Icon key to use in this view.
     * You can use any of the icons in the MUI specs:
     * https://mui.com/material-ui/material-icons/
     * e.g. 'AccountTree' or 'Person'
     */
    icon?: string;

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

export interface TopNavigationEntry {
    url: string;
    name: string;
    path: string;
    type: "collection" | "view";
    collection?: EntityCollection;
    view: CMSView;
    description?: string;
    group?: string;
}

export type TopNavigationResult = {
    navigationEntries: TopNavigationEntry[],
    groups: string[]
};
