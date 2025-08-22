import { FirebaseApp } from "@firebase/app";
import { useCallback, useEffect, useState } from "react";
import { getAuth, signInWithCustomToken, User as FirebaseUser } from "@firebase/auth";
import { ProjectsApi } from "../api/projects";
import { cacheDelegatedLoginToken, getDelegatedLoginTokenFromCache } from "../utils";
import { ApiError } from "@firecms/types";

export type DelegatedLoginProps = {
    projectsApi: ProjectsApi;
    firebaseApp?: FirebaseApp,
    projectId: string,
    onUserChanged?: (user?: FirebaseUser) => void,
    onAnalyticsEvent?: (event: string, data?: object) => void;
};

export function useDelegatedLogin({
                                      projectsApi,
                                      firebaseApp,
                                      projectId,
                                      onUserChanged,
                                  }: DelegatedLoginProps) {

    const [loginSuccessful, setLoginSuccessful] = useState(false);
    const [delegatedLoginLoading, setDelegatedLoginLoading] = useState(false);
    const [delegatedLoginError, setDelegatedLoginError] = useState<Error | ApiError | undefined>(undefined);

    const checkLogin = useCallback(async (skipCache = false) => {
        console.debug("Checking delegated login", {skipCache, projectId})
        if (firebaseApp && projectId) {
            setDelegatedLoginError(undefined);
            setDelegatedLoginLoading(true);
            setLoginSuccessful(false);
            try {
                let usedCachedToken = false;
                let delegatedToken = !skipCache && getDelegatedLoginTokenFromCache(projectId);
                if (!delegatedToken) {
                    try {
                        console.debug("Delegating login", projectId);
                        delegatedToken = await projectsApi.doDelegatedLogin(projectId);
                    } catch (e) {
                        console.error("Error delegating login", JSON.stringify(e));
                        setDelegatedLoginError(e as any);
                    }
                } else {
                    console.debug("Using cached token", projectId);
                    usedCachedToken = true;
                }

                if (!delegatedToken) {
                    return;
                }

                const auth = getAuth(firebaseApp);
                signInWithCustomToken(auth, delegatedToken)
                    .then(async (userCredential) => {
                        console.debug("Delegated user signed in", userCredential);
                        onUserChanged?.(userCredential.user);
                        setLoginSuccessful(true);
                        try {
                            cacheDelegatedLoginToken(projectId, delegatedToken);
                        } catch (e) {
                            console.error("Error caching token", e);
                        }
                    })
                    .catch(async (error) => {
                        if (usedCachedToken) {
                            return await checkLogin(true);
                        } else {
                            console.error("Error signing in with delegated token", error);
                            setLoginSuccessful(false);
                            setDelegatedLoginError(error);

                        }
                    }).finally(() => setDelegatedLoginLoading(false));
            } catch (e) {
                setLoginSuccessful(false);
                setDelegatedLoginError(e as any);
                setDelegatedLoginLoading(false);
            }
        }
    }, [firebaseApp, projectId]);

    useEffect(() => {
        checkLogin();
    }, [checkLogin]);

    return {
        loginSuccessful,
        delegatedLoginLoading,
        delegatedLoginError,
        checkLogin
    };

}
