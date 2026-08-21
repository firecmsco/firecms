/**
 * Backend (FireCMS Cloud) Firebase authentication.
 *
 * The FireCMS Cloud API uses two different tokens, exactly like the web app does
 * (see `packages/firecms_cloud/src/api/projects.ts`):
 *
 *   Authorization:           Bearer <Firebase ID token issued by `firecms-backend`>
 *   x-admin-authorization:   Bearer <Google OAuth access token with cloud-platform scope>
 *
 * The CLI only ever sends the second one, because every endpoint it uses is gated
 * by `googleCloudAuthentication()`. Everything else on the backend is gated by
 * `firebaseAuthorization()`, which runs `firebaseAuth.verifyIdToken()` and therefore
 * only accepts a real Firebase ID token whose `aud` is `firecms-backend`.
 *
 * The Google OAuth `id_token` stored by `firecms login` is NOT such a token — its
 * issuer is `accounts.google.com` and its audience is the Google OAuth client ID, so
 * the backend rejects it with a 401. This module performs the headless equivalent of
 * the web app's `signInWithPopup(auth, GoogleAuthProvider)`: it exchanges the Google
 * ID token for a `firecms-backend` Firebase ID token via the Identity Toolkit
 * `signInWithIdp` endpoint, using the backend's public web config.
 */
import axios from "axios";
import { getValidTokens } from "./auth.js";
import { resolveApiUrl } from "./config.js";

const IDENTITY_TOOLKIT_URL = "https://identitytoolkit.googleapis.com/v1";
const SECURE_TOKEN_URL = "https://securetoken.googleapis.com/v1/token";

/** Refresh the Firebase ID token this many ms before it actually expires. */
const EXPIRY_MARGIN_MS = 5 * 60 * 1000;

export interface BackendFirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
}

interface CachedBackendToken {
    idToken: string;
    refreshToken?: string;
    /** Epoch ms at which the token expires. */
    expiresAt: number;
}

let configCache: BackendFirebaseConfig | null = null;
let tokenCache: CachedBackendToken | null = null;
/** In-flight exchange, so concurrent tool calls don't each hit the network. */
let pendingExchange: Promise<CachedBackendToken> | null = null;

/**
 * Fetch the public Firebase web config of the FireCMS backend project.
 * This is the same unauthenticated endpoint the web app reads at boot.
 */
export async function getBackendFirebaseConfig(): Promise<BackendFirebaseConfig> {
    if (configCache) return configCache;
    const response = await axios.get<BackendFirebaseConfig>(`${resolveApiUrl()}/config`, {
        timeout: 30_000,
    });
    configCache = response.data;
    return configCache;
}

/**
 * Exchange the Google OAuth ID token for a Firebase ID token on `firecms-backend`.
 */
async function exchangeGoogleTokenForFirebaseToken(googleIdToken: string): Promise<CachedBackendToken> {
    const config = await getBackendFirebaseConfig();

    // `postBody` is form-encoded inside a JSON body — that is what the Identity
    // Toolkit expects for IdP sign-in.
    const postBody = new URLSearchParams({
        id_token: googleIdToken,
        providerId: "google.com",
    }).toString();

    try {
        const response = await axios.post(
            `${IDENTITY_TOOLKIT_URL}/accounts:signInWithIdp?key=${config.apiKey}`,
            {
                postBody,
                requestUri: "http://localhost",
                returnSecureToken: true,
            },
            { timeout: 30_000 }
        );

        const data = response.data;
        if (!data?.idToken) {
            throw new Error("Identity Toolkit did not return an ID token");
        }

        // `expiresIn` is a string of seconds.
        const expiresInMs = Number(data.expiresIn ?? 3600) * 1000;
        return {
            idToken: data.idToken,
            refreshToken: data.refreshToken,
            expiresAt: Date.now() + expiresInMs,
        };
    } catch (error: any) {
        const message = error.response?.data?.error?.message ?? error.message;
        throw new Error(
            `Could not authenticate against FireCMS Cloud (${message}). ` +
            `Your Google session may have expired — use the firecms_login tool to sign in again.`
        );
    }
}

/**
 * Get a valid Firebase ID token for the FireCMS backend project, exchanging and
 * caching as needed. Concurrent callers share a single in-flight exchange.
 */
export async function getBackendIdToken(): Promise<string> {
    if (tokenCache && Date.now() < tokenCache.expiresAt - EXPIRY_MARGIN_MS) {
        return tokenCache.idToken;
    }

    if (pendingExchange) {
        return (await pendingExchange).idToken;
    }

    pendingExchange = (async () => {
        // A cached refresh token is cheaper than a full re-exchange, but the Google
        // token is refreshed for free by the CLI helper anyway, so only use it when
        // the Google side cannot produce an ID token.
        const tokens = await getValidTokens();
        if (!tokens) {
            throw new Error("Not logged in. Use the firecms_login tool first.");
        }

        const googleIdToken = (tokens as any).id_token;
        if (googleIdToken) {
            return exchangeGoogleTokenForFirebaseToken(googleIdToken);
        }

        if (tokenCache?.refreshToken) {
            return refreshBackendToken(tokenCache.refreshToken);
        }

        throw new Error(
            "No Google ID token available. Use the firecms_login tool to sign in again."
        );
    })();

    try {
        tokenCache = await pendingExchange;
        return tokenCache.idToken;
    } finally {
        pendingExchange = null;
    }
}

/**
 * Refresh a `firecms-backend` Firebase ID token using its refresh token.
 */
async function refreshBackendToken(refreshToken: string): Promise<CachedBackendToken> {
    const config = await getBackendFirebaseConfig();
    const response = await axios.post(
        `${SECURE_TOKEN_URL}?key=${config.apiKey}`,
        new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 30_000 }
    );

    return {
        idToken: response.data.id_token,
        refreshToken: response.data.refresh_token,
        expiresAt: Date.now() + Number(response.data.expires_in ?? 3600) * 1000,
    };
}

/**
 * Drop any cached backend credentials. Called on logout.
 */
export function clearBackendTokenCache(): void {
    tokenCache = null;
    pendingExchange = null;
}
