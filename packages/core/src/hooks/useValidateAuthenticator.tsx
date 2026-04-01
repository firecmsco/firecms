import { useCallback, useEffect, useRef, useState } from "react";
import { deepEqual as equal } from "fast-equals";

import { AuthController, Authenticator, RebaseData, StorageSource, User } from "@rebasepro/types";

/**
 * This hook is used internally for validating an authenticator.
 *
 * @param authController
 * @param authentication
 * @param storageSource
 * @param data
 */
export function useValidateAuthenticator<USER extends User = any>
({
     disabled,
     authController,
     authenticator,
     storageSource,
     data
 }:
 {
     disabled?: boolean,
     authController: AuthController<USER>,
     authenticator?: boolean | Authenticator<USER>,
     data: RebaseData;
     storageSource: StorageSource;
 }): {
    canAccessMainView: boolean,
    authLoading: boolean,
    notAllowedError: any,
    authVerified: boolean,
} {

    const authenticationEnabled = Boolean(authenticator);

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
    const checkedUserRef = useRef<User | undefined>(undefined);

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

        if (authenticator instanceof Function && delegateUser && !equal(checkedUserRef.current?.uid, delegateUser.uid)) {
            setAuthLoading(true);
            try {
                const allowed = await authenticator({
                    user: delegateUser,
                    authController,
                    data,
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

    }, [disabled, authController, authenticator, data, storageSource]);

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
