import { DataSourceDelegate } from "./datasource";
import { StorageSource } from "./storage";
import { Role, User } from "../users";

/**
 * Controller for retrieving the logged user or performing auth related operations.
 * Note that if you are implementing your AuthController, you probably will want
 * to do it as the result of a hook.
 * @group Hooks and utilities
 */
export type AuthController<USER extends User = any, ExtraData = any> = {

    /**
     * The user currently logged in
     * The values can be: the user object, null if they skipped login
     */
    user: USER | null;

    /**
     * Initial loading flag. It is used not to display the login screen
     * when the app first loads, and it has not been checked whether the user
     * is logged in or not.
     */
    initialLoading?: boolean;

    /**
     * Loading flag. It is used to display a loading screen when the user is
     * logging in or out.
     */
    authLoading: boolean;

    /**
     * Sign out
     */
    signOut: () => Promise<void>;

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

    extra: ExtraData;

    setExtra: (extra: ExtraData) => void;

    setUser?: (user: USER | null) => void;

    setUserRoles?: (roles: Role[]) => void;

};

/**
 * Implement this function to allow access to specific users.
 * @group Hooks and utilities
 */
export type Authenticator<USER extends User = User> = (props: {

    /**
     * Logged-in user or null
     */
    user: USER | null;

    /**
     * AuthController
     */
    authController: AuthController<USER>;

    /**
     * Connector to your database, e.g. your Firestore database
     */
    dataSourceDelegate: DataSourceDelegate;

    /**
     * Used storage implementation
     */
    storageSource: StorageSource;

}) => boolean | Promise<boolean>;
