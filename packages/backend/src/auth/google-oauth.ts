import { OAuth2Client } from "google-auth-library";

export interface GoogleUserInfo {
    googleId: string;
    email: string;
    displayName: string | null;
    photoUrl: string | null;
    emailVerified: boolean;
}

let googleClient: OAuth2Client | null = null;
let configuredClientId: string | null = null;

/**
 * Configure Google OAuth - call this during initialization
 */
export function configureGoogleOAuth(clientId: string): void {
    configuredClientId = clientId;
    googleClient = new OAuth2Client(clientId);
}

/**
 * Verify a Google ID token and extract user information
 * @param idToken The ID token from Google Sign-In on the frontend
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo | null> {
    if (!googleClient || !configuredClientId) {
        throw new Error("Google OAuth not configured. Call configureGoogleOAuth() first.");
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: configuredClientId
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return null;
        }

        return {
            googleId: payload.sub,
            email: payload.email || "",
            displayName: payload.name || null,
            photoUrl: payload.picture || null,
            emailVerified: payload.email_verified || false
        };
    } catch (error) {
        console.error("Failed to verify Google ID token:", error);
        return null;
    }
}

/**
 * Check if Google OAuth is configured
 */
export function isGoogleOAuthConfigured(): boolean {
    return googleClient !== null && configuredClientId !== null;
}
