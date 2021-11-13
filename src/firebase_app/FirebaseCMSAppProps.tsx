import React from "react";
import {
    Authenticator,
    EntityCollection,
    Locale,
    Navigation,
    NavigationBuilder,
    SchemaResolver
} from "../models";
import { FirestoreTextSearchController } from "./models/text_search";
import { User as FirebaseUser } from "firebase/auth";

/**
 * Main entry point that defines the CMS configuration
 * @category Firebase
 */
export interface FirebaseCMSAppProps {

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
    navigation: Navigation | NavigationBuilder<FirebaseUser> | EntityCollection[];

    /**
     * Do the users need to log in to access the CMS.
     * You can specify an Authenticator function to discriminate which users can
     * access the CMS or not.
     * If not specified, authentication is enabled but no user restrictions
     * apply
     */
    authentication?: boolean | Authenticator<FirebaseUser>;

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

    /**
     * Use this controller to return text search results as document ids, that
     * get then fetched from Firestore.
     *
     */
    textSearchController?: FirestoreTextSearchController;

    /**
     * In case you need to override the home page.
     * You may want to use {@link useNavigation} in order to get the resolved
     * navigation.
     */
    HomePage?: React.ComponentType;

    /**
     * Default path under the navigation routes of the CMS will be created
     */
    basePath?: string;

    /**
     * Default path under the collection routes of the CMS will be created
     */
    baseCollectionPath?: string;
}

