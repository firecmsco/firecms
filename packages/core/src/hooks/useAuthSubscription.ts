import { useState, useEffect } from "react";
import { AuthClient, AuthController, User } from "@rebasepro/types";

export function useAuthSubscription(authClient?: AuthClient): AuthController {
    
    // Check initial state
    const currentSession = authClient?.getSession();
    const [user, setUser] = useState<User | null>(currentSession?.user ?? null);
    
    const [initialLoading, setInitialLoading] = useState(!currentSession);
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<Error>();
    const [loginSkipped, setLoginSkipped] = useState(false);
    const [extra, setExtra] = useState<any>();

    useEffect(() => {
        if (!authClient) return;
        // If we don't have a session initially, try to get user which restores session if a persistent token exists
        if (!currentSession) {
            setInitialLoading(true);
            authClient.getUser()
                .then(user => {
                    if (user) {
                        setUser(user);
                    }
                })
                .catch(e => {
                    // Ignore, user just isn't logged in
                })
                .finally(() => {
                    setInitialLoading(false);
                });
        }
    }, [authClient, currentSession]);

    useEffect(() => {
        if (!authClient) return;
        const unsubscribe = authClient.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
                setUser(session?.user ?? null);
            } else if (event === "SIGNED_OUT") {
                setUser(null);
            }
        });
        return unsubscribe;
    }, [authClient]);

    return {
        user,
        initialLoading: authClient ? initialLoading : false,
        authLoading,
        signOut: async () => {
            if (!authClient) return;
            setAuthLoading(true);
            try {
                await authClient.signOut();
            } finally {
                setAuthLoading(false);
            }
        },
        authError,
        getAuthToken: async () => {
            if (!authClient) return "";
            const session = authClient.getSession();
            if (!session) return "";
            if (session.expiresAt < Date.now()) {
                try {
                    const refreshed = await authClient.refreshSession();
                    return refreshed.accessToken;
                } catch (e) {
                    return "";
                }
            }
            return session.accessToken;
        },
        loginSkipped,
        extra,
        setExtra
    } as AuthController;
}
