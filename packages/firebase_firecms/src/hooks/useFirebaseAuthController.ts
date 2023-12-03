import { useCallback, useMemo, useState } from "react";

import {
    createUserWithEmailAndPassword as createUserWithEmailAndPasswordFirebase,
    fetchSignInMethodsForEmail as fetchSignInMethodsForEmailFirebase,
    getAuth,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    User as FirebaseUser
} from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { FirebaseAuthController, FirebaseSignInOption, FirebaseSignInProvider, FireCMSBackend } from "../types/auth";
import { Role } from "../types";

interface FirebaseAuthControllerProps {
    firebaseApp?: FirebaseApp;
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>; // TODO
    fireCMSBackend?: FireCMSBackend;
}

/**
 * Use this hook to build an {@link AuthController} based on Firebase Auth
 * @group Firebase
 */
export const useFirebaseAuthController = ({
                                              firebaseApp,
                                              signInOptions,
                                              fireCMSBackend
                                          }: FirebaseAuthControllerProps): FirebaseAuthController => {

    const [loggedUser, setLoggedUser] = useState<FirebaseUser | null | undefined>(undefined); // logged user, anonymous or logged out
    const [authError, setAuthError] = useState<any>();
    const [authProviderError, setAuthProviderError] = useState<any>();
    const [authLoading, setAuthLoading] = useState(true);
    const [loginSkipped, setLoginSkipped] = useState<boolean>(false);

    const [userRoles, setUserRoles] = useState<Role[] | null>(null);

    const getProviderOptions = useCallback((providerId: FirebaseSignInProvider): FirebaseSignInOption | undefined => {
        return signInOptions?.find((option) => {
            if (option === null) throw Error("useFirebaseAuthController");
            if (typeof option === "object" && option.provider === providerId)
                return option as FirebaseSignInOption;
            return undefined;
        }) as FirebaseSignInOption | undefined;
    }, [signInOptions]);

    const googleLogin = useCallback(() => {
        const provider = new GoogleAuthProvider();
        const options = getProviderOptions("google.com");
        if (options?.scopes)
            options.scopes.forEach((scope) => provider.addScope(scope));
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = getAuth(firebaseApp);
        signInWithPopup(auth, provider).catch(setAuthProviderError);
    }, [getProviderOptions]);

    const getAuthToken = useCallback(async (): Promise<string> => {
        if (!loggedUser)
            throw Error("No client user is logged in");
        return loggedUser.getIdToken();
    }, [loggedUser]);

    const emailPasswordLogin = useCallback((email: string, password: string) => {
        const auth = getAuth(firebaseApp);
        setAuthLoading(true);
        signInWithEmailAndPassword(auth, email, password)
            .catch(setAuthProviderError)
            .then(() => setAuthLoading(false));
    }, []);

    const createUserWithEmailAndPassword = useCallback((email: string, password: string) => {
        const auth = getAuth(firebaseApp);
        setAuthLoading(true);
        createUserWithEmailAndPasswordFirebase(auth, email, password)
            .catch(setAuthProviderError)
            .then(() => setAuthLoading(false));
    }, []);

    const fetchSignInMethodsForEmail = useCallback((email: string): Promise<string[]> => {
        const auth = getAuth(firebaseApp);
        setAuthLoading(true);
        return fetchSignInMethodsForEmailFirebase(auth, email)
            .then((res) => {
                setAuthLoading(false);
                return res;
            });
    }, []);

    const onSignOut = useCallback(() => {
        const auth = getAuth(firebaseApp);
        signOut(auth)
            .then(_ => {
                setLoggedUser(null);
                setAuthProviderError(null);
                fireCMSBackend?.signOut();
            });
        setLoginSkipped(false);
    }, [firebaseApp, fireCMSBackend?.signOut]);

    const updateUser = useCallback((user: FirebaseUser | null) => {
        setLoggedUser(user);
        setAuthLoading(false);
    }, []);

    return useMemo(() => ({
        user: loggedUser ?? null,
        setUser: updateUser,
        authProviderError,
        authLoading,
        initialLoading: authLoading,
        signOut: onSignOut,
        getAuthToken,
        googleLogin,
        loginSkipped: false,
        userRoles,
        setUserRoles,
        emailPasswordLogin,
        createUserWithEmailAndPassword,
        fetchSignInMethodsForEmail
    }), [authLoading, authProviderError, createUserWithEmailAndPassword, emailPasswordLogin, fetchSignInMethodsForEmail, getAuthToken, googleLogin, loggedUser, onSignOut, updateUser, userRoles]);
};
