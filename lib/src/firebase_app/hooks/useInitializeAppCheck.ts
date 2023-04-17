import React, { useCallback, useEffect } from "react";

import {
    AppCheck as FirebaseAppCheck,
    getToken,
    initializeAppCheck,
    ReCaptchaEnterpriseProvider,
    ReCaptchaV3Provider
} from "firebase/app-check";
import { AppCheck, AppCheckOptions, AppCheckTokenResult } from "../../types";
import { FirebaseApp } from "firebase/app";

/**
 * @category Firebase
 */
export interface InitializeAppCheckProps {
    firebaseApp?: FirebaseApp;
    options?: AppCheckOptions;
}

export interface InitializeAppCheckResult {
    appCheckLoading: boolean;
    getAppCheckToken?: (forceRefresh: boolean) => Promise<AppCheckTokenResult> | undefined;
}

/**
 * Function used to initialise Firebase App Check.
 *
 * It works as a hook that gives you back an object holding the Firebase App.
 *
 * You most likely only need to use this if you are developing a custom app
 * that is not using {@link FirebaseCMSApp}. You can also not use this component
 * and initialise App Check yourself.
 *
 * @param firebaseApp
 * @category Firebase
 */
export function useInitializeAppCheck({
                                          firebaseApp,
                                          options
                                      }: InitializeAppCheckProps): InitializeAppCheckResult {
    if (options?.debugToken) {
        Object.assign(window, {
            FIREBASE_APPCHECK_DEBUG_TOKEN: options?.debugToken
        });
    }

    const [appCheckLoading, setAppCheckLoading] = React.useState<boolean>(false);
    const [appCheck, setAppCheck] = React.useState<AppCheck | undefined>();

    const getAppCheckToken = useCallback((forceRefresh: boolean) => {
        if (!appCheck || !options) return;
        return getToken(appCheck as FirebaseAppCheck, forceRefresh);
    }, [appCheck, options]);

    useEffect(() => {
        if (!options) return;
        if (!firebaseApp) return;

        setAppCheckLoading(true);

        const {
            providerKey,
            useEnterpriseRecaptcha,
            isTokenAutoRefreshEnabled
        } = options;
        const appCheck_ = initializeAppCheck(firebaseApp, {
            provider: useEnterpriseRecaptcha ? new ReCaptchaEnterpriseProvider(providerKey) : new ReCaptchaV3Provider(providerKey),
            isTokenAutoRefreshEnabled
        });
        setAppCheck(appCheck_ as AppCheck);

        setAppCheckLoading(false);
    }, [firebaseApp, options]);

    return {
        appCheckLoading,
        getAppCheckToken: options ? getAppCheckToken : undefined
    };
}
