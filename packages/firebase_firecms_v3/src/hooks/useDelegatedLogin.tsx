import { FirebaseApp } from "firebase/app";
import { useCallback, useEffect, useState } from "react";
import { getAuth, signInWithCustomToken, User as FirebaseUser } from "firebase/auth";
import { ProjectsApi } from "../api/projects";


export function useDelegatedLogin({
                                      projectsApi,
                                      firebaseApp,
                                      projectId,
                                      getBackendAuthToken,
                                      onUserChanged,
                                  }: {
    projectsApi: ProjectsApi;
    firebaseApp?: FirebaseApp,
    projectId: string,
    getBackendAuthToken: () => Promise<string>,
    onUserChanged?: (user?: FirebaseUser) => void,
}) {

    const [loginSuccessful, setLoginSuccessful] = useState(false);
    const [delegatedLoginLoading, setDelegatedLoginLoading] = useState(false);
    const [delegatedLoginError, setDelegatedLoginError] = useState<Error | undefined>(undefined);

    const checkLogin = useCallback(async () => {
        if (firebaseApp && projectId) {
            setDelegatedLoginError(undefined);
            setDelegatedLoginLoading(true);
            setLoginSuccessful(false);
            const firebaseAccessToken = await getBackendAuthToken();
            try {
                let delegatedToken = getTokenFromCache(projectId);
                if (!delegatedToken) {
                    delegatedToken = await projectsApi.doDelegatedLogin(firebaseAccessToken, projectId);
                    cacheToken(projectId, delegatedToken);
                }
                if (!delegatedToken) {
                    throw new Error("No delegated token");
                }
                const auth = getAuth(firebaseApp);
                signInWithCustomToken(auth, delegatedToken)
                    .then((userCredential) => {
                        console.log("Delegated user signed in", userCredential);
                        onUserChanged?.(userCredential.user);
                        setLoginSuccessful(true);
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

    return { loginSuccessful, delegatedLoginLoading, delegatedLoginError };

}


const tokens = new Map<string, {
    token: string,
    expiry: Date
}>();

function cacheToken(projectId: string, delegatedToken?: string) {
    if (!delegatedToken) {
        return;
    }

    const data = parseJwt(delegatedToken);
    // @ts-ignore
    const expiry = new Date(data.exp * 1000);
    tokens.set(projectId, { token: delegatedToken, expiry });
}

function getTokenFromCache(projectId: string) {
    const entry = tokens.get(projectId);
    if (entry && entry.expiry > new Date()) {
        console.log("Using cached token", projectId);
        return entry.token;
    }
    return undefined;
}

function parseJwt(token?: string): object {
    if (!token) {
        throw new Error("No JWT token");
    }
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(window.atob(base64).split("").map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));

    return JSON.parse(jsonPayload);
}
