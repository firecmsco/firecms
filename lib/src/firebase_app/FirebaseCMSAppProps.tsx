import React from "react";
import {
    Authenticator,
    CMSView,
    CollectionOverrideHandler,
    EntityCollection,
    Locale, Role,
    User
} from "../models";
import { FirestoreTextSearchController } from "./models/text_search";
import { User as FirebaseUser } from "firebase/auth";
import { FirebaseSignInOption, FirebaseSignInProvider } from "./models/auth";
import { FirebaseLoginViewProps } from "./components/FirebaseLoginView";

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
     * Do the users need to log in to access the CMS.
     * You can specify an Authenticator function to discriminate which users can
     * access the CMS or not.
     * If not specified, authentication is enabled but no user restrictions
     * apply
     */
    authentication?: boolean | Authenticator<FirebaseUser>;

    /**
     * List of sign in options that will be displayed in the login
     * view if `authentication` is enabled. You can pass Firebase providers strings,
     * such as `firebase.auth.GoogleAuthProvider.PROVIDER_ID` or include addtional
     * config such as scopes or custom parameters
     * {@see FirebaseSignInOption}
     * Defaults to Google sign in only.
     */
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;

    /**
     * If authentication is enabled, allow the user to access the content
     * without login.
     */
    allowSkipLogin?: boolean;

    /**
     * Firebase configuration of the project. If you afe deploying the app to
     * Firebase hosting, you don't need to specify this value
     */
    firebaseConfig?: Record<string, unknown>;

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
     * Used to override collections based on the collection path and entityId.
     * This resolver allows to override the collection for specific entities, or
     * specific collections, app wide. This overrides collections all through the app.
     *
     * You can also override collections in place, when using `useSideEntityController`
     */
    collectionOverrideHandler?: CollectionOverrideHandler;

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

    /**
     * Set of roles defined in the CMS.
     * The keys of the record are the IDs of the roles.
     * If not specified the default values will be used.
     */
    roles?: Record<string, Role>;

    /**
     * Additional props passed to the login view. You can use this props
     * to disable registration in `password` mode, or to set up an additional
     * message.
     */
    LoginViewProps?: Partial<FirebaseLoginViewProps>;
}
