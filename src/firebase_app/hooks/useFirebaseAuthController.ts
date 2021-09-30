import React, { useEffect } from "react";

import {
    getAuth,
    onAuthStateChanged,
    signOut,
    User as FirebaseUser
} from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { Authenticator } from "../models/authenticator";
import { AuthController, User } from "../../models";

interface FirebaseAuthHandlerProps {
    firebaseApp?: FirebaseApp,
    authentication?: boolean | Authenticator;
}

/**
 * Use this hook to build an {@link AuthController} based on Firebase Auth
 * @category Firebase
 */
export const useFirebaseAuthController = (
    {
        firebaseApp,
        authentication
    }: FirebaseAuthHandlerProps): AuthController => {

    const [loggedUser, setLoggedUser] = React.useState<User | null>(null);
    const [authProviderError, setAuthProviderError] = React.useState<any>();

    const [authLoading, setAuthLoading] = React.useState(true);
    const [loginSkipped, setLoginSkipped] = React.useState<boolean>(false);
    const [notAllowedError, setNotAllowedError] = React.useState<boolean>(false);

    useEffect(() => {
        if (!firebaseApp) return;
        const auth = getAuth(firebaseApp);
        return onAuthStateChanged(
            auth,
            updateFirebaseUser,
            error => setAuthProviderError(error)
        );
    }, [firebaseApp]);

    const updateFirebaseUser = async (firebaseUser: FirebaseUser | null) => {

        const user: User | null = firebaseUser ? {
            ...firebaseUser,
            extra: loggedUser ? loggedUser.extra : null
        } : null;

        setNotAllowedError(false);
        if (authentication instanceof Function && user) {
            const allowed = await authentication({ user });
            if (allowed)
                setLoggedUser(user);
            else
                setNotAllowedError(true);
        } else {
            setLoggedUser(user);
        }

        setAuthLoading(false);
    };

    function skipLogin() {
        setNotAllowedError(false);
        setLoginSkipped(true);
        setLoggedUser(null);
        setAuthProviderError(null);
    }

    function onSignOut() {
        const auth = getAuth(firebaseApp);
        signOut(auth)
            .then(_ => {
                setNotAllowedError(false);
                setLoginSkipped(false);
                setLoggedUser(null);
                setAuthProviderError(null);
            });
    }

    const authenticationEnabled = authentication === undefined || !!authentication;
    const canAccessMainView = (!authenticationEnabled || Boolean(loggedUser) || loginSkipped) && !notAllowedError;

    return {
        user: loggedUser,
        authError: authProviderError,
        setAuthProviderError,
        authLoading,
        setAuthLoading,
        notAllowedError,
        skipLogin,
        signOut: onSignOut,
        canAccessMainView
    };
};
