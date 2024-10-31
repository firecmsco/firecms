import { useCallback, useEffect, useState } from "react";
import { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";
import { AuthController, Role, User } from "@firecms/core";

export type SupabaseSignInProvider = "google" | "facebook" | "github" | "gitlab" | "bitbucket";

export type SupabaseAuthController<ExtraData = any> = AuthController & {
    setUser: (user: any | null) => Promise<void>;
    setRoles: (roles: Role[] | undefined) => void;
    authProviderError: any;
    googleLogin: () => Promise<void>;
    skipLogin: () => void;
    loginSkipped: boolean;
    emailPasswordLogin: (email: string, password: string) => Promise<void>;
    createUserWithEmailAndPassword: (email: string, password: string) => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<void>;
    extra?: ExtraData;
    setExtra: (extra: ExtraData) => void;
}

export interface SupabaseAuthControllerProps {
    loading?: boolean;
    onSignOut?: () => void;
    defineRolesFor?: (user: User) => Promise<Role[] | undefined> | Role[] | undefined;
    supabase: SupabaseClient
}

/**
 * Use this hook to build an {@link AuthController} based on Supabase Auth
 * @group Supabase
 */
export const useSupabaseAuthController = ({
                                              loading,
                                              onSignOut: onSignOutProp,
                                              defineRolesFor,
                                              supabase
                                          }: SupabaseAuthControllerProps): SupabaseAuthController => {

    const [loggedUser, setLoggedUser] = useState<User | null | undefined>(undefined);
    const [authError, setAuthError] = useState<any>();
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [loginSkipped, setLoginSkipped] = useState<boolean>(false);
    const [roles, setRoles] = useState<Role[] | undefined>();
    const [extra, setExtra] = useState<any>();

    const updateUser = useCallback(async (supabaseUser: SupabaseUser | null, initialize?: boolean) => {
        if (loading) return;
        const user = convertSupabaseUserToUser(supabaseUser);
        if (defineRolesFor && user) {
            const userRoles = await defineRolesFor(user);
            setRoles(userRoles);
            user.roles = userRoles;
        }
        setLoggedUser(user);
        setAuthLoading(false);
        if (initialize) {
            setInitialLoading(false);
        }
    }, [loading, defineRolesFor]);

    // Listen for authentication state changes.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("onAuthStateChange", event, session);
                if (session?.user) {
                    await updateUser(session.user, true);
                } else {
                    setLoggedUser(null);
                    setRoles(undefined);
                }
            }
        );
        // Cleanup subscription on unmount
        return () => subscription?.unsubscribe();
    }, [supabase, updateUser]);

    useEffect(() => {
        (async () => {
            const {
                data: { user },
                error
            } = await supabase.auth.getUser();
            if (error) {
                setAuthError(error);
                setInitialLoading(false);
            } else {
                await updateUser(user, true);
            }
        })();
    }, [supabase, updateUser]);

    const emailPasswordLogin = useCallback(async (email: string, password: string) => {
        setAuthLoading(true);
        const {
            error,
            data: { user }
        } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            setAuthError(error);
        } else {
            await updateUser(user, true);
        }
        setAuthLoading(false);
    }, [supabase, updateUser]);

    const createUserWithEmailAndPassword = useCallback(async (email: string, password: string) => {
        setAuthLoading(true);
        const {
            data,
            error
        } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) {
            setAuthError(error);
        } else {
            await updateUser(data.user, true); // Adjusted to use data.user
        }
        setAuthLoading(false);
    }, [supabase, updateUser]);

    const sendPasswordResetEmail = useCallback(async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            setAuthError(error);
        }
    }, [supabase]);

    const onSignOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            setAuthError(error);
        } else {
            setLoggedUser(null);
            setRoles(undefined);
            onSignOutProp && onSignOutProp();
        }
        setLoginSkipped(false);
    }, [supabase, onSignOutProp]);

    const googleLogin = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) {
            setAuthError(error);
        }
    }, [supabase]);

    const skipLogin = useCallback(() => {
        setLoginSkipped(true);
        setLoggedUser(null);
        setRoles(undefined);
    }, []);

    const supabaseUserWrapper = loggedUser ? {
        ...loggedUser,
        supabaseUser: loggedUser
    } : null;

    const getAuthToken = useCallback(async (): Promise<string> => {
        const session = await supabase.auth.getSession();
        if (!session.data.session) {
            throw new Error("User is not logged in");
        }
        return session.data.session.access_token
    }, [supabase]);

    return {
        user: supabaseUserWrapper,
        userRoles: roles,
        setUser: updateUser,
        setRoles,
        getAuthToken,
        authLoading,
        initialLoading: loading || initialLoading,
        authProviderError: authError,
        signOut: onSignOut,
        googleLogin,
        skipLogin,
        loginSkipped,
        emailPasswordLogin,
        createUserWithEmailAndPassword,
        sendPasswordResetEmail,
        extra,
        setExtra
    };
};

const convertSupabaseUserToUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;

    return {
        uid: supabaseUser.id,
        displayName: supabaseUser.user_metadata?.full_name || null,
        email: supabaseUser.email ?? null,
        photoURL: supabaseUser.user_metadata?.avatar_url || null,
        providerId: "unknown", // Supabase does not expose provider info directly
        isAnonymous: !supabaseUser.email,
        roles: []
    };
};
