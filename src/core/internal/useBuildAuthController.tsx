import React, { useEffect, useState } from "react";
import {
    AuthController,
    AuthDelegate,
    Authenticator,
    DataSource,
    Locale,
    StorageSource,
    User
} from "../../models";

export function useBuildAuthController({
                                           authDelegate,
                                           authentication,
                                           dateTimeFormat,
                                           locale,
                                           dataSource,
                                           storageSource
                                       }: {
    authDelegate: AuthDelegate,
    authentication?: boolean | Authenticator,
    dateTimeFormat?: string;
    locale?: Locale;
    dataSource: DataSource;
    storageSource: StorageSource;
}): AuthController {

    const [user, setUser] = useState<User | null>(null);
    const [notAllowedError, setNotAllowedError] = useState<any>(false);
    const [extra, setExtra] = useState<any>();

    async function checkAuthentication() {
        const delegateUser = authDelegate.user;
        if (authentication instanceof Function && delegateUser) {
            try {
                const allowed = await authentication({
                    user: delegateUser,
                    authController,
                    dateTimeFormat,
                    locale,
                    dataSource,
                    storageSource
                });
                if (allowed)
                    setUser(delegateUser);
                else
                    setNotAllowedError(true);
            } catch (e) {
                setNotAllowedError(e);
            }
        } else {
            setUser(delegateUser);
        }
    }

    useEffect(() => {
        checkAuthentication();
    }, [authDelegate.user]);

    const loginSkipped = authDelegate.loginSkipped;

    const authenticationEnabled = authentication === undefined || !!authentication;
    const canAccessMainView = (!authenticationEnabled || Boolean(user) || Boolean(loginSkipped)) && !notAllowedError;

    const authController: AuthController = {
        user,
        loginSkipped,
        canAccessMainView,
        notAllowedError,
        signOut: authDelegate.signOut,
        extra,
        setExtra,
        authDelegate
    };
    return authController;
}
