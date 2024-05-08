import { ApplicationVerifier, ConfirmationResult, User as FirebaseUser } from "@firebase/auth";

import { AuthController, Role, User } from "@firecms/core";

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

export type FirebaseUserWrapper = User & FirebaseUser & {
    firebaseUser: FirebaseUser | null;
}

/**
 * @group Firebase
 */
export type FirebaseAuthController<ExtraData = any> = AuthController<FirebaseUserWrapper, ExtraData> & {

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
