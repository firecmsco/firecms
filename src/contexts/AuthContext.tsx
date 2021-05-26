import firebase from "firebase/app";
import "firebase/auth";

import React, { useContext, useEffect } from "react";
import { Authenticator } from "../models";

interface AuthProviderProps {
    authController: AuthController,
}

export interface AuthController {

    /**
     * The Firebase user currently logged in
     * Either the Firebase user, null if they skipped login or undefined
     * if they are in the login screen
     */
    loggedUser: firebase.User | null;

    /**
     * Has the user completed the steps to access the main view, after the
     * login screen
     */
    canAccessMainView: boolean;

    /**
     * Error dispatched by the auth provider
     */
    authProviderError: any;

    /**
     * Set an auth provider error
     * @param error
     */
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

    /**
     * Utility field you can use to store your custom data.
     * e.g: Additional user data fetched from a Firestore document
     */
    extra?: any;

    /**
     * Set extra
     */
    setExtra: (extra: any) => void;
}

export const AuthContext = React.createContext<AuthController>({
    loggedUser: null,
    authProviderError: null,
    canAccessMainView: false,
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
    },
    setExtra: (extra: any) => {
    }
});

export const useAuthContext = () => useContext<AuthController>(AuthContext);

export const AuthProvider: React.FC<AuthProviderProps> = (
    {
        children,
        authController
    }) => {

    return (
        <AuthContext.Provider
            value={{
                ...authController
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

interface AuthHandlerProps {
    authentication?: boolean | Authenticator;
}

export const useAuthHandler = (
    {
        authentication
    }: AuthHandlerProps): AuthController => {

    const [loggedUser, setLoggedUser] = React.useState<firebase.User | null>(null);
    const [authProviderError, setAuthProviderError] = React.useState<any>();

    const [authLoading, setAuthLoading] = React.useState(true);
    const [authResult, setAuthResult] = React.useState<any>();
    const [loginSkipped, setLoginSkipped] = React.useState<boolean>(false);
    const [notAllowedError, setNotAllowedError] = React.useState<boolean>(false);
    const [extra, setExtra] = React.useState<any>();

    useEffect(() => {
        return firebase.auth().onAuthStateChanged(
            onAuthStateChanged,
            error => setAuthProviderError(error)
        );
    }, []);

    const onAuthStateChanged = async (user: firebase.User | null) => {

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

    function signOut() {
        firebase.auth().signOut()
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
        authResult,
        setAuthResult,
        loginSkipped,
        notAllowedError,
        skipLogin,
        signOut,
        canAccessMainView,
        extra,
        setExtra
    };
};

