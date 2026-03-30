import { useCallback, useEffect, useState, useRef } from "react";
import { User } from "@rebasepro/core";
import * as authApi from "../api";
import { AuthConfigResponse } from "../api";
import {
    RebaseAuthController,
    RebaseAuthControllerProps,
    AuthTokens,
    UserInfo
} from "../types";

const STORAGE_KEY = "rebase_auth";

// Buffer time before expiry to trigger refresh (2 minutes)
const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000;

/**
 * Convert UserInfo from API to Rebase User type
 */
function convertToUser(userInfo: UserInfo): User {
    return {
        uid: userInfo.uid,
        email: userInfo.email,
        displayName: userInfo.displayName || null,
        photoURL: userInfo.photoURL || null,
        providerId: "custom",
        isAnonymous: false,
        roles: userInfo.roles || []
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
        const expiryDate = new Date(tokens.accessTokenExpiresAt);
        const expiryStr = Number.isFinite(tokens.accessTokenExpiresAt) ? expiryDate.toISOString() : "invalid";
    } catch (e) {
    }
}

/**
 * Load auth data from localStorage
 */
function loadAuthFromStorage(): StoredAuthData | null {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return parsed;
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
 * Check if token is expired or about to expire
 */
function isTokenExpiredOrNearExpiry(expiresAt: number, bufferMs: number = TOKEN_REFRESH_BUFFER_MS): boolean {
    return Date.now() + bufferMs >= expiresAt;
}

/**
 * Auth controller hook for JWT-based authentication
 * with @rebasepro/backend
 * 
 * @param props Configuration options
 * @returns RebaseAuthController instance
 */
export function useRebaseAuthController(
    props: RebaseAuthControllerProps = {}
): RebaseAuthController {
    const { apiUrl, onSignOut, defineRolesFor } = props;

    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [authError, setAuthError] = useState<Error | null>(null);
    const [authProviderError, setAuthProviderError] = useState<Error | null>(null);
    const [loginSkipped, setLoginSkipped] = useState(false);
    const [extra, setExtra] = useState<unknown>(null);
    const [authConfig, setAuthConfig] = useState<AuthConfigResponse | null>(null);

    // Store tokens in ref for quick access, but also persist to localStorage
    const tokensRef = useRef<AuthTokens | null>(null);
    const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Track if a refresh is currently in progress to avoid concurrent refreshes
    const refreshPromiseRef = useRef<Promise<AuthTokens | null> | null>(null);
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
        if (refreshPromiseRef.current) {
            // Wait for the current refresh to complete
            return refreshPromiseRef.current;
        }

        const executeRefresh = async (): Promise<AuthTokens | null> => {
            // Check if another tab has already refreshed the token
            const storedData = loadAuthFromStorage();
            if (storedData?.tokens?.accessTokenExpiresAt) {
                const storedTokens = storedData.tokens;
                // If stored token is newer and not expired
                if (!isTokenExpiredOrNearExpiry(storedTokens.accessTokenExpiresAt) && storedTokens.accessToken !== tokensRef.current?.accessToken) {
                    tokensRef.current = storedTokens;
                    return storedTokens;
                }
            }

            const currentTokens = tokensRef.current;
            if (!currentTokens?.refreshToken) {
                return null;
            }


            try {
                const response = await authApi.refreshAccessToken(currentTokens.refreshToken);
                const newTokens = response.tokens;

                // Update tokens immediately
                tokensRef.current = newTokens;

                // Persist to storage
                const latestStoredData = loadAuthFromStorage();
                if (latestStoredData) {
                    saveAuthToStorage(newTokens, latestStoredData.user);
                }

                const newExpiryStr = Number.isFinite(newTokens.accessTokenExpiresAt) ? new Date(newTokens.accessTokenExpiresAt).toISOString() : "invalid";
                return newTokens;
            } catch (error: unknown) {

                // If it's a network error (e.g., backend restarting), we throw so callers can retry
                // instead of immediately assuming the refresh token is invalid and signing out.
                if (error instanceof Error && (error as { code?: string }).code === "NETWORK_ERROR") {
                    throw error;
                }
                return null;
            } finally {
                refreshPromiseRef.current = null;
            }
        };

        refreshPromiseRef.current = executeRefresh();
        return refreshPromiseRef.current;
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
            refreshAccessToken().then(newTokens => {
                if (newTokens && isMountedRef.current) {
                    scheduleTokenRefresh(newTokens);
                } else if (!newTokens && isMountedRef.current) {
                    clearSessionAndSignOut();
                }
            });
            return;
        }


        refreshTimeoutRef.current = setTimeout(async () => {
            if (!isMountedRef.current) return;

            try {
                const newTokens = await refreshAccessToken();

                if (newTokens && isMountedRef.current) {
                    scheduleTokenRefresh(newTokens);
                } else if (!newTokens && isMountedRef.current) {
                    clearSessionAndSignOut();
                }
            } catch (error) {
                // Network error - try again shortly instead of logging out
                if (isMountedRef.current) {
                    refreshTimeoutRef.current = setTimeout(() => {
                        scheduleTokenRefresh(tokens);
                    }, 10000);
                }
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
            try {
                const newTokens = await refreshAccessToken();
                if (!newTokens) {
                    clearSessionAndSignOut();
                    throw new Error("Session expired. Please login again.");
                }
                return newTokens.accessToken;
            } catch (error: unknown) {
                // If the error was a network error during refresh, just re-throw it 
                // so the user isn't logged out locally and the network request fails naturally.
                if (error instanceof Error && (error as { code?: string }).code === "NETWORK_ERROR") {
                    throw error;
                }
                clearSessionAndSignOut();
                throw error;
            }
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
                convertedUser = { ...convertedUser, roles: customRoles.map(r => r.id) };
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

    // Update user profile
    const updateProfile = useCallback(async (displayName?: string, photoURL?: string) => {
        setAuthLoading(true);
        setAuthProviderError(null);

        try {
            if (!tokensRef.current) {
                throw new Error("User is not logged in");
            }
            const response = await authApi.updateProfile(tokensRef.current.accessToken, displayName, photoURL);

            // Update local user state
            let convertedUser = convertToUser(response.user);
            if (defineRolesFor) {
                const customRoles = await defineRolesFor(convertedUser);
                if (customRoles) {
                    convertedUser = { ...convertedUser, roles: customRoles.map(r => r.id) };
                }
            }

            // Update storage
            const storedData = loadAuthFromStorage();
            if (storedData) {
                saveAuthToStorage(storedData.tokens, response.user);
            }

            setUser(convertedUser);
            return convertedUser;
        } catch (error: unknown) {
            setAuthProviderError(error as Error);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    }, [defineRolesFor]);

    // Fetch active sessions
    const fetchSessions = useCallback(async () => {
        try {
            if (!tokensRef.current) {
                throw new Error("User is not logged in");
            }
            const response = await authApi.fetchSessions(tokensRef.current.accessToken, tokensRef.current.refreshToken);
            return response.sessions;
        } catch (error: unknown) {
            setAuthProviderError(error as Error);
            throw error;
        }
    }, []);

    // Revoke a session
    const revokeSession = useCallback(async (sessionId: string) => {
        try {
            if (!tokensRef.current) {
                throw new Error("User is not logged in");
            }
            await authApi.revokeSession(tokensRef.current.accessToken, sessionId);
            // If the revoked session is the current one, the next API request will fail with 401
            // and trigger an auto-logout. Otherwise, it just removes it from the DB.
        } catch (error: unknown) {
            setAuthProviderError(error as Error);
            throw error;
        }
    }, []);

    // Restore auth state from localStorage on mount
    useEffect(() => {
        isMountedRef.current = true;

        const restoreAuth = async () => {

            // Fetch auth config (needsSetup, registrationEnabled, etc.)
            try {
                const config = await authApi.fetchAuthConfig();
                if (isMountedRef.current) {
                    setAuthConfig(config);
                }
            } catch (e) {
            }

            const stored = loadAuthFromStorage();

            if (!stored) {
                setInitialLoading(false);
                return;
            }

            if (!stored.tokens?.refreshToken) {
                clearAuthFromStorage();
                setInitialLoading(false);
                return;
            }


            // Validate accessTokenExpiresAt is a valid number
            const expiresAt = stored.tokens.accessTokenExpiresAt;
            if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) {
                clearAuthFromStorage();
                setInitialLoading(false);
                return;
            }


            // Check if access token is still valid
            if (!isTokenExpiredOrNearExpiry(stored.tokens.accessTokenExpiresAt)) {
                // Token is still valid - use it directly
                tokensRef.current = stored.tokens;

                let userToSet = convertToUser(stored.user);
                if (defineRolesFor) {
                    const customRoles = await defineRolesFor(userToSet);
                    if (customRoles) {
                        userToSet = { ...userToSet, roles: customRoles.map(r => r.id) };
                    }
                }

                setUser(userToSet);
                scheduleTokenRefresh(stored.tokens);
                setInitialLoading(false);
                return;
            }

            // Token is expired or near expiry - refresh it
            tokensRef.current = stored.tokens; // Set so refreshAccessToken can use it

            try {
                const newTokens = await refreshAccessToken();

                if (!newTokens) {
                    clearAuthFromStorage();
                    tokensRef.current = null;
                    setInitialLoading(false);
                    return;
                }

                if (!isMountedRef.current) return;

                // Fetch fresh user data from the server
                let userToSet: User;
                try {
                    const meResponse = await authApi.getCurrentUser(newTokens.accessToken);

                    if (!isMountedRef.current) return;

                    const freshUserInfo = meResponse.user;

                    // Update stored data with fresh user info
                    saveAuthToStorage(newTokens, freshUserInfo);

                    userToSet = convertToUser(freshUserInfo);

                    if (defineRolesFor) {
                        const customRoles = await defineRolesFor(userToSet);
                        if (!isMountedRef.current) return;
                        if (customRoles) {
                            userToSet = { ...userToSet, roles: customRoles.map(r => r.id) };
                        }
                    }
                } catch (meError: unknown) {
                    if (!isMountedRef.current) return;
                    userToSet = convertToUser(stored.user);
                }

                if (!isMountedRef.current) return;

                setUser(userToSet);
                scheduleTokenRefresh(newTokens);
            } catch (error: unknown) {
                if (!isMountedRef.current) return;

                // Do not clear the session entirely if it's just a temporary network outage
                if (!(error instanceof Error && (error as { code?: string }).code === "NETWORK_ERROR")) {
                    clearAuthFromStorage();
                    tokensRef.current = null;
                }
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
                    try {
                        const newTokens = await refreshAccessToken();

                        if (newTokens && isMountedRef.current) {
                            scheduleTokenRefresh(newTokens);
                        } else if (!newTokens && isMountedRef.current) {
                            clearSessionAndSignOut();
                        }
                    } catch (error) {
                    }
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [initialLoading, refreshAccessToken, scheduleTokenRefresh, clearSessionAndSignOut]);


    // Get currently configured API URL
    const getApiUrl = useCallback(() => {
        return authApi.getApiUrl();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    // Revoke all sessions
    const revokeAllSessions = useCallback(async () => {
        try {
            if (!tokensRef.current) {
                throw new Error("User is not logged in");
            }
            await authApi.revokeAllSessions(tokensRef.current.accessToken);
            clearSessionAndSignOut();
        } catch (error: unknown) {
            setAuthProviderError(error as Error);
            throw error;
        }
    }, [clearSessionAndSignOut]);

    return {
        user,
        authLoading,
        initialLoading,
        authError,
        authProviderError,
        loginSkipped,
        needsSetup: authConfig?.needsSetup ?? false,
        registrationEnabled: authConfig?.registrationEnabled ?? false,
        getAuthToken,
        getApiUrl,
        signOut,
        emailPasswordLogin,
        register,
        googleLogin,
        skipLogin,
        forgotPassword,
        resetPassword,
        changePassword,
        updateProfile,
        fetchSessions,
        revokeSession,
        revokeAllSessions,
        extra,
        setExtra
    };
}
