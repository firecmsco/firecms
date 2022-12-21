import { useCallback, useEffect, useRef, useState } from "react";
import equal from "react-fast-compare";

import { User as FirebaseUser } from "firebase/auth";

import { DataSource, StorageSource } from "../../types";
import { Authenticator, FirebaseAuthController } from "../types/auth";

/**
 * This hook is used internally for validating an authenticator.
 * You may want to use it if you are not using {@link FirebaseCMSApp}, but
 * building your own custom {@link FireCMS} instance.
 * @param authController
 * @param authentication
 * @param storageSource
 * @param dataSource
 */
export function useValidateAuthenticator({
                                             authController,
                                             authentication,
                                             storageSource,
                                             dataSource
                                         }:
                                             {
                                                 authController: FirebaseAuthController,
                                                 authentication?: boolean | Authenticator<FirebaseUser>,
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
    const [authVerified, setAuthVerified] = useState<boolean>(!authenticationEnabled);

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
        if (authController.initialLoading || !authController.user) {
            checkedUserRef.current = undefined;
            return;
        }
        const delegateUser = authController.user;
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
        }

        if (!authController.initialLoading && !delegateUser)
            setAuthVerified(true);

    }, [authController, authentication, dataSource, storageSource]);

    useEffect(() => {
        checkAuthentication();
    }, [checkAuthentication]);

    return {
        canAccessMainView,
        authLoading,
        notAllowedError,
        authVerified
    }
}
