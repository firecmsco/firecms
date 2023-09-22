import * as Sentry from "@sentry/browser";
import { doc, Firestore, getFirestore, onSnapshot } from "firebase/firestore";

import { FirebaseSignInOption, FirebaseSignInProvider, FireCMSBackend } from "../types";
import { FirebaseApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    OAuthCredential,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User as FirebaseUser
} from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildProjectsApi } from "../api/projects";

const AUTH_SCOPES = [
    "https://www.googleapis.com/auth/cloud-platform"
];

export interface FireCMSBackendProps {
    backendApiHost: string;
    backendFirebaseApp?: FirebaseApp;
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>; // TODO
}

export function useBuildFireCMSBackend({ backendApiHost, backendFirebaseApp }: FireCMSBackendProps): FireCMSBackend {

    const [loggedUser, setLoggedUser] = useState<FirebaseUser | null | undefined>(undefined); // logged user, anonymous or logged out

    const [authLoading, setAuthLoading] = useState(true);
    const [googleCredential, setGoogleCredential] = useState<OAuthCredential | null>(loadCredentialFromStorage());
    const [authProviderError, setAuthProviderError] = useState<any>();
    const [permissionsNotGrantedError, setPermissionsNotGrantedError] = useState<boolean>(false);

    const [availableProjects, setAvailableProjects] = useState<string[] | undefined>();
    const [availableProjectsLoading, setAvailableProjectsLoading] = useState<boolean>(true);
    const [availableProjectsLoaded, setAvailableProjectsLoaded] = useState<boolean>(false);
    const [availableProjectsError, setAvailableProjectsError] = useState<Error | undefined>();

    const firestoreRef = useRef<Firestore>();
    const firestore = firestoreRef.current;

    const updateFirebaseUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
        Sentry.setUser(firebaseUser
            ? {
                id: firebaseUser.uid,
                email: firebaseUser.email ?? ""
            }
            : null);
        setLoggedUser(firebaseUser);
    }, []);

    useEffect(() => {
        if (!backendFirebaseApp) return;
        firestoreRef.current = getFirestore(backendFirebaseApp);
    }, [backendFirebaseApp]);

    useEffect(() => {
        if (!backendFirebaseApp) return;
        const auth = getAuth(backendFirebaseApp);
        updateFirebaseUser(auth.currentUser);
        return onAuthStateChanged(
            auth,
            (firebaseUser: FirebaseUser | null) => {
                setAuthLoading(false);
                updateFirebaseUser(firebaseUser);
            },
            error => setAuthProviderError(error)
        );
    }, [backendFirebaseApp, updateFirebaseUser]);

    useEffect(() => {
        if (!firestore) {
            return;
        }
        if (!loggedUser) {
            setAvailableProjects(undefined);
            setAvailableProjectsLoading(false);
            setAvailableProjectsLoaded(false);
            return;
        }
        return onSnapshot(doc(firestore, "users", loggedUser.uid),
            {
                next: (snapshot) => {
                    const projectIds = snapshot.get("projects") ?? [];
                    setAvailableProjectsError(undefined);
                    setAvailableProjects(projectIds);
                    setAvailableProjectsLoaded(true);
                    setAvailableProjectsLoading(false);
                },
                error: (e) => {
                    // console.error(e);
                    setAvailableProjectsError(e);
                    setAvailableProjectsLoading(false);
                }
            }
        );
    }, [loggedUser, firestore]);

    const googleLogin = useCallback((includeGoogleAdminScopes?: boolean) => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            access_type: "offline"
        });
        if (includeGoogleAdminScopes)
            AUTH_SCOPES.forEach((scope) => provider.addScope(scope));
        const auth = getAuth();
        signInWithPopup(auth, provider)
            .then(credential => {
                if (includeGoogleAdminScopes) {
                    // @ts-ignore
                    const userInfo = JSON.parse(credential._tokenResponse.rawUserInfo);
                    const grantedScopes = userInfo.granted_scopes.split(" ");
                    if (includeGoogleAdminScopes && !grantedScopes.includes(AUTH_SCOPES[0])) {
                        setPermissionsNotGrantedError(true);
                    } else {
                        const credentialFromResult = GoogleAuthProvider.credentialFromResult(credential);
                        setGoogleCredential(credentialFromResult);
                        saveCredentialInStorage(credentialFromResult);
                        setPermissionsNotGrantedError(false);
                    }
                }
            })
            .catch(setAuthProviderError);
    }, []);

    const onSignOut = useCallback(() => {
        const auth = getAuth(backendFirebaseApp);
        signOut(auth)
            .then(_ => {
                setLoggedUser(null);
                setGoogleCredential(null);
                setAuthProviderError(null);
                saveCredentialInStorage(null);
            });
    }, [backendFirebaseApp]);

    const getBackendAuthToken = useCallback(() => {
        if (!loggedUser)
            throw Error("Trying to get Firebase token ");
        return loggedUser.getIdToken();
    }, [loggedUser]);

    const projectsApi = buildProjectsApi(backendApiHost, getBackendAuthToken);

    return {
        backendApiHost,
        user: loggedUser ?? null,
        signOut: onSignOut,
        googleLogin,
        getBackendAuthToken,
        googleCredential,
        availableProjects,
        availableProjectsLoaded,
        availableProjectsLoading,
        availableProjectsError,
        permissionsNotGrantedError,
        authLoading,
        authProviderError,
        backendFirebaseApp,
        backendUid: loggedUser?.uid,
        projectsApi
    }

}

function saveCredentialInStorage(credential: OAuthCredential | null) {
    if (!credential) {
        localStorage.removeItem("googleCredential");
        return;
    }
    const credentialString = JSON.stringify({
        created_on: new Date(),
        credential: credential.toJSON()
    });
    localStorage.setItem("googleCredential", credentialString);
}

function loadCredentialFromStorage(): OAuthCredential | null {
    try {
        const credentialString = localStorage.getItem("googleCredential");
        if (!credentialString)
            return null;
        const credentialJSON = JSON.parse(credentialString) satisfies {
            created_on: string,
            credential: any
        };
        const credential = OAuthCredential.fromJSON(credentialJSON.credential);
        const createdOn = new Date(credentialJSON.created_on);
        const now = new Date();
        const diff = now.getTime() - createdOn.getTime();
        // check the credential is valid
        if (diff > 1000 * 60 * 60) {
            console.debug("Google credential expired credential expired");
            saveCredentialInStorage(null);
            return null;
        }
        return credential;
    } catch (e) {
        console.error(e);
        return null;
    }
}
