import { useCallback, useEffect, useRef, useState } from "react";
import equal from "react-fast-compare"

import {
    ApplicationVerifier,
    Auth,
    ConfirmationResult,
    createUserWithEmailAndPassword as createUserWithEmailAndPasswordFirebase,
    FacebookAuthProvider,
    fetchSignInMethodsForEmail as fetchSignInMethodsForEmailFirebase,
    getAuth,
    GithubAuthProvider,
    GoogleAuthProvider,
    OAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail as sendPasswordResetEmailFirebase,
    signInAnonymously,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signInWithPopup,
    signOut,
    TwitterAuthProvider,
    User as FirebaseUser
} from "@firebase/auth";
import { FirebaseApp } from "@firebase/app";
import { FirebaseAuthController, FirebaseSignInOption, FirebaseSignInProvider, FirebaseUserWrapper } from "../types";
import { Role, User } from "@firecms/core";

export interface FirebaseAuthControllerProps {
    loading?: boolean;
    firebaseApp?: FirebaseApp;
    signInOptions?: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    onSignOut?: () => void;
    defineRolesFor?: (user: User) => Promise<Role[] | undefined> | Role[] | undefined;
}

/**
 * Use this hook to build an {@link AuthController} based on Firebase Auth
 * @group Firebase
 */
export const useFirebaseAuthController = <UserType extends FirebaseUserWrapper = FirebaseUserWrapper, ExtraData = any>({
                                                                                                                           loading,
                                                                                                                           firebaseApp,
                                                                                                                           signInOptions,
                                                                                                                           onSignOut: onSignOutProp,
                                                                                                                           defineRolesFor
                                                                                                                       }: FirebaseAuthControllerProps): FirebaseAuthController<UserType, ExtraData> => {

    const [loggedUser, setLoggedUser] = useState<FirebaseUser | null | undefined>(undefined); // logged user, anonymous or logged out
    const [authError, setAuthError] = useState<any>();
    const [authProviderError, setAuthProviderError] = useState<any>();
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginSkipped, setLoginSkipped] = useState<boolean>(false);
    const [confirmationResult, setConfirmationResult] = useState<undefined | ConfirmationResult>();
    const [userRoles, setUserRoles] = useState<Role[] | undefined>();
    const [extra, setExtra] = useState<any>();

    const authRef = useRef(firebaseApp ? getAuth(firebaseApp) : null);

    const updateUser = useCallback(async (user: FirebaseUser | null, initialize?: boolean) => {
        if (loading) return;
        if (defineRolesFor && user) {
            setUserRoles(await defineRolesFor(user));
        }
        setLoggedUser(user);
        setAuthLoading(false);
        if (initialize) {
            setInitialLoading(false);
        }
    }, [loading]);

    const updateRoles = useCallback(async (user: User | null) => {
        if (defineRolesFor && user) {
            const userRoles = await defineRolesFor(user);
            if (!equal(userRoles, userRoles)) {
                setUserRoles(userRoles);
            }
        }
    }, [defineRolesFor, userRoles]);

    useEffect(() => {
        if (updateRoles && loggedUser) {
            updateRoles(loggedUser);
        }
    }, [updateRoles, loggedUser]);

    useEffect(() => {
        if (!firebaseApp) return;
        try {
            const auth = getAuth(firebaseApp);
            authRef.current = auth;
            setAuthError(undefined);
            updateUser(auth.currentUser, false)
            return onAuthStateChanged(
                auth,
                async (user) => {
                    console.debug("User state changed", user);
                    await updateUser(user, true);
                },
                error => setAuthProviderError(error)
            );
        } catch (e) {
            setAuthError(e);
            setInitialLoading(false);
            return () => {
            };
        }
    }, [firebaseApp, updateUser]);

    useEffect(() => {
        if (!loading && authRef.current) {
            updateUser(authRef.current.currentUser, false);
        }
    }, [loading, updateUser]);

    const getProviderOptions = useCallback((providerId: FirebaseSignInProvider): FirebaseSignInOption | undefined => {
        return signInOptions?.find((option) => {
            if (option === null) throw Error("useFirebaseAuthController");
            if (typeof option === "object" && option.provider === providerId)
                return option as FirebaseSignInOption;
            return undefined;
        }) as FirebaseSignInOption | undefined;
    }, []);

    const googleLogin = useCallback(() => {
        const provider = new GoogleAuthProvider();
        const options = getProviderOptions("google.com");
        if (options?.scopes)
            options.scopes.forEach((scope) => provider.addScope(scope));
        if (options?.customParameters) {
            provider.setCustomParameters(options.customParameters);
        } else {
            provider.setCustomParameters({
                prompt: "select_account"
            });
        }
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        signInWithPopup(auth, provider).catch(setAuthProviderError);
    }, [getProviderOptions]);

    const getAuthToken = useCallback(async (): Promise<string> => {
        if (!loggedUser)
            throw Error("No client user is logged in");
        if (!loggedUser.getIdToken) {
            throw Error("No getIdToken method available");
        }
        return loggedUser.getIdToken?.();
    }, [loggedUser]);

    const emailPasswordLogin = useCallback((email: string, password: string) => {
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        setAuthLoading(true);
        signInWithEmailAndPassword(auth, email, password)
            .catch(setAuthProviderError)
            .then(() => setAuthLoading(false));
    }, []);

    const createUserWithEmailAndPassword = useCallback((email: string, password: string) => {
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        setAuthLoading(true);
        createUserWithEmailAndPasswordFirebase(auth, email, password)
            .catch(setAuthProviderError)
            .then(() => setAuthLoading(false));
    }, []);

    const sendPasswordResetEmail = useCallback((email: string) => {
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        return sendPasswordResetEmailFirebase(auth, email)
    }, []);

    const fetchSignInMethodsForEmail = useCallback((email: string): Promise<string[]> => {
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        setAuthLoading(true);
        return fetchSignInMethodsForEmailFirebase(auth, email)
            .then((res) => {
                setAuthLoading(false);
                return res;
            });
    }, []);

    const onSignOut = useCallback(async () => {
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        await signOut(auth)
            .then(_ => {
                setLoggedUser(null);
                setUserRoles(undefined);
                setAuthProviderError(null);
                onSignOutProp?.();
            });
        setLoginSkipped(false);
    }, [onSignOutProp]);

    const doOauthLogin = useCallback((auth: Auth, provider: OAuthProvider | FacebookAuthProvider | GithubAuthProvider | TwitterAuthProvider) => {
        setAuthLoading(true);
        signInWithPopup(auth, provider)
            .catch(setAuthProviderError).then(() => setAuthLoading(false));
    }, []);

    const anonymousLogin = useCallback(() => {
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        setAuthLoading(true);
        signInAnonymously(auth)
            .catch(setAuthProviderError)
            .then(() => setAuthLoading(false));
    }, []);

    const phoneLogin = useCallback((phone: string, applicationVerifier: ApplicationVerifier) => {
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        setAuthLoading(true);
        return signInWithPhoneNumber(auth, phone, applicationVerifier)
            .catch(setAuthProviderError)
            .then((res) => {
                setAuthLoading(false);
                setConfirmationResult(res ?? undefined);
            });
    }, []);

    const appleLogin = useCallback(() => {
        const provider = new OAuthProvider("apple.com");
        const options = getProviderOptions("apple.com");
        if (options?.scopes)
            options.scopes.forEach((scope) => provider.addScope(scope));
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        doOauthLogin(auth, provider);
    }, [doOauthLogin, getProviderOptions]);

    const facebookLogin = useCallback(() => {
        const provider = new FacebookAuthProvider();
        const options = getProviderOptions("facebook.com");
        if (options?.scopes)
            options.scopes.forEach((scope) => provider.addScope(scope));
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        doOauthLogin(auth, provider);
    }, [doOauthLogin, getProviderOptions]);

    const githubLogin = useCallback(() => {
        const provider = new GithubAuthProvider();
        const options = getProviderOptions("github.com");
        if (options?.scopes)
            options.scopes.forEach((scope) => provider.addScope(scope));
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        doOauthLogin(auth, provider);
    }, [doOauthLogin, getProviderOptions]);

    const microsoftLogin = useCallback(() => {
        const provider = new OAuthProvider("microsoft.com");
        const options = getProviderOptions("microsoft.com");
        if (options?.scopes)
            options.scopes.forEach((scope) => provider.addScope(scope));
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        doOauthLogin(auth, provider);
    }, [doOauthLogin, getProviderOptions]);

    const twitterLogin = useCallback(() => {
        const provider = new TwitterAuthProvider();
        const options = getProviderOptions("twitter.com");
        if (options?.customParameters)
            provider.setCustomParameters(options.customParameters);
        const auth = authRef.current;
        if (!auth) throw Error("No auth");
        doOauthLogin(auth, provider);
    }, [doOauthLogin, getProviderOptions]);

    const skipLogin = useCallback(() => {
        setLoginSkipped(true);
        setLoggedUser(null);
        setUserRoles(undefined);
    }, []);

    const firebaseUserWrapper: FirebaseUserWrapper | null = loggedUser
        ? {
            ...loggedUser,
            roles: userRoles,
            firebaseUser: loggedUser
        }
        : null;

    return {
        user: firebaseUserWrapper as UserType,
        setUser: updateUser,
        userRoles,
        setUserRoles,
        authProviderError,
        authLoading,
        initialLoading: loading || initialLoading,
        signOut: onSignOut,
        getAuthToken,
        googleLogin,
        skipLogin,
        loginSkipped,
        emailPasswordLogin,
        createUserWithEmailAndPassword,
        sendPasswordResetEmail,
        fetchSignInMethodsForEmail,
        anonymousLogin,
        phoneLogin,
        appleLogin,
        facebookLogin,
        githubLogin,
        microsoftLogin,
        twitterLogin,
        confirmationResult,
        extra,
        setExtra
    };
};
