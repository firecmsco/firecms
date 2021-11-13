import React from "react";
import { User } from "./user";


/**
 * Controller for retrieving the logged user or performing auth related operations
 * @category Hooks and utilities
 */
export interface AuthController<UserType extends User = User> {

    /**
     * The user currently logged in
     * The values can be: the user object, null if they skipped login
     */
    user: UserType | null;

    /**
     * Has the user skipped the login process
     */
    loginSkipped?: boolean;

    /**
     * Has the user completed the steps to access the main view, after the
     * login screen
     */
    canAccessMainView: boolean;

    /**
     * The current user was not allowed access
     */
    notAllowedError: any;

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

    /**
     * Delegate in charge of connecting to a backend and performing the auth
     * operations.
     */
    authDelegate: AuthDelegate<UserType>;

}

/**
 * Controller for retrieving the logged user or performing auth related operations.
 * Note that if you are implementing your AuthDelegate, you probably will want
 * to do it as the result of a hook. Check {@link useFirebaseAuthDelegate} code
 * for an example.
 * @category Hooks and utilities
 */
export type AuthDelegate<UserType extends User = User> = {

    /**
     * The user currently logged in
     * The values can be: the user object, null if they skipped login
     */
    user: UserType | null;

    /**
     * Error dispatched by the auth provider
     */
    authError?: any;

    /**
     * Is the login process ongoing
     */
    authLoading: boolean;

    /**
     * Sign out
     */
    signOut: () => void;

    /**
     * Has the user skipped the login process
     */
    loginSkipped?: boolean;

    /**
     * Skip login
     */
    skipLogin?: () => void;

};
