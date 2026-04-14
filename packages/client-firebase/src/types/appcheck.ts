import { CustomProvider, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider } from "@firebase/app-check";

/**
 * @group Firebase
 */
export interface AppCheckOptions {
    provider: CustomProvider | ReCaptchaV3Provider | ReCaptchaEnterpriseProvider;
    isTokenAutoRefreshEnabled?: boolean;
    debugToken?: string;
    forceRefresh?: boolean;
}
