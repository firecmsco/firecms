import { FireCMSAppConfig } from "./types";

/**
 * Main entry point that defines the CMS configuration
 * @group Firebase
 */
export type FireCMS3AppProps = {

    /**
     * Firebase project id this CMS is connected to.
     */
    projectId: string;

    /**
     * Customization object to define the CMS.
     */
    appConfig: FireCMSAppConfig;

    /**
     * Default path under the navigation routes of the CMS will be created.
     */
    basePath?: string;

    /**
     * Default path under the collection routes of the CMS will be created
     */
    baseCollectionPath?: string;

    /**
     * Callback used to get analytics events from the CMS
     */
    onAnalyticsEvent?: (event: string, data?: object) => void;

    /**
     * Backend API host. Only used internally for testing.
     */
    backendApiHost?: string;

};
