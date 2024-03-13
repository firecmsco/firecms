import { useCallback, useEffect, useRef, useState } from "react";
import equal from "react-fast-compare";

import { AppCheckTokenResult, AuthController, DataSourceDelegate, StorageSource, User } from "@firecms/core";
import { Authenticator } from "../types";

/**
 * This hook is used internally for validating an authenticator.
 *
 * @param authController
 * @param authentication
 * @param getAppCheckToken
 * @param appCheckForceRefresh
 * @param storageSource
 * @param dataSource
 */
export function useValidateAuthenticator<UserType extends User = User>({
                                                                           disabled,
                                                                           authController,
                                                                           authentication,
                                                                           getAppCheckToken,
                                                                           appCheckForceRefresh = false,
                                                                           storageSource,
                                                                           dataSourceDelegate
                                                                       }:
                                                                           {
                                                                               disabled?: boolean,
                                                                               authController: AuthController<UserType>,
                                                                               authentication?: boolean | Authenticator<UserType>,
                                                                               getAppCheckToken?: (forceRefresh: boolean) => Promise<AppCheckTokenResult> | undefined,
                                                                               appCheckForceRefresh?: boolean,
                                                                               dataSourceDelegate: DataSourceDelegate;
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
     * changed.
     */
    const checkedUserRef = useRef<User | undefined>();

    const checkAuthentication = useCallback(async () => {

        if (disabled) {
            return;
        }

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
        console.debug("Checking authentication for user", delegateUser);

        if (getAppCheckToken) {
            try {
                if (!await getAppCheckToken(appCheckForceRefresh)) {
                    setNotAllowedError("App Check failed.");
                    authController.signOut();
                } else {
                    console.debug("App Check success.");
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
                    dataSourceDelegate,
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

    }, [disabled, authController, authentication, getAppCheckToken, appCheckForceRefresh, dataSourceDelegate, storageSource]);

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
