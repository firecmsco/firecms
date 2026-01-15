import { useCallback, useEffect, useState, useRef } from "react";
import { User } from "@firecms/core";
import * as authApi from "../api";
import {
    CustomAuthController,
    CustomAuthControllerProps,
    AuthTokens,
    UserInfo
} from "../types";

const STORAGE_KEY = "firecms_auth";

/**
 * Convert UserInfo from API to FireCMS User type
 */
function convertToUser(userInfo: UserInfo): User {
    return {
        uid: userInfo.uid,
        email: userInfo.email,
        displayName: userInfo.displayName || null,
        photoURL: userInfo.photoURL || null,
        providerId: "custom",
        isAnonymous: false,
        roles: userInfo.roles?.map((id: string) => ({ id, name: id })) || []
    };
}

/**
 * Save auth data to localStorage
 */
function saveAuthToStorage(tokens: AuthTokens, user: UserInfo): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tokens, user }));
    } catch (e) {
        console.warn("Failed to save auth to storage:", e);
    }
}

/**
 * Load auth data from localStorage
 */
function loadAuthFromStorage(): { tokens: AuthTokens; user: UserInfo } | null {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.warn("Failed to load auth from storage:", e);
    }
    return null;
}

/**
 * Clear auth data from localStorage
 */
function clearAuthFromStorage(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.warn("Failed to clear auth from storage:", e);
    }
}

/**
 * Custom auth controller hook for JWT-based authentication
 * with @firecms/backend
 * 
 * @param props Configuration options
 * @returns CustomAuthController instance
 */
export function useCustomAuthController(
    props: CustomAuthControllerProps = {}
): CustomAuthController {
    const { apiUrl, onSignOut, defineRolesFor } = props;

    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [authError, setAuthError] = useState<Error | null>(null);
    const [authProviderError, setAuthProviderError] = useState<Error | null>(null);
    const [loginSkipped, setLoginSkipped] = useState(false);
    const [extra, setExtra] = useState<any>(null);

    // Store tokens in ref for quick access, but also persist to localStorage
    const tokensRef = useRef<AuthTokens | null>(null);
    const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Configure API URL on mount
    useEffect(() => {
        if (apiUrl) {
            authApi.setApiUrl(apiUrl);
        }
    }, [apiUrl]);

    // Schedule token refresh before expiry
    const scheduleTokenRefresh = useCallback((tokens: AuthTokens) => {
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        // Refresh 5 minutes before expiry (assuming 1 hour access token)
        const refreshIn = 55 * 60 * 1000; // 55 minutes

        refreshTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await authApi.refreshAccessToken(tokens.refreshToken);
                tokensRef.current = response.tokens;
                // Update storage with new tokens
                const storedData = loadAuthFromStorage();
                if (storedData) {
                    saveAuthToStorage(response.tokens, storedData.user);
                }
                scheduleTokenRefresh(response.tokens);
            } catch (error) {
                console.error("Token refresh failed:", error);
                setUser(null);
                tokensRef.current = null;
                clearAuthFromStorage();
            }
        }, refreshIn);
    }, []);

    // Get auth token for API requests
    const getAuthToken = useCallback(async (): Promise<string> => {
        if (!tokensRef.current) {
            throw new Error("User is not logged in");
        }
        return tokensRef.current.accessToken;
    }, []);

    // Handle successful authentication
    const handleAuthSuccess = useCallback(async (userInfo: UserInfo, tokens: AuthTokens) => {
        tokensRef.current = tokens;
        let convertedUser = convertToUser(userInfo);

        // Apply custom roles if defineRolesFor provided
        if (defineRolesFor) {
            const customRoles = await defineRolesFor(convertedUser);
            if (customRoles) {
                convertedUser = { ...convertedUser, roles: customRoles };
            }
        }

        // Save to localStorage for persistence
        saveAuthToStorage(tokens, userInfo);

        setUser(convertedUser);
        setAuthError(null);
        setAuthProviderError(null);
        setLoginSkipped(false);
        scheduleTokenRefresh(tokens);
    }, [scheduleTokenRefresh, defineRolesFor]);

    // Email/password login
    const emailPasswordLogin = useCallback(async (email: string, password: string) => {
        setAuthLoading(true);
        setAuthProviderError(null);

        try {
            const response = await authApi.login(email, password);
            await handleAuthSuccess(response.user, response.tokens);
        } catch (error: unknown) {
            setAuthProviderError(error as Error);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    }, [handleAuthSuccess]);

    // Register new user
    const register = useCallback(async (email: string, password: string, displayName?: string) => {
        setAuthLoading(true);
        setAuthProviderError(null);

        try {
            const response = await authApi.register(email, password, displayName);
            await handleAuthSuccess(response.user, response.tokens);
        } catch (error: unknown) {
            setAuthProviderError(error as Error);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    }, [handleAuthSuccess]);

    // Google login with ID token
    const googleLogin = useCallback(async (idToken: string) => {
        setAuthLoading(true);
        setAuthProviderError(null);

        try {
            const response = await authApi.googleLogin(idToken);
            await handleAuthSuccess(response.user, response.tokens);
        } catch (error: unknown) {
            setAuthProviderError(error as Error);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    }, [handleAuthSuccess]);

    // Sign out
    const signOut = useCallback(async () => {
        try {
            if (tokensRef.current) {
                await authApi.logout(tokensRef.current.refreshToken);
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            tokensRef.current = null;
            clearAuthFromStorage();
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
            setUser(null);
            setLoginSkipped(false);
            onSignOut?.();
        }
    }, [onSignOut]);

    // Skip login
    const skipLogin = useCallback(() => {
        setLoginSkipped(true);
        setUser(null);
    }, []);

    // Restore auth state from localStorage on mount
    useEffect(() => {
        const restoreAuth = async () => {
            const stored = loadAuthFromStorage();
            if (stored) {
                try {
                    // Try to refresh the token to verify it's still valid
                    const response = await authApi.refreshAccessToken(stored.tokens.refreshToken);
                    tokensRef.current = response.tokens;

                    // Update stored tokens
                    saveAuthToStorage(response.tokens, stored.user);

                    const convertedUser = convertToUser(stored.user);
                    setUser(convertedUser);
                    scheduleTokenRefresh(response.tokens);
                } catch (error) {
                    console.warn("Stored auth invalid, clearing:", error);
                    clearAuthFromStorage();
                }
            }
            setInitialLoading(false);
        };

        restoreAuth();
    }, [scheduleTokenRefresh]);

    // Cleanup refresh timeout on unmount
    useEffect(() => {
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    return {
        user,
        authLoading,
        initialLoading,
        authError,
        authProviderError,
        loginSkipped,
        getAuthToken,
        signOut,
        emailPasswordLogin,
        register,
        googleLogin,
        skipLogin,
        extra,
        setExtra
    };
}
