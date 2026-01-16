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

// Buffer time before expiry to trigger refresh (2 minutes)
const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000;

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
 * Storage data structure
 */
interface StoredAuthData {
    tokens: AuthTokens;
    user: UserInfo;
}

/**
 * Save auth data to localStorage
 */
function saveAuthToStorage(tokens: AuthTokens, user: UserInfo): void {
    try {
        const data: StoredAuthData = { tokens, user };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log("[AUTH] Saved auth to storage for user:", user.email, "expires:", new Date(tokens.accessTokenExpiresAt).toISOString());
    } catch (e) {
        console.warn("[AUTH] Failed to save auth to storage:", e);
    }
}

/**
 * Load auth data from localStorage
 */
function loadAuthFromStorage(): StoredAuthData | null {
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
        console.log("[AUTH] Cleared auth from storage");
    } catch (e) {
        console.warn("Failed to clear auth from storage:", e);
    }
}

/**
 * Check if token is expired or about to expire
 */
function isTokenExpiredOrNearExpiry(expiresAt: number, bufferMs: number = TOKEN_REFRESH_BUFFER_MS): boolean {
    return Date.now() + bufferMs >= expiresAt;
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
    // Track if a refresh is currently in progress to avoid concurrent refreshes
    const isRefreshingRef = useRef(false);
    // Track if component is mounted
    const isMountedRef = useRef(true);

    // Configure API URL on mount
    useEffect(() => {
        if (apiUrl) {
            authApi.setApiUrl(apiUrl);
        }
    }, [apiUrl]);

    // Clear session and sign out
    const clearSessionAndSignOut = useCallback(() => {
        console.log("[AUTH] Clearing session and signing out");
        tokensRef.current = null;
        clearAuthFromStorage();
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }
        setUser(null);
        setLoginSkipped(false);
        onSignOut?.();
    }, [onSignOut]);

    /**
     * Refresh the access token using the stored refresh token.
     * Returns the new tokens or null if refresh failed.
     */
    const refreshAccessToken = useCallback(async (): Promise<AuthTokens | null> => {
        // Prevent concurrent refreshes
        if (isRefreshingRef.current) {
            console.log("[AUTH] Refresh already in progress, waiting...");
            // Wait for the current refresh to complete
            await new Promise(resolve => setTimeout(resolve, 100));
            return tokensRef.current;
        }

        const currentTokens = tokensRef.current;
        if (!currentTokens?.refreshToken) {
            console.log("[AUTH] No refresh token available");
            return null;
        }

        isRefreshingRef.current = true;
        console.log("[AUTH] Refreshing access token...");

        try {
            const response = await authApi.refreshAccessToken(currentTokens.refreshToken);
            const newTokens = response.tokens;

            // Update tokens immediately
            tokensRef.current = newTokens;

            // Persist to storage
            const storedData = loadAuthFromStorage();
            if (storedData) {
                saveAuthToStorage(newTokens, storedData.user);
            }

            console.log("[AUTH] Token refresh successful, new expiry:", new Date(newTokens.accessTokenExpiresAt).toISOString());
            isRefreshingRef.current = false;
            return newTokens;
        } catch (error: any) {
            console.error("[AUTH] Token refresh failed:", error?.message);
            isRefreshingRef.current = false;
            return null;
        }
    }, []);

    // Schedule token refresh before expiry
    const scheduleTokenRefresh = useCallback((tokens: AuthTokens) => {
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        // Calculate when to refresh (2 minutes before expiry)
        const expiresAt = tokens.accessTokenExpiresAt;
        const refreshAt = expiresAt - TOKEN_REFRESH_BUFFER_MS;
        const timeUntilRefresh = refreshAt - Date.now();

        if (timeUntilRefresh <= 0) {
            // Token already expired or about to expire - refresh now
            console.log("[AUTH] Token expired or near expiry, refreshing immediately");
            refreshAccessToken().then(newTokens => {
                if (newTokens && isMountedRef.current) {
                    scheduleTokenRefresh(newTokens);
                } else if (!newTokens && isMountedRef.current) {
                    clearSessionAndSignOut();
                }
            });
            return;
        }

        console.log(`[AUTH] Scheduling token refresh in ${Math.round(timeUntilRefresh / 1000)}s`);

        refreshTimeoutRef.current = setTimeout(async () => {
            if (!isMountedRef.current) return;

            console.log("[AUTH] Scheduled token refresh triggered");
            const newTokens = await refreshAccessToken();

            if (newTokens && isMountedRef.current) {
                scheduleTokenRefresh(newTokens);
            } else if (!newTokens && isMountedRef.current) {
                console.log("[AUTH] Scheduled refresh failed, signing out");
                clearSessionAndSignOut();
            }
        }, timeUntilRefresh);
    }, [refreshAccessToken, clearSessionAndSignOut]);

    // Get auth token for API requests (with automatic refresh if needed)
    const getAuthToken = useCallback(async (): Promise<string> => {
        // If still loading, throw - the UI should show a spinner
        if (initialLoading) {
            throw new Error("Auth is still loading");
        }

        const currentTokens = tokensRef.current;
        if (!currentTokens) {
            throw new Error("User is not logged in");
        }

        // Check if token is expired or about to expire
        if (isTokenExpiredOrNearExpiry(currentTokens.accessTokenExpiresAt)) {
            console.log("[AUTH] Token expired or near expiry, refreshing before returning...");
            const newTokens = await refreshAccessToken();
            if (!newTokens) {
                clearSessionAndSignOut();
                throw new Error("Session expired. Please login again.");
            }
            return newTokens.accessToken;
        }

        return currentTokens.accessToken;
    }, [initialLoading, refreshAccessToken, clearSessionAndSignOut]);

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
            clearSessionAndSignOut();
        }
    }, [clearSessionAndSignOut]);

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
            clearSessionAndSignOut();
        } catch (error: unknown) {
            setAuthProviderError(error as Error);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    }, [clearSessionAndSignOut]);

    // Restore auth state from localStorage on mount
    useEffect(() => {
        isMountedRef.current = true;

        const restoreAuth = async () => {
            console.log("[AUTH] Attempting to restore auth from storage...");
            const stored = loadAuthFromStorage();

            if (!stored) {
                console.log("[AUTH] No stored auth found in localStorage");
                setInitialLoading(false);
                return;
            }

            if (!stored.tokens?.refreshToken) {
                console.log("[AUTH] Stored auth has no refresh token, clearing");
                clearAuthFromStorage();
                setInitialLoading(false);
                return;
            }

            console.log("[AUTH] Found stored auth for user:", stored.user?.email);
            console.log("[AUTH] Token expires at:", new Date(stored.tokens.accessTokenExpiresAt).toISOString());

            // Check if access token is still valid
            if (!isTokenExpiredOrNearExpiry(stored.tokens.accessTokenExpiresAt)) {
                // Token is still valid - use it directly
                console.log("[AUTH] Access token still valid, using stored tokens");
                tokensRef.current = stored.tokens;

                let userToSet = convertToUser(stored.user);
                if (defineRolesFor) {
                    const customRoles = await defineRolesFor(userToSet);
                    if (customRoles) {
                        userToSet = { ...userToSet, roles: customRoles };
                    }
                }

                setUser(userToSet);
                scheduleTokenRefresh(stored.tokens);
                setInitialLoading(false);
                return;
            }

            // Token is expired or near expiry - refresh it
            console.log("[AUTH] Access token expired or near expiry, refreshing...");
            tokensRef.current = stored.tokens; // Set so refreshAccessToken can use it

            try {
                const newTokens = await refreshAccessToken();

                if (!newTokens) {
                    console.log("[AUTH] Token refresh failed during restore, clearing auth");
                    clearAuthFromStorage();
                    tokensRef.current = null;
                    setInitialLoading(false);
                    return;
                }

                if (!isMountedRef.current) return;

                // Fetch fresh user data from the server
                let userToSet: User;
                try {
                    console.log("[AUTH] Fetching fresh user data...");
                    const meResponse = await authApi.getCurrentUser(newTokens.accessToken);

                    if (!isMountedRef.current) return;

                    const freshUserInfo = meResponse.user;
                    console.log("[AUTH] Got fresh user data:", freshUserInfo.email);

                    // Update stored data with fresh user info
                    saveAuthToStorage(newTokens, freshUserInfo);

                    userToSet = convertToUser(freshUserInfo);

                    if (defineRolesFor) {
                        const customRoles = await defineRolesFor(userToSet);
                        if (!isMountedRef.current) return;
                        if (customRoles) {
                            userToSet = { ...userToSet, roles: customRoles };
                        }
                    }
                } catch (meError: any) {
                    if (!isMountedRef.current) return;
                    console.warn("[AUTH] Failed to fetch fresh user data:", meError?.message);
                    userToSet = convertToUser(stored.user);
                }

                if (!isMountedRef.current) return;

                console.log("[AUTH] Auth restoration complete, user:", userToSet.email);
                setUser(userToSet);
                scheduleTokenRefresh(newTokens);
            } catch (error: any) {
                if (!isMountedRef.current) return;
                console.error("[AUTH] Token refresh failed during restore:", error?.message);
                clearAuthFromStorage();
                tokensRef.current = null;
            } finally {
                if (isMountedRef.current) {
                    setInitialLoading(false);
                }
            }
        };

        restoreAuth();

        return () => {
            isMountedRef.current = false;
        };
    }, [scheduleTokenRefresh, defineRolesFor, refreshAccessToken]);

    // Handle visibility change - refresh token when user returns to tab
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (initialLoading) return;

            if (document.visibilityState === "visible" && tokensRef.current) {
                // Check if token needs refreshing
                if (isTokenExpiredOrNearExpiry(tokensRef.current.accessTokenExpiresAt)) {
                    console.log("[AUTH] Visibility change - token needs refresh");
                    const newTokens = await refreshAccessToken();

                    if (newTokens && isMountedRef.current) {
                        scheduleTokenRefresh(newTokens);
                    } else if (!newTokens && isMountedRef.current) {
                        clearSessionAndSignOut();
                    }
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [initialLoading, refreshAccessToken, scheduleTokenRefresh, clearSessionAndSignOut]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
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

