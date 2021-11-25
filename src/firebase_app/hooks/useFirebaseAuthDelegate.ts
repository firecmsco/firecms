import { useEffect, useState } from "react";

import {
    Auth,
    FacebookAuthProvider,
    fetchSignInMethodsForEmail,
    getAuth,
    GoogleAuthProvider,
    OAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    User as FirebaseUser
} from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { AuthDelegate } from "../../models";
import {
    FirebaseAuthDelegate,
    FirebaseSignInOption,
    FirebaseSignInProvider
} from "../models/auth";
import firebase from "firebase/compat";
import {
    createUserWithEmailAndPassword,
    signInAnonymously
} from "@firebase/auth";
import GithubAuthProvider = firebase.auth.GithubAuthProvider;
import TwitterAuthProvider = firebase.auth.TwitterAuthProvider;

interface FirebaseAuthHandlerProps {
    firebaseApp?: FirebaseApp;
    signInOptions: Array<FirebaseSignInProvider | FirebaseSignInOption>;
}

/**
 * Use this hook to build an {@link AuthDelegate} based on Firebase Auth
 * @category Firebase
 */
export const useFirebaseAuthDelegate = (
    {
        firebaseApp,
        signInOptions
    }: FirebaseAuthHandlerProps): FirebaseAuthDelegate => {

    const [loggedUser, setLoggedUser] = useState<FirebaseUser | null | undefined>(undefined); // logged user, anonymous or logged out
    const [authProviderError, setAuthProviderError] = useState<any>();
    const [initialLoading, setInitialLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginSkipped, setLoginSkipped] = useState<boolean>(false);

    function skipLogin() {
        setLoginSkipped(true);
        setLoggedUser(null);
    }

    useEffect(() => {
        if (!firebaseApp) return;
        const auth = getAuth(firebaseApp);
        setLoggedUser(auth.currentUser)
        return onAuthStateChanged(
            auth,
            updateFirebaseUser,
            error => setAuthProviderError(error)
        );
    }, [firebaseApp]);

    const updateFirebaseUser = async (firebaseUser: FirebaseUser | null) => {
        setLoggedUser(firebaseUser);
        setInitialLoading(false);
        setAuthLoading(false);
    };

    function onSignOut() {
        const auth = getAuth(firebaseApp);
        signOut(auth)
            .then(_ => {
                setLoggedUser(null);
                setAuthProviderError(null);
            });
        setLoginSkipped(false);
    }

    const getProviderOptions = (providerId: FirebaseSignInProvider): FirebaseSignInOption | undefined => {
        return signInOptions.find((option) => {
            if (option === null) throw Error("useFirebaseAuthDelegate");
            if (typeof option === "object" && option.provider === providerId)
                return option as FirebaseSignInOption;
            return undefined;
        }) as FirebaseSignInOption | undefined;
    }

    const googleLogin = () => {
        const provider = new GoogleAuthProvider();
        const options = getProviderOptions("google.com");
        if (options?.scopes)
            options.scopes.forEach((scope) => provider.addScope(scope));
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = getAuth();
        signInWithPopup(auth, provider).catch(setAuthProviderError);
    }

    function doOauthLogin(auth: Auth, provider: OAuthProvider | FacebookAuthProvider | GithubAuthProvider | TwitterAuthProvider) {
        setAuthLoading(true);
        signInWithPopup(auth, provider)
            .catch(setAuthProviderError)
            .then(() => setAuthLoading(false));
    }

    const anonymousLogin = () => {
        const auth = getAuth();
        setAuthLoading(true);
        signInAnonymously(auth)
            .catch(setAuthProviderError)
            .then(() => setAuthLoading(false));
    }

    const appleLogin = () => {
        const provider = new OAuthProvider('apple.com');
        const options = getProviderOptions('apple.com');
        if (options?.scopes)
            options.scopes.forEach((scope) => provider.addScope(scope));
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = getAuth();
        doOauthLogin(auth, provider);
    }

    const facebookLogin = () => {
        const provider = new FacebookAuthProvider();
        const options = getProviderOptions('facebook.com');
        if (options?.scopes)
            options.scopes.forEach((scope) => provider.addScope(scope));
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = getAuth();
        doOauthLogin(auth, provider);
    }

    const githubLogin = () => {
        const provider = new GithubAuthProvider();
        const options = getProviderOptions('github.com');
        if (options?.scopes)
            options.scopes.forEach((scope) => provider.addScope(scope));
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = getAuth();
        doOauthLogin(auth, provider);
    }

    const microsoftLogin = () => {
        const provider = new OAuthProvider('microsoft.com');
        const options = getProviderOptions('microsoft.com');
        if (options?.scopes)
            options.scopes.forEach((scope) => provider.addScope(scope));
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = getAuth();
        doOauthLogin(auth, provider);
    }

    const twitterLogin = () => {
        const provider = new TwitterAuthProvider();
        const options = getProviderOptions('twitter.com');
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = getAuth();
        doOauthLogin(auth, provider);
    }

    const emailPasswordLogin = (email: string, password: string) => {
        const auth = getAuth();
        setAuthLoading(true);
        signInWithEmailAndPassword(auth, email, password)
            .catch(setAuthProviderError)
            .then(() => setAuthLoading(false));
    }

    const registerWithPasswordEmail = (email: string, password: string) => {
        const auth = getAuth();
        setAuthLoading(true);
        createUserWithEmailAndPassword(auth, email, password)
            .catch(setAuthProviderError)
            .then(() => setAuthLoading(false));
    }

    const getSignInMethodsForEmail = (email: string): Promise<string[]> => {
        const auth = getAuth();
        setAuthLoading(true);
        return fetchSignInMethodsForEmail(auth, email)
            .then((res) => {
                setAuthLoading(false);
                return res;
            });
    }

    return {
        user: loggedUser ?? null,
        authError: authProviderError,
        authLoading,
        initialLoading,
        signOut: onSignOut,
        loginSkipped,
        skipLogin,
        googleLogin,
        anonymousLogin,
        appleLogin,
        facebookLogin,
        githubLogin,
        microsoftLogin,
        twitterLogin,
        emailPasswordLogin,
        fetchSignInMethodsForEmail: getSignInMethodsForEmail,
        createUserWithEmailAndPassword: registerWithPasswordEmail
    };
};
