import { AuthResponse, RefreshResponse, UserInfo } from "./types";

/**
 * Default API URL - can be overridden in hook props
 */
let baseApiUrl = "";

/**
 * Configure the API base URL
 */
export function setApiUrl(url: string): void {
    baseApiUrl = url;
}

/**
 * Get the current API URL
 */
export function getApiUrl(): string {
    return baseApiUrl;
}

class AuthApiError extends Error {
    code: string;

    constructor(message: string, code: string) {
        super(message);
        this.code = code;
        this.name = "AuthApiError";
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
        throw new AuthApiError(
            data.error?.message || "Request failed",
            data.error?.code || "UNKNOWN_ERROR"
        );
    }

    return data as T;
}

/**
 * Register a new user with email/password
 */
export async function register(
    email: string,
    password: string,
    displayName?: string
): Promise<AuthResponse> {
    const response = await fetch(`${baseApiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName })
    });

    return handleResponse<AuthResponse>(response);
}

/**
 * Login with email/password
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${baseApiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    return handleResponse<AuthResponse>(response);
}

/**
 * Login with Google ID token
 */
export async function googleLogin(idToken: string): Promise<AuthResponse> {
    const response = await fetch(`${baseApiUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
    });

    return handleResponse<AuthResponse>(response);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
    const response = await fetch(`${baseApiUrl}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
    });

    return handleResponse<RefreshResponse>(response);
}

/**
 * Logout and invalidate refresh token
 */
export async function logout(refreshToken?: string): Promise<void> {
    await fetch(`${baseApiUrl}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
    });
}

/**
 * Get current user info
 */
export async function getCurrentUser(accessToken: string): Promise<{ user: UserInfo }> {
    const response = await fetch(`${baseApiUrl}/api/auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    return handleResponse<{ user: UserInfo }>(response);
}

export { AuthApiError };
