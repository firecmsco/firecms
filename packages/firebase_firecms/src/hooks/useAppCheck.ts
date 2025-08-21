import React, { useCallback, useEffect, useRef } from "react";

import { AppCheck, getToken, initializeAppCheck } from "@firebase/app-check";
import { FirebaseApp } from "@firebase/app";
import { AppCheckOptions } from "@firecms/types";

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

    const initialCheck = useRef<boolean>(false);

    const verifyToken = useCallback(async (appCheck: AppCheck) => {
        console.debug("Verifying App Check token...", appCheck);
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
            console.error("App Check error:", e);
            setError(e.message);
        }
    }, [options?.forceRefresh]);

    useEffect(() => {
        if (!options) return;
        if (!firebaseApp) return;
        if (appCheckVerified !== undefined) return;
        if (initialCheck.current) return;

        setAppCheckLoading(true);

        const {
            provider,
            isTokenAutoRefreshEnabled
        } = options;

        removeCurrentAppCheckDiv();

        const appCheck = initializeAppCheck(firebaseApp, {
            provider,
            isTokenAutoRefreshEnabled
        });

        verifyToken(appCheck)
            .then(() => {
                setAppCheckLoading(false);
            });
        initialCheck.current = true;
    }, [appCheckVerified, firebaseApp, options, verifyToken]);

    return {
        loading: appCheckLoading,
        appCheckVerified,
        error
    };
}


function removeCurrentAppCheckDiv() {
    const div = document.getElementById("fire_app_check_[DEFAULT]");
    if (div) {
        div.remove();
    }
}

