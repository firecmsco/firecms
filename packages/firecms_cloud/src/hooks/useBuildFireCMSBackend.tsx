import { doc, Firestore, getDoc, getFirestore, onSnapshot } from "@firebase/firestore";

import { FireCMSBackend, FireCMSProject } from "../types";
import { FirebaseApp } from "@firebase/app";
import {
    createUserWithEmailAndPassword as createUserWithEmailAndPasswordFirebase,
    fetchSignInMethodsForEmail,
    getAuth,
    GoogleAuthProvider,
    OAuthCredential,
    onAuthStateChanged,
    sendPasswordResetEmail as sendPasswordResetEmailFirebase,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    User as FirebaseUser
} from "@firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildProjectsApi } from "../api/projects";
import { clearDelegatedLoginTokensCache } from "../utils";

const AUTH_SCOPES = [
    "https://www.googleapis.com/auth/cloud-platform"
];

export interface FireCMSBackendProps {
    backendApiHost: string;
    backendFirebaseApp?: FirebaseApp;
    onUserChange?: (user: FirebaseUser | null) => void;
}

export function useBuildFireCMSBackend({
                                           backendApiHost,
                                           backendFirebaseApp,
                                           onUserChange
                                       }: FireCMSBackendProps): FireCMSBackend {

    const [loggedUser, setLoggedUser] = useState<FirebaseUser | null | undefined>(undefined); // logged user, anonymous or logged out

    const [authLoading, setAuthLoading] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);
    const [googleCredential, setGoogleCredential] = useState<OAuthCredential | null>(loadCredentialFromStorage());
    const [authProviderError, setAuthProviderError] = useState<any>();
    const [permissionsNotGrantedError, setPermissionsNotGrantedError] = useState<boolean>(false);

    const [availableProjectIds, setAvailableProjectIds] = useState<string[] | undefined>();
    const [availableProjectsLoading, setAvailableProjectsLoading] = useState<boolean>(true);
    const [availableProjectsLoaded, setAvailableProjectsLoaded] = useState<boolean>(false);
    const [availableProjectsError, setAvailableProjectsError] = useState<Error | undefined>();

    const [projects, setProjects] = useState<FireCMSProject[]>();

    const firestoreRef = useRef<Firestore>();

    const updateFirebaseUser = useCallback( (firebaseUser: FirebaseUser | null) => {
        onUserChange?.(firebaseUser);
        setLoggedUser(firebaseUser);
    }, []);

    useEffect(() => {
        if (availableProjectsLoaded && availableProjectIds) {
            Promise.all(availableProjectIds.map((projectId) => getProject(projectId)))
                .then((projectsRes) => {
                    setProjects(projectsRes.filter(Boolean) as FireCMSProject[])
                })
        }
    }, [availableProjectIds, availableProjectsLoaded]);

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

        const firestore = firestoreRef.current;
        if (!firestore) {
            return;
        }
        if (!loggedUser) {
            setAvailableProjectIds(undefined);
            setAvailableProjectsLoading(false);
            setAvailableProjectsLoaded(false);
            return;
        }
        return onSnapshot(doc(firestore, "users", loggedUser.uid),
            {
                next: (snapshot) => {
                    const projectIds = snapshot.get("projects") ?? [];
                    setAvailableProjectsError(undefined);
                    setAvailableProjectIds(projectIds);
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
    }, [loggedUser]);

    const googleLogin = useCallback((includeGoogleAdminScopes?: boolean): Promise<FirebaseUser | null> => {
        if (!backendFirebaseApp)
            throw Error("useBuildFireCMSBackend googleLogin error");
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            access_type: "offline"
        });
        if (includeGoogleAdminScopes)
            AUTH_SCOPES.forEach((scope) => provider.addScope(scope));
        const auth = getAuth(backendFirebaseApp);
        return signInWithPopup(auth, provider)
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
                return credential.user;
            })
            .catch((e) => {
                setAuthProviderError(e);
                return null;
            });
    }, [backendFirebaseApp]);

    const emailPasswordLogin = useCallback((email: string, password: string) => {
        const auth = getAuth(backendFirebaseApp);
        if (!auth) throw Error("No auth");
        setLoginLoading(true);
        return signInWithEmailAndPassword(auth, email, password)
            .catch(setAuthProviderError)
            .then(() => setLoginLoading(false));
    }, []);

    const createUserWithEmailAndPassword = useCallback((email: string, password: string) => {
        const auth = getAuth(backendFirebaseApp);
        if (!auth) throw Error("No auth");
        setLoginLoading(true);
        return createUserWithEmailAndPasswordFirebase(auth, email, password)
            .catch(setAuthProviderError)
            .then(() => setLoginLoading(false));
    }, []);

    const sendPasswordResetEmail = useCallback((email: string) => {
        const auth = getAuth(backendFirebaseApp);
        if (!auth) throw Error("No auth");
        return sendPasswordResetEmailFirebase(auth, email)
    }, []);

    const fetchSignInMethods = useCallback((email: string): Promise<string[]> => {
        const auth = getAuth(backendFirebaseApp);
        if (!auth) throw Error("No auth");
        return fetchSignInMethodsForEmail(auth, email)
            .then((res) => {
                return res;
            });
    }, []);

    const onSignOut = useCallback(() => {
        const auth = getAuth(backendFirebaseApp);
        clearDelegatedLoginTokensCache()
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

    const getProject = useCallback((projectId: string) => {
        const firestore = firestoreRef.current;
        if (!firestore)
            throw Error("useFireCMSProjectsRepository error");
        return getDoc(doc(firestore, "projects", projectId))
            .then(doc => doc.exists() ? { projectId: doc.id, ...doc.data() } as FireCMSProject : null)
            .catch((error) => {
                console.error("Error getting project:", error);
                return null;
            });
    }, []);

    const projectsApi = buildProjectsApi(backendApiHost, getBackendAuthToken);

    return {
        backendApiHost,
        user: loggedUser ?? null,
        signOut: onSignOut,
        googleLogin,
        fetchSignInMethods,
        emailPasswordLogin,
        createUserWithEmailAndPassword,
        sendPasswordResetEmail,
        getBackendAuthToken,
        googleCredential,
        availableProjectIds,
        availableProjectsLoaded,
        availableProjectsLoading,
        availableProjectsError,
        permissionsNotGrantedError,
        authLoading,
        loginLoading,
        authProviderError,
        backendFirebaseApp,
        backendUid: loggedUser?.uid,
        projectsApi,
        getProject,
        projects
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
