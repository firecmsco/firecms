import React from "react";
import { User } from "./user";


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

    loginSkipped: boolean;

    /**
     * Has the user completed the steps to access the main view, after the
     * login screen
     */
    canAccessMainView: boolean;

    /**
     * Error dispatched by the auth provider
     */
    authError?: any;

    /**
     * Is the login process ongoing
     */
    authLoading: boolean;

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

/**
 * Controller for retrieving the logged user or performing auth related operations
 * @category Hooks and utilities
 */
export interface AuthDelegate {

    /**
     * The user currently logged in
     * The values can be: the user object, null if they skipped login
     */
    user: User | null;

    /**
     * Error dispatched by the auth provider
     */
    authError?: any;

    /**
     * Is the login process ongoing
     */
    authLoading: boolean;

    /**
     * The current user was not allowed access
     */
    notAllowedError: boolean;

    /**
     * Sign out
     */
    signOut: () => void;

}
