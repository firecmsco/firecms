import { AuthController } from "./auth";
import { EntityCollection } from "./collections";
import { User } from "./user";


/**
 * You can use this builder to customize the navigation, based on the logged in
 * user
 * @category Models
 */
export type NavigationBuilder =
    ((props: NavigationBuilderProps) => Promise<Navigation>)
    | ((props: NavigationBuilderProps) => Navigation);

/**
 * @category Models
 */
export interface NavigationBuilderProps {
    user: User | null,
    authController: AuthController
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
    collections: EntityCollection[];

    /**
     * Custom additional views created by the developer, added to the main
     * navigation
     */
    views?: CMSView[];

}

/**
 * Context that includes the resolved navigation and utility methods and
 * attributes.
 * @category Models
 */
export type NavigationContext = {

    navigation?: Navigation;

    loading: boolean;

    navigationLoadingError?: any;

    isCollectionPath: (path: string) => boolean;

    getEntityOrCollectionPath: (cmsPath: string) => string;

    buildCollectionPath: (path: string) => string;

    buildCMSUrl: (path: string) => string;

    buildHomeUrl: () => string;

    /**
     * Default path under the navigation routes of the CMS will be created
     */
    basePath: string;

    /**
     * Default path under the collection routes of the CMS will be created
     */
    baseCollectionPath: string;
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

