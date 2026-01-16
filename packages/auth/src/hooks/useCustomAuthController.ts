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
    // Track the last refresh time to throttle visibility change refreshes
    const lastRefreshTimeRef = useRef<number>(0);
    // Flag to prevent multiple simultaneous refresh calls
    const isRefreshingRef = useRef<boolean>(false);

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

        // Track when this refresh happened
        lastRefreshTimeRef.current = Date.now();

        // Refresh 5 minutes before expiry (assuming 1 hour access token)
        const refreshIn = 55 * 60 * 1000; // 55 minutes

        refreshTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await authApi.refreshAccessToken(tokens.refreshToken);
                tokensRef.current = response.tokens;
                lastRefreshTimeRef.current = Date.now();
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

    // Forgot password - request reset email
    const forgotPassword = useCallback(async (email: string) => {
        setAuthLoading(true);
        setAuthProviderError(null);

        try {
            await authApi.forgotPassword(email);
        } catch (error: unknown) {
            setAuthProviderError(error as Error);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    }, []);

    // Reset password using token
    const resetPassword = useCallback(async (token: string, password: string) => {
        setAuthLoading(true);
        setAuthProviderError(null);

        try {
            await authApi.resetPassword(token, password);
        } catch (error: unknown) {
            setAuthProviderError(error as Error);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    }, []);

    // Change password for authenticated user
    const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
        setAuthLoading(true);
        setAuthProviderError(null);

        try {
            if (!tokensRef.current) {
                throw new Error("User is not logged in");
            }
            await authApi.changePassword(tokensRef.current.accessToken, oldPassword, newPassword);
            // After password change, user needs to log in again (all sessions invalidated)
            tokensRef.current = null;
            clearAuthFromStorage();
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
            setUser(null);
        } catch (error: unknown) {
            setAuthProviderError(error as Error);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    }, []);

    // Restore auth state from localStorage on mount
    useEffect(() => {
        const restoreAuth = async () => {
            const stored = loadAuthFromStorage();
            if (stored) {
                // Prevent duplicate calls
                if (isRefreshingRef.current) {
                    return;
                }
                isRefreshingRef.current = true;

                // Set lastRefreshTime immediately to prevent visibility change handler from double-firing
                lastRefreshTimeRef.current = Date.now();

                try {
                    // Try to refresh the token to verify it's still valid
                    const response = await authApi.refreshAccessToken(stored.tokens.refreshToken);
                    tokensRef.current = response.tokens;
                    lastRefreshTimeRef.current = Date.now();

                    // Fetch fresh user data from the server
                    try {
                        const meResponse = await authApi.getCurrentUser(response.tokens.accessToken);
                        const freshUserInfo = meResponse.user;

                        // Update stored data with fresh user info and new tokens
                        saveAuthToStorage(response.tokens, freshUserInfo);

                        let convertedUser = convertToUser(freshUserInfo);

                        // Apply custom roles if defineRolesFor provided
                        if (defineRolesFor) {
                            const customRoles = await defineRolesFor(convertedUser);
                            if (customRoles) {
                                convertedUser = { ...convertedUser, roles: customRoles };
                            }
                        }

                        setUser(convertedUser);
                    } catch (meError) {
                        // If fetching user data fails, fall back to stored user data
                        console.warn("Failed to fetch fresh user data, using stored:", meError);
                        saveAuthToStorage(response.tokens, stored.user);
                        const convertedUser = convertToUser(stored.user);
                        setUser(convertedUser);
                    }

                    scheduleTokenRefresh(response.tokens);
                } catch (error) {
                    console.warn("Stored auth invalid, clearing:", error);
                    clearAuthFromStorage();
                } finally {
                    isRefreshingRef.current = false;
                }
            }
            setInitialLoading(false);
        };

        restoreAuth();
    }, [scheduleTokenRefresh, defineRolesFor]);

    // Handle visibility change - refresh token when user returns to tab
    // This is crucial for handling cases where user leaves for hours and comes back
    useEffect(() => {
        const handleVisibilityChange = async () => {
            // Skip during initial loading - restoreAuth handles the initial refresh
            if (initialLoading) {
                return;
            }

            // Skip if already refreshing
            if (isRefreshingRef.current) {
                return;
            }

            if (document.visibilityState === "visible" && tokensRef.current) {
                // Throttle: only refresh if at least 1 minute has passed since last refresh
                const timeSinceLastRefresh = Date.now() - lastRefreshTimeRef.current;
                const minRefreshInterval = 60 * 1000; // 1 minute

                if (timeSinceLastRefresh < minRefreshInterval) {
                    // Skip refresh - we recently refreshed
                    return;
                }

                isRefreshingRef.current = true;

                // User returned to the tab - proactively refresh the token
                try {
                    const response = await authApi.refreshAccessToken(tokensRef.current.refreshToken);
                    tokensRef.current = response.tokens;
                    lastRefreshTimeRef.current = Date.now();

                    // Update storage with new tokens
                    const storedData = loadAuthFromStorage();
                    if (storedData) {
                        saveAuthToStorage(response.tokens, storedData.user);
                    }

                    // Reschedule the refresh timer
                    scheduleTokenRefresh(response.tokens);
                } catch (error) {
                    console.error("Token refresh on visibility change failed:", error);
                    // Token is invalid or expired - clear auth and sign out
                    setUser(null);
                    tokensRef.current = null;
                    clearAuthFromStorage();
                    if (refreshTimeoutRef.current) {
                        clearTimeout(refreshTimeoutRef.current);
                    }
                    onSignOut?.();
                } finally {
                    isRefreshingRef.current = false;
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [initialLoading, scheduleTokenRefresh, onSignOut]);

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
        forgotPassword,
        resetPassword,
        changePassword,
        extra,
        setExtra
    };
}

