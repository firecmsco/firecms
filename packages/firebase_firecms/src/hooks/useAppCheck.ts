import React, { useCallback, useEffect } from "react";

import { AppCheck, getToken, initializeAppCheck } from "@firebase/app-check";
import { FirebaseApp } from "@firebase/app";
import { AppCheckOptions } from "../types";

/**
 * @group Firebase
 */
export interface InitializeAppCheckProps {
    firebaseApp?: FirebaseApp;
    options?: AppCheckOptions;
}

export interface InitializeAppCheckResult {
    loading: boolean;
    appCheckVerified?: boolean;
    error?: any;
}

/**
 * Function used to initialise Firebase App Check.
 *
 * @group Firebase
 */
export function useAppCheck({
                                firebaseApp,
                                options,
                            }: InitializeAppCheckProps): InitializeAppCheckResult {
    if (options?.debugToken) {
        Object.assign(window, {
            FIREBASE_APPCHECK_DEBUG_TOKEN: options?.debugToken
        });
    }

    const [appCheckLoading, setAppCheckLoading] = React.useState<boolean>(false);
    const [appCheckVerified, setAppCheckVerified] = React.useState<boolean | undefined>(undefined);
    const [error, setError] = React.useState<any>();

    const verifyToken = useCallback(async (appCheck: AppCheck) => {
        try {
            const token = await getToken(appCheck, options?.forceRefresh);
            console.debug("App Check token:", token);
            if (!token) {
                setError("App Check failed.");
                setAppCheckVerified(false);
            } else {
                setAppCheckVerified(true);
                console.debug("App Check success.");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message);
        }
    }, [options?.forceRefresh]);

    useEffect(() => {
        if (!options) return;
        if (!firebaseApp) return;
        if (appCheckVerified !== undefined) return;

        setAppCheckLoading(true);

        const {
            provider,
            isTokenAutoRefreshEnabled
        } = options;
        const appCheck = initializeAppCheck(firebaseApp, {
            provider,
            isTokenAutoRefreshEnabled
        });

        verifyToken(appCheck)
            .then(() => {
                setAppCheckLoading(false);
            });

    }, [appCheckVerified, firebaseApp, options, verifyToken]);

    return {
        loading: appCheckLoading,
        appCheckVerified,
        error
    };
}
