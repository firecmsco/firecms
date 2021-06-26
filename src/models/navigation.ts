import firebase from "firebase/app";
import { EntityCollection } from "./collections";
import { CMSView } from "../core/CMSAppProps";


/**
 * You can use this builder to customize the navigation, based on the logged in
 * user
 */
export type NavigationBuilder =
    ((props: NavigationBuilderProps) => Promise<Navigation>)
    | ((props: NavigationBuilderProps) => Navigation);

export type NavigationBuilderProps = { user: firebase.User | null }

/**
 * In this interface you define the main navigation entries of the CMS
 */
export interface Navigation {

    /**
     * List of the mapped collections in the CMS.
     * Each entry relates to a collection in the root Firestore database.
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
