import firebase from "firebase/app";
import "firebase/auth";

import React, { useContext, useEffect } from "react";
import { Authenticator } from "../authenticator";

const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

interface AuthProviderProps {
    authenticator: Authenticator | undefined,
    firebaseConfigInitialized: boolean,
    children: React.ReactNode;
}

export interface AuthContextState {
    loggedUser: firebase.User | null;
    authProviderError: any;
    authLoading: boolean;
    setAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;
    loginSkipped: boolean;
    notAllowedError: boolean;
    googleSignIn: () => void;
    skipLogin: () => void;
    onSignOut: () => void;
}

export const AuthContext = React.createContext<AuthContextState>({
    loggedUser: null,
    authProviderError: null,
    authLoading: false,
    setAuthLoading: () => {},
    loginSkipped: false,
    notAllowedError: false,
    googleSignIn: () => {
    },
    skipLogin: () => {
    },
    onSignOut: () => {
    }
});
export const useAuthContext = () => useContext<AuthContextState>(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = (
    {
        children,
        authenticator,
        firebaseConfigInitialized
    }) => {

    const [loggedUser, setLoggedUser] = React.useState<firebase.User | null>(null);
    const [authProviderError, setAuthProviderError] = React.useState<any>();

    const [authLoading, setAuthLoading] = React.useState(true);
    const [loginSkipped, setLoginSkipped] = React.useState<boolean>(false);
    const [notAllowedError, setNotAllowedError] = React.useState<boolean>(false);

    useEffect(() => {
        if (firebaseConfigInitialized) {
            return firebase.auth().onAuthStateChanged(
                onAuthStateChanged,
                error => setAuthProviderError(error)
            );
        }
        return () => {
        };
    }, [firebaseConfigInitialized]);

    const onAuthStateChanged = async (user: firebase.User | null) => {

        setNotAllowedError(false);

        if (authenticator && user) {
            const allowed = await authenticator(user);
            if (allowed)
                setLoggedUser(user);
            else
                setNotAllowedError(true);
        } else {
            setLoggedUser(user);
        }

        setAuthLoading(false);
    };

    function googleSignIn() {
        setAuthProviderError(null);
        firebase
            .auth()
            .signInWithPopup(googleAuthProvider)
            .then((_: firebase.auth.UserCredential) => {
            })
            .catch(error => setAuthProviderError(error));
    }

    function skipLogin() {
        setAuthProviderError(null);
        setLoginSkipped(true);
    }

    function onSignOut() {
        firebase.auth().signOut();
        setLoginSkipped(false);
    }

    return (
        <AuthContext.Provider
            value={{
                loggedUser,
                authProviderError,
                authLoading,
                setAuthLoading,
                loginSkipped,
                notAllowedError,
                googleSignIn,
                skipLogin,
                onSignOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
