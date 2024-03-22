import { ApplicationVerifier, ConfirmationResult, User as FirebaseUser } from "firebase/auth";

import { AuthController, DataSourceDelegate, Role, StorageSource, User } from "@firecms/core";

/**
 * @group Firebase
 */
export type FirebaseSignInProvider =
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
 * @group Firebase
 */
export type FirebaseSignInOption = {
    provider: FirebaseSignInProvider;
    scopes?: string[];
    customParameters?: Record<string, string>;
}

/**
 * @group Firebase
 */
export type FirebaseAuthController<ExtraData = any> = AuthController<FirebaseUser, ExtraData> & {

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
     * Skip login
     */
    skipLogin: () => void;

    setUser: (user: FirebaseUser | null) => void;

    setRoles: (roles: Role[]) => void;

};

/**
 * Implement this function to allow access to specific users.
 * @group Firebase
 */
export type Authenticator<UserType extends User = User, Controller extends AuthController<UserType> = AuthController<UserType>> = ({ user }: {
    /**
     * Logged-in user or null
     */
    user: UserType | null;

    /**
     * AuthController
     */
    authController: Controller;

    /**
     * Connector to your database, e.g. your Firestore database
     */
    dataSourceDelegate: DataSourceDelegate;

    /**
     * Used storage implementation
     */
    storageSource: StorageSource;
}) => boolean | Promise<boolean>;
