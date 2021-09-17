import React, { useContext } from "react";
import { User } from "../models";

interface AuthProviderProps {
    authController: AuthController,
}

/**
 * Controller for retrieving the logged user or performing auth related operations
 * @category Hooks and utilities
 */
export interface AuthController {

    /**
     * The user currently logged in
     * The values can be: the user object, null if they skipped login
     */
    user: User | null;

    /**
     * Has the user completed the steps to access the main view, after the
     * login screen
     */
    canAccessMainView: boolean;

    /**
     * Error dispatched by the auth provider
     */
    authError: any;

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
     * e.g: Additional user data fetched from a Firestore document, or custom
     * claims
     */
    extra?: any;

    /**
     * You can use this method to store any extra data you would like to
     * associate your user to.
     * e.g: Additional user data fetched from a Firestore document, or custom
     * claims
     */
    setExtra: (extra: any) => void;
}

export const AuthContext = React.createContext<AuthController>({
    user: null,
    authError: null,
    canAccessMainView: false,
    setAuthProviderError: (error: Error) => {
    },
    authLoading: false,
    setAuthLoading: () => {
    },
    notAllowedError: false,
    skipLogin: () => {
    },
    signOut: () => {
    },
    setExtra: (extra: any) => {
    }
});

/**
 * Hook to retrieve the AuthContext.
 *
 * Consider that in order to use this hook you need to have a parent
 * `FirebaseCMSApp` or a `CMSAppProvider`
 *
 * @see AuthController
 * @category Hooks and utilities
 */
export const useAuthController = () => useContext<AuthController>(AuthContext);

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
