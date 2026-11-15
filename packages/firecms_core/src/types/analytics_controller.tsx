import { CMSAnalyticsEvent } from "./analytics.js";

export type AnalyticsController = {

    /**
     * Callback used to get analytics events from the CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;

}
