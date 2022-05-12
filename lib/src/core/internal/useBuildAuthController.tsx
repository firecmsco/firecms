import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AuthController,
    AuthDelegate,
    Authenticator,
    DataSource,
    Locale,
    Role,
    Roles,
    StorageSource,
    User
} from "../../models";

export function useBuildAuthController<UserType extends User>({
                                                                  authDelegate,
                                                                  authentication,
                                                                  dateTimeFormat,
                                                                  roles: cmsRoles,
                                                                  locale,
                                                                  dataSource,
                                                                  storageSource
                                                              }: {
    authDelegate: AuthDelegate<UserType>,
    roles?: Roles;
    authentication?: boolean | Authenticator<UserType>,
    dateTimeFormat?: string;
    locale?: Locale;
    dataSource: DataSource;
    storageSource: StorageSource;
}): AuthController<UserType> {

    const [user, setUser] = useState<UserType | null>(null);
    const [roles, setRoles] = useState<string[] | null>(null);
    const [authLoading, setAuthLoading] = useState<boolean>(false);
    const [notAllowedError, setNotAllowedError] = useState<any>(false);
    const [extra, setExtra] = useState<any>();

    const loginSkipped = authDelegate.loginSkipped;

    const authenticationEnabled = authentication === undefined || !!authentication;
    const canAccessMainView = (!authenticationEnabled || Boolean(user) || Boolean(loginSkipped)) && !notAllowedError;

    const userRoles = useMemo(() => !cmsRoles
            ? undefined
            : (roles
                ? roles
                    .map(roleId => cmsRoles[roleId])
                    .filter(Boolean) as Role[]
                : []),
        [cmsRoles, roles]);

    const authController: AuthController<UserType> = useMemo(() =>
        ({
            user,
            loginSkipped,
            canAccessMainView,
            initialLoading: authDelegate.initialLoading ?? false,
            authLoading,
            notAllowedError,
            signOut: authDelegate.signOut,
            extra,
            setExtra,
            authDelegate,
            roles: userRoles,
            setRoles
        }), [authDelegate, authLoading, canAccessMainView, extra, loginSkipped, notAllowedError, user, userRoles, setRoles]);

    const checkAuthentication = useCallback(async () => {
        const delegateUser = authDelegate.user;
        if (authentication instanceof Function && delegateUser) {
            setAuthLoading(true);
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
                authDelegate.signOut();
            }
            setAuthLoading(false);
        } else {
            setUser(delegateUser);
        }
    }, [authDelegate.user]);

    useEffect(() => {
        checkAuthentication();
    }, [authDelegate.user, checkAuthentication]);

    return authController;
}
