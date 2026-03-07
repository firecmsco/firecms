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
    let data: any;
    try {
        data = await response.json();
    } catch (parseError) {
        // Response wasn't JSON - could be network error or server issue
        throw new AuthApiError(
            `Server returned non-JSON response (status: ${response.status})`,
            "PARSE_ERROR"
        );
    }

    if (!response.ok) {
        throw new AuthApiError(
            data.error?.message || "Request failed",
            data.error?.code || "UNKNOWN_ERROR"
        );
    }

    return data as T;
}

/**
 * Wrapper for fetch that catches generic network failures (like server down)
 * and translates them to an AuthApiError.
 */
async function fetchWithHandling(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
        return await fetch(input, init);
    } catch (error: any) {
        if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
            throw new AuthApiError(
                "Failed to connect to the backend server. The backend might be down or failed to initialize (e.g., database connection timeout).",
                "NETWORK_ERROR"
            );
        }
        throw new AuthApiError("Network error: " + error.message, "NETWORK_ERROR");
    }
}

/**
 * Register a new user with email/password
 */
export async function register(
    email: string,
    password: string,
    displayName?: string
): Promise<AuthResponse> {
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/register`, {
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
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/login`, {
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
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/google`, {
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
    console.log("[AUTH-API] Calling refresh endpoint...");

    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
    });

    console.log("[AUTH-API] Refresh response status:", response.status);
    return handleResponse<RefreshResponse>(response);
}

/**
 * Logout and invalidate refresh token
 */
export async function logout(refreshToken?: string): Promise<void> {
    await fetchWithHandling(`${baseApiUrl}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
    });
}

/**
 * Get current user info
 */
export async function getCurrentUser(accessToken: string): Promise<{ user: UserInfo }> {
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    return handleResponse<{ user: UserInfo }>(response);
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Reset password using token from email
 */
export async function resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
    });

    return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
    accessToken: string,
    oldPassword: string,
    newPassword: string
): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/change-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
    });

    return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(accessToken: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/send-verification`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Verify email address using token
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Update current user profile
 */
export async function updateProfile(
    accessToken: string,
    displayName?: string,
    photoURL?: string
): Promise<{ user: UserInfo }> {
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/me`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ displayName, photoURL })
    });

    return handleResponse<{ user: UserInfo }>(response);
}

/**
 * Fetch active sessions for current user
 */
export async function fetchSessions(accessToken: string, currentRefreshToken?: string): Promise<{ sessions: any[] }> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
    };
    if (currentRefreshToken) {
        headers["X-Refresh-Token"] = currentRefreshToken;
    }

    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/sessions`, {
        method: "GET",
        headers
    });

    return handleResponse<{ sessions: any[] }>(response);
}

/**
 * Revoke a specific session
 */
export async function revokeSession(accessToken: string, sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Revoke all sessions for current user
 */
export async function revokeAllSessions(accessToken: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithHandling(`${baseApiUrl}/api/auth/sessions`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    });

    return handleResponse<{ success: boolean; message: string }>(response);
}

export { AuthApiError };

