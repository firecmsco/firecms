import {
    ApplicationVerifier,
    ConfirmationResult,
    User as FirebaseUser
} from "firebase/auth";

import { AuthController, DataSource, StorageSource, User } from "../../types";

/**
 * @category Firebase
 */
export type FirebaseSignInProvider =
// | 'email'
    | "password"
    | "phone"
    | "anonymous"
    | "google.com"
    | "facebook.com"
    | "github.com"
    | "twitter.com"
    | "microsoft.com"
    | "apple.com";

/**
 * @category Firebase
 */
export type FirebaseSignInOption = {
    provider: FirebaseSignInProvider;
    scopes?: string[];
    customParameters?: Record<string, string>;
}

/**
 * @category Firebase
 */
export type FirebaseAuthController =
    AuthController<FirebaseUser> & {

    authLoading: boolean;

    confirmationResult?: ConfirmationResult;

    googleLogin: () => void;

    anonymousLogin: () => void;

    appleLogin: () => void;

    facebookLogin: () => void;

    githubLogin: () => void;

    microsoftLogin: () => void;

    twitterLogin: () => void;

    emailPasswordLogin: (email: string, password: string) => void;

    fetchSignInMethodsForEmail: (email: string) => Promise<string[]>;

    createUserWithEmailAndPassword: (email: string, password: string) => void;

    phoneLogin: (phone: string, applicationVerifier: ApplicationVerifier) => void;

    /**
     * Has the user skipped the login process
     */
    loginSkipped?: boolean;

    /**
     * Skip login
     */
    skipLogin?: () => void;

};

/**
 * Implement this function to allow access to specific users.
 * You might also want to load additional data for a user asynchronously
 * and store it using the `setExtra` method in the `authController`.
 * @category Firebase
 */
export type Authenticator<UserType extends User = User> = ({ user }: {
    /**
     * Logged in user or null
     */
    user: UserType | null;

    /**
     * AuthController
     */
    authController: AuthController<UserType>;

    /**
     * Connector to your database, e.g. your Firestore database
     */
    dataSource: DataSource;

    /**
     * Used storage implementation
     */
    storageSource: StorageSource;
}) => boolean | Promise<boolean>;
