import firebase from "firebase/app";
import "firebase/auth";

import React, { useContext, useEffect } from "react";
import { Authenticator } from "../models";

interface AuthProviderProps {
    authenticator: Authenticator | undefined,
    firebaseConfigInitialized: boolean,
    children: React.ReactNode;
}

export interface AuthContextController {

    /**
     * The Firebase user currently logged in
     */
    loggedUser: firebase.User | null;

    /**
     * Error dispatched by the auth provider
     */
    authProviderError: any;

    setAuthProviderError: (error: any) => void;

    /**
     * Is the login process ongoing
     */
    authLoading: boolean;

    /**
     *
     * @param loading
     */
    setAuthLoading: (loading: boolean) => void;

    /**
     * Authentication result
     */
    authResult: any;

    /**
     * Change authentication result
     * @param authResult
     */
    setAuthResult: (authResult: any) => void;

    /**
     * Is the login skipped
     */
    loginSkipped: boolean;

    /**
     * The current user was not allowed access
     */
    notAllowedError: boolean;

    /**
     * Skip login
     */
    skipLogin: () => void;

    /**
     * Sign out
     */
    signOut: () => void;
}

export const AuthContext = React.createContext<AuthContextController>({
    loggedUser: null,
    authProviderError: null,
    setAuthProviderError: (error: Error) => {
    },
    authLoading: false,
    setAuthLoading: () => {
    },
    authResult: null,
    setAuthResult: () => {
    },
    loginSkipped: false,
    notAllowedError: false,
    skipLogin: () => {
    },
    signOut: () => {
    }
});
export const useAuthContext = () => useContext<AuthContextController>(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = (
    {
        children,
        authenticator,
        firebaseConfigInitialized
    }) => {

    const [loggedUser, setLoggedUser] = React.useState<firebase.User | null>(null);
    const [authProviderError, setAuthProviderError] = React.useState<any>();

    const [authLoading, setAuthLoading] = React.useState(true);
    const [authResult, setAuthResult] = React.useState<any>();
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

    function skipLogin() {
        setNotAllowedError(false);
        setLoginSkipped(true);
        setLoggedUser(null);
        setAuthProviderError(null);
    }

    function signOut() {
        firebase.auth().signOut()
            .then(_ => {
                setNotAllowedError(false);
                setLoginSkipped(false);
                setLoggedUser(null);
                setAuthProviderError(null);
            });
    }

    return (
        <AuthContext.Provider
            value={{
                loggedUser,
                authProviderError,
                setAuthProviderError,
                authLoading,
                setAuthLoading,
                authResult,
                setAuthResult,
                loginSkipped,
                notAllowedError,
                skipLogin,
                signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
