import { FirebaseApp } from "firebase/app";
import { useCallback, useEffect, useState } from "react";
import { getAuth, signInWithCustomToken, User as FirebaseUser } from "firebase/auth";
import { ProjectsApi } from "../api/projects";
import { cacheDelegatedLoginToken, getDelegatedLoginTokenFromCache } from "../utils/local_storage";

export type DelegatedLoginProps = {
    projectsApi: ProjectsApi;
    firebaseApp?: FirebaseApp,
    projectId: string,
    onUserChanged?: (user?: FirebaseUser) => void,
};

export function useDelegatedLogin({
                                      projectsApi,
                                      firebaseApp,
                                      projectId,
                                      onUserChanged,
                                  }: DelegatedLoginProps) {

    const [loginSuccessful, setLoginSuccessful] = useState(false);
    const [delegatedLoginLoading, setDelegatedLoginLoading] = useState(false);
    const [delegatedLoginError, setDelegatedLoginError] = useState<Error | undefined>(undefined);

    const checkLogin = useCallback(async () => {
        if (firebaseApp && projectId) {
            setDelegatedLoginError(undefined);
            setDelegatedLoginLoading(true);
            setLoginSuccessful(false);
            try {
                let delegatedToken = getDelegatedLoginTokenFromCache(projectId);
                if (!delegatedToken) {
                    try {
                        delegatedToken = await projectsApi.doDelegatedLogin(projectId);
                    } catch (e) {
                        console.error("Error delegating login", e);
                        setDelegatedLoginError(e as any);
                    }
                }

                if (!delegatedToken) {
                    return;
                }

                const auth = getAuth(firebaseApp);
                signInWithCustomToken(auth, delegatedToken)
                    .then(async (userCredential) => {
                        console.log("Delegated user signed in", userCredential);
                        onUserChanged?.(userCredential.user);
                        setLoginSuccessful(true);
                        try {
                            cacheDelegatedLoginToken(projectId, delegatedToken);
                        } catch (e) {
                            console.error("Error caching token", e);
                        }
                    })
                    .catch((error) => {
                        setLoginSuccessful(false);
                        setDelegatedLoginError(error);
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
        delegatedLoginError
    };

}
