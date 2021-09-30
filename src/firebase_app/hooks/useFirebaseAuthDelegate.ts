import React, { useEffect } from "react";

import {
    getAuth,
    onAuthStateChanged,
    signOut,
    User as FirebaseUser
} from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { AuthDelegate, User } from "../../models";

interface FirebaseAuthHandlerProps {
    firebaseApp?: FirebaseApp,
}

/**
 * Use this hook to build an {@link AuthDelegate} based on Firebase Auth
 * @category Firebase
 */
export const useFirebaseAuthDelegate = (
    {
        firebaseApp
    }: FirebaseAuthHandlerProps): AuthDelegate => {

    const [loggedUser, setLoggedUser] = React.useState<User | null>(null);
    const [authProviderError, setAuthProviderError] = React.useState<any>();
    const [authLoading, setAuthLoading] = React.useState(true);
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
        setLoggedUser(user);
        setAuthLoading(false);
    };

    function onSignOut() {
        const auth = getAuth(firebaseApp);
        signOut(auth)
            .then(_ => {
                setNotAllowedError(false);
                setLoggedUser(null);
                setAuthProviderError(null);
            });
    }

    return {
        user: loggedUser,
        authError: authProviderError,
        authLoading,
        notAllowedError,
        signOut: onSignOut
    };
};
