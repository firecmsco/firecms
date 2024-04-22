import React from "react";

import {
    Authenticator,
    CMSAnalyticsEvent,
    CMSView,
    CMSViewsBuilder,
    EntityCollection,
    EntityCollectionsBuilder,
    FireCMSPlugin,
    Locale,
    PropertyConfig
} from "@firecms/core";
import { FirebaseApp } from "firebase/app";
import { FirebaseLoginViewProps } from "./FirebaseLoginView";
import {
    AppCheckOptions,
    FirebaseSignInOption,
    FirebaseSignInProvider,
    FirebaseUserWrapper,
    FirestoreTextSearchControllerBuilder
} from "../types";
import { FirestoreIndexesBuilder } from "../hooks";

/**
 * Main entry point that defines the CMS configuration
 * @category Firebase
 */
export type FireCMSFirebaseAppProps = {

    /**
     * Name of the app, displayed as the main title and in the tab title
     */
    name: string;

    /**
     * Logo to be displayed in the drawer of the CMS.
     * If not specified, the FireCMS logo will be used
     */
    logo?: string;

    /**
     * Logo used in dark mode. If not specified, `logo` will always be used.
     */
    logoDark?: string;

    /**
     * List of the mapped collections in the CMS.
     * Each entry relates to a collection in the root database.
     * Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    collections?: EntityCollection[] | EntityCollectionsBuilder;

    /**
     * Custom additional views created by the developer, added to the main
     * navigation
     */
    views?: CMSView[] | CMSViewsBuilder;

    /**
     * Custom additional views created by the developer, added to the admin
     * navigation
     */
    adminViews?: CMSView[] | CMSViewsBuilder;

    /**
     * Record of custom form fields to be used in the CMS.
     * You can use the key to reference the custom field in
     * the `propertyConfig` prop of a property in a collection.
     */
    propertyConfigs?: PropertyConfig[];

    /**
     * Do the users need to log in to access the CMS.
     * You can specify an Authenticator function to discriminate which users can
     * access the CMS or not.
     * If not specified, authentication is enabled but no user restrictions
     * apply
     */
    authenticator?: boolean | Authenticator<FirebaseUserWrapper>;

    /**
     * List of sign in options that will be displayed in the login
     * view if `authentication` is enabled. You can pass Firebase providers strings,
     * such as `firebase.auth.GoogleAuthProvider.PROVIDER_ID` or include additional
     * config such as scopes or custom parameters
     * {@link FirebaseSignInOption}
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
    onFirebaseInit?: (config: object, app: FirebaseApp) => void;

    /**
     * Use this to enable Firebase App Check
     */
    appCheckOptions?: AppCheckOptions;

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
     * Use this controller to return text search results as document ids, that
     * get then fetched from Firestore.
     *
     */
    textSearchControllerBuilder?: FirestoreTextSearchControllerBuilder;

    /**
     * Default path under the navigation routes of the CMS will be created
     */
    basePath?: string;

    /**
     * Default path under the collection routes of the CMS will be created
     */
    baseCollectionPath?: string;

    /**
     * Callback used to get analytics events from the CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;

    /**
     * Use plugins to modify the behaviour of the CMS.
     * Currently, in ALPHA, and likely subject to change.
     */
    plugins?: FireCMSPlugin[];

    /**
     * Open the drawer on hover. Defaults to `false`
     */
    autoOpenDrawer?: boolean;

    /**
     * Use this builder to indicate which indexes are available in your
     * Firestore database. This is used to allow filtering and sorting
     * for multiple fields in the CMS.
     */
    firestoreIndexesBuilder?: FirestoreIndexesBuilder;

    localTextSearchEnabled?: boolean;

    components?: ComponentsRegistry;

};

export type ComponentsRegistry = {
    /**
     * Component to be used to render the login view
     */
    LoginView?: React.ComponentType<FirebaseLoginViewProps>;

    /**
     * Component to be used to render the home page
     */
    HomePage?: React.ComponentType;
};
