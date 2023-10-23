import { FirebaseApp } from "firebase/app";

/**
 * @category Firebase
 */
export interface AppCheck {
    firebaseApp?: FirebaseApp;
}

/**
 * @category Firebase
 */
export interface AppCheckOptions {
    providerKey: string;
    useEnterpriseRecaptcha: boolean;
    isTokenAutoRefreshEnabled?: boolean;
    debugToken?: string;
    forceRefresh?: boolean;
}

/**
 * @category Firebase
 */
export declare interface AppCheckTokenResult {
    /**
     * The token string in JWT format.
     */
    readonly token: string;
}
