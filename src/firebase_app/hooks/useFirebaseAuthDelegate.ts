import { useEffect, useState } from "react";

import {
    getAuth,
    onAuthStateChanged,
    signOut,
    User as FirebaseUser
} from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { AuthDelegate } from "../../models";

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
    }: FirebaseAuthHandlerProps): AuthDelegate<FirebaseUser> => {

    const [loggedUser, setLoggedUser] = useState<FirebaseUser | null>(null);
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
        setLoggedUser(firebaseUser);
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
