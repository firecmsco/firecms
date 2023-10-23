import { FirebaseApp } from "firebase/app";
import { AppCheckOptions, CMSAnalyticsEvent, FireCMSPlugin, Locale } from "@firecms/core";
import { FirestoreTextSearchController } from "./types/text_search";
import { FirebaseSignInOption, FirebaseSignInProvider } from "./types/auth";
import { FireCMSCustomization } from "./types/firecms_v3_config";

/**
 * Main entry point that defines the CMS configuration
 * @category Firebase
 */
export type FireCMS3AppProps = {

    projectId: string;

    config: FireCMSCustomization;

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
    textSearchController?: FirestoreTextSearchController;

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
     */
    plugins?: FireCMSPlugin[];

    backendApiHost?: string;

};
