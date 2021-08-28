import { Authenticator, User } from "../models";
import { AuthController } from "../contexts";

import React, { useEffect } from "react";

import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { FirebaseApp } from "firebase/app";

interface FirebaseAuthHandlerProps {
    firebaseApp?: FirebaseApp,
    authentication?: boolean | Authenticator;
}

export const useFirebaseAuthHandler = (
    {
        firebaseApp,
        authentication
    }: FirebaseAuthHandlerProps): AuthController => {

    const [loggedUser, setLoggedUser] = React.useState<User | null>(null);
    const [authProviderError, setAuthProviderError] = React.useState<any>();

    const [authLoading, setAuthLoading] = React.useState(true);
    const [loginSkipped, setLoginSkipped] = React.useState<boolean>(false);
    const [notAllowedError, setNotAllowedError] = React.useState<boolean>(false);
    const [extra, setExtra] = React.useState<any>();

    useEffect(() => {
        if (!firebaseApp) return;
        const auth = getAuth(firebaseApp);
        return onAuthStateChanged(
            auth,
            updateFirebaseUser,
            error => setAuthProviderError(error)
        );
    }, [firebaseApp]);

    const updateFirebaseUser = async (user: User | null) => {
        setNotAllowedError(false);
        if (authentication instanceof Function && user) {
            const allowed = await authentication(user);
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
        loggedUser,
        authProviderError,
        setAuthProviderError,
        authLoading,
        setAuthLoading,
        loginSkipped,
        notAllowedError,
        skipLogin,
        signOut: onSignOut,
        canAccessMainView,
        extra,
        setExtra
    };
};
