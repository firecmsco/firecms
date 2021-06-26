import React from "react";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";
import {
    Authenticator,
    EntityCollection,
    Navigation,
    NavigationBuilder,
    SchemaResolver
} from "../models";

/**
 * Main entry point that defines the CMS configuration
 */
export interface CMSAppProps {
    /**
     * Name of the app, displayed as the main title and in the tab title
     */
    name: string;

    /**
     * Logo to be displayed in the drawer of the CMS
     */
    logo?: string;

    /**
     * Use this prop to specify the views that will be generated in the CMS.
     * You usually will want to create a `Navigation` object that includes
     * collection views where you specify the path and the schema.
     * Additionally you can add custom views to the root navigation.
     * In you need to customize the navigation based on the logged user you
     * can use a `NavigationBuilder`
     */
    navigation: Navigation | NavigationBuilder | EntityCollection[];

    /**
     * Do the users need to log in to access the CMS.
     * You can specify an Authenticator function to discriminate which users can
     * access the CMS or not.
     * If not specified, authentication is enabled but no user restrictions
     * apply
     */
    authentication?: boolean | Authenticator;

    /**
     * List of sign in options that will be displayed in the login
     * view if `authentication` is enabled. You can pass google providers strings,
     * such as `firebase.auth.GoogleAuthProvider.PROVIDER_ID` or full configuration
     * objects such as specified in https://firebase.google.com/docs/auth/web/firebaseui
     * Defaults to Google sign in only.
     */
    signInOptions?: Array<string | any>;

    /**
     * If authentication is enabled, allow the user to access the content
     * without login.
     */
    allowSkipLogin?: boolean;

    /**
     * Firebase configuration of the project. If you afe deploying the app to
     * Firebase hosting, you don't need to specify this value
     */
    firebaseConfig?: Object;

    /**
     * Optional callback after Firebase has been initialised. Useful for
     * using the local emulator or retrieving the used configuration.
     * @param config
     */
    onFirebaseInit?: (config: object) => void;

    /**
     * Primary color of the theme of the CMS
     */
    primaryColor?: string;

    /**
     * Secondary color of the theme of the CMS
     */
    secondaryColor?: string

    /**
     * Font family string
     * e.g.
     * '"Roboto", "Helvetica", "Arial", sans-serif'
     */
    fontFamily?: string

    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    toolbarExtraWidget?: React.ReactNode;

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
     * Used to override schemas based on the collection path and entityId.
     * This resolver allows to override the schema for specific entities, or
     * specific collections, app wide. This overrides schemas all through the app.
     *
     * You can also override schemas in place, when using `useSideEntityController`
     */
    schemaResolver?: SchemaResolver;
}


/**
 * Custom additional views created by the developer, added to the main
 * navigation.
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
     * Component to be rendered
     */
    view: React.ReactNode;

    /**
     * Optional field used to group top level navigation entries under a
     * navigation view.
     */
    group?: string;

}

export type Locale =
    "af" |
    "ar" |
    "arDZ" |
    "arMA" |
    "arSA" |
    "az" |
    "be" |
    "bg" |
    "bn" |
    "ca" |
    "cs" |
    "cy" |
    "da" |
    "de" |
    "el" |
    "enAU" |
    "enCA" |
    "enGB" |
    "enIN" |
    "enNZ" |
    "enUS" |
    "eo" |
    "es" |
    "et" |
    "eu" |
    "faIR" |
    "fi" |
    "fil" |
    "fr" |
    "frCA" |
    "frCH" |
    "gd" |
    "gl" |
    "gu" |
    "he" |
    "hi" |
    "hr" |
    "hu" |
    "hy" |
    "id" |
    "is" |
    "it" |
    "ja" |
    "ka" |
    "kk" |
    "kn" |
    "ko" |
    "lb" |
    "lt" |
    "lv" |
    "mk" |
    "ms" |
    "mt" |
    "nb" |
    "nl" |
    "nlBE" |
    "nn" |
    "pl" |
    "pt" |
    "ptBR" |
    "ro" |
    "ru" |
    "sk" |
    "sl" |
    "sr" |
    "srLatn" |
    "sv" |
    "ta" |
    "te" |
    "th" |
    "tr" |
    "ug" |
    "uk" |
    "uz" |
    "vi" |
    "zhCN" |
    "zhTW";
