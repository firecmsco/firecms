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
     * If you have defined an {@link Authenticator}, this flag will be set to
     * true while it loads
     */
    authLoading: boolean;

    /**
     * Error initializing the authentication
     */
    authError?: any;

    /**
     * Error dispatched by the auth provider
     */
    authProviderError?: any;

    /**
     * Utility field you can use to store your custom data.
     * e.g: Additional user data fetched from a Firestore document, or custom
     * claims
     */
    readonly extra?: any;

    /**
     * You can use this method to store any extra data you would like to
     * associate your user to.
     * e.g: Additional user data fetched from a Firestore document, or custom
     * claims
     */
    setExtra: (extra: any) => void;

    /**
     * You can use this method to retrieve the auth token for the current user.
     */
    getAuthToken: () => Promise<string>;

};
