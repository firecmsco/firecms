import React from "react";
import { EntityCollection, EntityReference, FireCMSPlugin } from "../types";

/**
 * Controller that includes the resolved navigation and utility methods and
 * attributes.
 * This controller holds the state of the navigation including the collections.
 * @group Models
 */
export type NavigationController<EC extends EntityCollection = EntityCollection<any>> = {

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

    /**
     * Custom additional views created by the developer, added to the admin
     * navigation
     */
    adminViews?: CMSView[];

    /**
     * Configuration for the views that should be displayed at the top
     * level of the navigation (e.g. in the home page or the navigation
     * drawer)
     */
    topLevelNavigation?: NavigationResult;

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
     * The collection is resolved from the given path or alias.
     */
    getCollection: (slugOrPath: string, includeUserOverride?: boolean) => EC | undefined;

    /**
     * Get the top level collection configuration for a given id
     */
    getCollectionById: (id: string) => EC | undefined;

    /**
     * Get the collection configuration from its parent ids.
     */
    getCollectionFromIds: (ids: string[]) => EC | undefined;

    /**
     * Get the collection configuration from its parent path segments.
     */
    getCollectionFromPaths: (pathSegments: string[]) => EC | undefined;

    /**
     * Default path under the navigation routes of the CMS will be created.
     * Defaults to '/'. You may want to change this `basepath` to 'admin' for example.
     */
    basePath: string;

    /**
     * Default path under the collection routes of the CMS will be created.
     * It defaults to '/c'
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
     * Turn a path with collection ids into a resolved path.
     * The ids (typically used in urls) will be replaced with relative paths (typically used in database paths)
     * @param pathWithAliases
     */
    resolveDatabasePathsFrom: (path: string) => string;

    /**
     * Call this method to recalculate the navigation
     */
    refreshNavigation: () => void;

    /**
     * Retrieve all the related parent references for a given path
     * @param path
     */
    getParentReferencesFromPath: (path: string) => EntityReference[];

    /**
     * Retrieve all the related parent collection ids for a given path
     * @param path
     */
    getParentCollectionIds: (path: string) => string[];

    /**
     * Resolve paths from a list of ids
     * @param ids
     */
    convertIdsToPaths: (ids: string[]) => string[];

    /**
     * A function to navigate to a specified route or URL.
     *
     * @param {string} to - The target route or URL to navigate to.
     * @param {NavigateOptions} [options] - Optional configuration settings for navigation, such as replace behavior or state data.
     */
    navigate: (to: string, options?: NavigateOptions) => void;

    /**
     * Plugin system allowing to extend the CMS functionality.
     */
    plugins?: FireCMSPlugin<any, any, any>[];

}

export interface NavigateOptions {
    replace?: boolean;
    state?: any;
    preventScrollReset?: boolean;
    relative?: "route" | "path";
    flushSync?: boolean;
    viewTransition?: boolean;
}

// currently not used, in favor of a single blocker in `FireCMSRoute`
export type NavigationBlocker = {
    updateBlockListener: (path: string, block: boolean, basePath?: string) => () => void;
    isBlocked: (path: string) => boolean;
    proceed?: () => void;
    reset?: () => void;
};

/**
 * Custom additional views created by the developer, added to the main
 * navigation.
 * @group Models
 */
export interface CMSView {

    /**
     * CMS Path you can reach this view from.
     */
    slug: string;

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
     * You can use any of the icons in the Material specs:
     * https://fonts.google.com/icons
     * e.g. 'account_tree' or 'person'
     * Find all the icons in https://firecms.co/docs/icons
     */
    icon?: string | React.ReactNode;

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
     * This prop is ignored for admin views.
     */
    group?: string;

}

/**
 * Used to group navigation entries in the main navigation.
 */
export interface NavigationGroupMapping {
    /**
     * Name of the group, used to display the group header in the UI
     */
    name: string;
    /**
     * List of collection ids or view paths that belong to this group.
     */
    entries: string[];
}

export interface NavigationEntry {
    id: string;
    url: string;
    name: string;
    slug: string;
    type: "collection" | "view" | "admin";
    collection?: EntityCollection;
    view?: CMSView;
    description?: string;
    group: string;
}

export type NavigationResult = {

    allowDragAndDrop: boolean;

    navigationEntries: NavigationEntry[],

    groups: string[],

    onNavigationEntriesUpdate: (entries: NavigationGroupMapping[]) => void;
};

