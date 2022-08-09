import { useCallback, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";

import { DataSource, StorageSource } from "../../models";
import { Authenticator, FirebaseAuthController } from "../models/auth";

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

    const authenticationEnabled = authentication === undefined || !!authentication;

    const [authLoading, setAuthLoading] = useState<boolean>(false);
    const [notAllowedError, setNotAllowedError] = useState<any>(false);
    const [authVerified, setAuthVerified] = useState<boolean>(!authenticationEnabled);

    const canAccessMainView = authVerified && (!authenticationEnabled || Boolean(authController.user) || Boolean(authController.loginSkipped)) && !notAllowedError;

    const checkAuthentication = useCallback(async () => {
        if (authController.initialLoading || !authController.user) return;
        const delegateUser = authController.user;
        if (authentication instanceof Function && delegateUser) {
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
        }

        if (!authController.initialLoading && !delegateUser)
            setAuthVerified(true);

    }, [authController.user, authController.signOut, authentication]);

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
