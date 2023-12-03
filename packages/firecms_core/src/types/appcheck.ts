import { FirebaseApp } from "firebase/app";

/**
 * @group Firebase
 */
export interface AppCheck {
    firebaseApp?: FirebaseApp;
}

/**
 * @group Firebase
 */
export interface AppCheckOptions {
    providerKey: string;
    useEnterpriseRecaptcha: boolean;
    isTokenAutoRefreshEnabled?: boolean;
    debugToken?: string;
    forceRefresh?: boolean;
}

/**
 * @group Firebase
 */
export declare interface AppCheckTokenResult {
    /**
     * The token string in JWT format.
     */
    readonly token: string;
}
