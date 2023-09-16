import { FirebaseApp } from "firebase/app";
import { useCallback, useEffect, useState } from "react";
import { getAuth, signInWithCustomToken, User as FirebaseUser } from "firebase/auth";
import { doDelegatedLogin } from "@firecms/firebase_firecms_v3";

const tokens = new Map<string, { token: string, expiry: Date }>();

function cacheToken(projectId: string, delegatedToken?: string) {
    if (!delegatedToken) {
        return;
    }

    const data = parseJwt(delegatedToken);
    // @ts-ignore
    const expiry = new Date(data.exp * 1000);
    tokens.set(projectId, { token: delegatedToken, expiry });
}

function getFromCache(projectId: string) {
    const entry = tokens.get(projectId);
    if (entry && entry.expiry > new Date()) {
        console.log("Using cached token", projectId);
        return entry.token;
    }
    return undefined;
}

export function useDelegatedLogin({
                                      firebaseApp,
                                      projectId,
                                      getFirebaseIdToken,
                                      onUserChanged
                                  }: {
    firebaseApp?: FirebaseApp,
    projectId: string,
    getFirebaseIdToken: () => Promise<string>,
    onUserChanged?: (user?: FirebaseUser) => void
}) {

    const [loginSuccessful, setLoginSuccessful] = useState(false);
    const [delegatedLoginLoading, setDelegatedLoginLoading] = useState(false);
    const [delegatedLoginError, setDelegatedLoginError] = useState<Error | undefined>(undefined);

    const checkLogin = useCallback(async () => {
        if (firebaseApp && projectId) {
            setDelegatedLoginError(undefined);
            setDelegatedLoginLoading(true);
            setLoginSuccessful(false);
            const firebaseAccessToken = await getFirebaseIdToken();
            try {
                let delegatedToken = getFromCache(projectId);
                if (!delegatedToken) {
                    delegatedToken = await doDelegatedLogin(firebaseAccessToken, projectId);
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
