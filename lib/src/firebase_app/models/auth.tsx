import { ApplicationVerifier, ConfirmationResult, User as FirebaseUser } from "firebase/auth";

import { AuthDelegate } from "../../models";

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
export type FirebaseAuthDelegate =
    AuthDelegate<FirebaseUser> & {

    authLoading: boolean;

    confirmationResult: void | ConfirmationResult,

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
