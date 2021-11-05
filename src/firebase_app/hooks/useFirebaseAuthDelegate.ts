import { useEffect, useState } from "react";

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

    const [loggedUser, setLoggedUser] = useState<User | null>(null);
    const [authProviderError, setAuthProviderError] = useState<any>();
    const [authLoading, setAuthLoading] = useState(true);
    const [loginSkipped, setLoginSkipped] = useState<boolean>(false);

    function skipLogin() {
        setLoginSkipped(true);
        setLoggedUser(null);
    }

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
            ...firebaseUser
        } : null;
        setLoggedUser(user);
        setAuthLoading(false);
    };

    function onSignOut() {
        const auth = getAuth(firebaseApp);
        signOut(auth)
            .then(_ => {
                setLoggedUser(null);
                setAuthProviderError(null);
            });
    }

    return {
        user: loggedUser,
        authError: authProviderError,
        authLoading,
        signOut: onSignOut,
        loginSkipped,
        skipLogin
    };
};
