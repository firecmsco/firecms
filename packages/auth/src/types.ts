import { AuthController, Role, User } from "@rebasepro/core";

/**
 * Auth controller that extends the base AuthController
 * with additional methods for email/password and Google login
 */
export type RebaseAuthController = AuthController & {
    /** Login with Google ID token from frontend Google Sign-In */
    googleLogin: (idToken: string) => Promise<void>;
    /** Login with email and password */
    emailPasswordLogin: (email: string, password: string) => Promise<void>;
    /** Register a new user */
    register: (email: string, password: string, displayName?: string) => Promise<void>;
    /** Skip login (for anonymous access if enabled) */
    skipLogin: () => void;
    /** Whether login was skipped */
    loginSkipped: boolean;
    /** Error from auth provider (login failure details) */
    authProviderError: Error | null;
    /** True when there are no users in the system — first-user bootstrap mode */
    needsSetup: boolean;
    /** Whether new user registration is enabled (always true during setup) */
    registrationEnabled: boolean;
    /** Request password reset email */
    forgotPassword: (email: string) => Promise<void>;
    /** Reset password using token from email */
    resetPassword: (token: string, password: string) => Promise<void>;
    /** Change password for authenticated user */
    changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    /** Update user profile */
    updateProfile: (displayName?: string, photoURL?: string) => Promise<User>;
    /** Fetch active sessions */
    fetchSessions: () => Promise<any[]>;
    /** Revoke a session */
    revokeSession: (sessionId: string) => Promise<void>;
    /** Revoke all active sessions */
    revokeAllSessions: () => Promise<void>;
    /** Get internal API URL */
    getApiUrl?: () => string | undefined;
}

/**
 * Props for useRebaseAuthController hook
 */
export interface RebaseAuthControllerProps {
    /** Base URL of the backend API */
    apiUrl?: string;
    /** Google OAuth client ID (optional, enables Google login) */
    googleClientId?: string;
    /** Callback when user signs out */
    onSignOut?: () => void;
    /** Define roles for a user after login */
    defineRolesFor?: (user: User) => Promise<Role[] | undefined> | Role[] | undefined;
}

/**
 * Auth tokens returned from the backend
 */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    /** Unix timestamp (ms) when the access token expires */
    accessTokenExpiresAt: number;
}

/**
 * User info from the backend
 */
export interface UserInfo {
    uid: string;
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
    emailVerified?: boolean;
    roles?: string[];
}

/**
 * Auth response from backend login/register endpoints
 */
export interface AuthResponse {
    user: UserInfo;
    tokens: AuthTokens;
}

/**
 * Response from token refresh endpoint
 */
export interface RefreshResponse {
    tokens: AuthTokens;
}

