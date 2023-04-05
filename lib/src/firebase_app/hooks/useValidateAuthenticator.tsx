import { useCallback, useEffect, useRef, useState } from "react";
import equal from "react-fast-compare";

import { User as FirebaseUser } from "firebase/auth";

import { AppCheckTokenResult, DataSource, StorageSource } from "../../types";
import { Authenticator, FirebaseAuthController } from "../types/auth";

/**
 * This hook is used internally for validating an authenticator.
 * You may want to use it if you are not using {@link FirebaseCMSApp}, but
 * building your own custom {@link FireCMS} instance.
 * @param authController
 * @param authentication
 * @param getAppCheckToken
 * @param storageSource
 * @param dataSource
 */
export function useValidateAuthenticator({
                                             authController,
                                             authentication,
                                             getAppCheckToken,
                                             appCheckForceRefresh = false,
                                             storageSource,
                                             dataSource
                                         }:
                                             {
                                                 authController: FirebaseAuthController,
                                                 authentication?: boolean | Authenticator<FirebaseUser>,
                                                 getAppCheckToken?: (forceRefresh: boolean) => Promise<AppCheckTokenResult> | undefined,
                                                 appCheckForceRefresh?: boolean,
                                                 dataSource: DataSource;
                                                 storageSource: StorageSource;
                                             }): {
    canAccessMainView: boolean,
    authLoading: boolean,
    notAllowedError: any,
    authVerified: boolean,
} {

    const authenticationEnabled = Boolean(authentication);

    const [authLoading, setAuthLoading] = useState<boolean>(authenticationEnabled);
    const [notAllowedError, setNotAllowedError] = useState<any>(false);
    const [authVerified, setAuthVerified] = useState<boolean>(!authenticationEnabled || Boolean(authController.loginSkipped));

    const canAccessMainView = (authVerified) &&
        (!authenticationEnabled || Boolean(authController.user) || Boolean(authController.loginSkipped)) &&
        !notAllowedError;

    useEffect(() => {
        if (authController.loginSkipped)
            setAuthVerified(true);
    }, [authController.loginSkipped]);

    /**
     * We use this ref to check the authentication only if the user has
     * changed
     */
    const checkedUserRef = useRef<FirebaseUser | undefined>();

    const checkAuthentication = useCallback(async () => {

        if (authController.initialLoading) {
            return;
        }

        if (!authController.user && !authController.loginSkipped) {
            checkedUserRef.current = undefined;
            setAuthLoading(false);
            setAuthVerified(false);
            return;
        }

        const delegateUser = authController.user;

        if (getAppCheckToken) {
            try {
                if (!await getAppCheckToken(appCheckForceRefresh)) {
                    setNotAllowedError("App Check failed.");
                    authController.signOut();
                } else {
                    console.log("App Check success.");
                }
            } catch (e: any) {
                setNotAllowedError(e.message);
                authController.signOut();
            }
        }

        if (authentication instanceof Function && delegateUser && !equal(checkedUserRef.current, delegateUser)) {
            setAuthLoading(true);
            try {
                const allowed = await authentication({
                    user: delegateUser,
                    authController,
                    dataSource,
                    storageSource
                });
                if (!allowed) {
                    authController.signOut();
                    setNotAllowedError(true);
                }
            } catch (e) {
                setNotAllowedError(e);
                authController.signOut();
            }
            setAuthLoading(false);
            setAuthVerified(true);
            checkedUserRef.current = delegateUser;
        } else {
            setAuthLoading(false);
        }

        if (!authController.initialLoading && !delegateUser) {
            setAuthVerified(true);
        }

    }, [authController, authentication, getAppCheckToken, appCheckForceRefresh, dataSource, storageSource]);

    useEffect(() => {
        checkAuthentication();
    }, [checkAuthentication]);

    return {
        canAccessMainView,
        authLoading: authenticationEnabled && authLoading,
        notAllowedError,
        authVerified
    }
}
