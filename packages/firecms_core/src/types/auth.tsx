import { User } from "./user";

/**
 * Controller for retrieving the logged user or performing auth related operations.
 * Note that if you are implementing your AuthController, you probably will want
 * to do it as the result of a hook. Check {@link useFirebaseAuthController} code
 * for an example.
 * @category Hooks and utilities
 */
export type AuthController<UserType extends User = User> = {

    /**
     * The user currently logged in
     * The values can be: the user object, null if they skipped login
     */
    user: UserType | null;

    /**
     * Initial loading flag. It is used not to display the login screen
     * when the app first loads, and it has not been checked whether the user
     * is logged in or not.
     */
    initialLoading?: boolean;

    /**
     * Sign out
     */
    signOut: () => void;

    /**
     * Error initializing the authentication
     */
    authError?: any;

    /**
     * Error dispatched by the auth provider
     */
    authProviderError?: any;

    /**
     * You can use this method to retrieve the auth token for the current user.
     */
    getAuthToken: () => Promise<string>;

    /**
     * Has the user skipped the login process
     */
    loginSkipped: boolean;

};
