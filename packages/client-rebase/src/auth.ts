import { RebaseApiError, Transport } from "./transport";

export interface RebaseUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified?: boolean;
    roles?: string[];
    providerId: string;
    isAnonymous: boolean;
}

export interface RebaseTokens {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
}

export interface RebaseSession {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    user: RebaseUser;
}

export type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

export interface AuthConfig {
    needsSetup: boolean;
    registrationEnabled: boolean;
    googleEnabled: boolean;
    emailServiceEnabled: boolean;
}

export interface AuthStorage {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
}

export function createMemoryStorage(): AuthStorage {
    const store: Record<string, string> = {};
    return {
        getItem(key) { return store[key] ?? null; },
        setItem(key, value) { store[key] = value; },
        removeItem(key) { delete store[key]; },
    };
}

function detectStorage(): AuthStorage {
    try {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem("__rebase_test__", "1");
            localStorage.removeItem("__rebase_test__");
            return localStorage;
        }
    } catch (e) { /* ignore */ }
    return createMemoryStorage();
}

export interface CreateAuthOptions {
    storage?: AuthStorage;
    authPath?: string;
    autoRefresh?: boolean;
    persistSession?: boolean;
}

export function createAuth(transport: Transport, options?: CreateAuthOptions) {
    const opts = options || {};
    const storage = opts.storage || detectStorage();
    const authPath = opts.authPath || "/auth";
    const autoRefresh = opts.autoRefresh !== false;
    const persistSession = opts.persistSession !== false;

    const STORAGE_KEY = "rebase_auth";
    const REFRESH_BUFFER_MS = 120000;

    let currentSession: RebaseSession | null = null;
    const listeners = new Set<(event: AuthChangeEvent, session: RebaseSession | null) => void>();
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

    function authUrl(endpoint: string) {
        return transport.baseUrl + transport.apiPath + authPath + endpoint;
    }

    function getFetch() {
        return transport.fetchFn || globalThis.fetch;
    }

    function throwApiError(status: number, body: { error?: { message?: string; code?: string; details?: unknown }; message?: string; code?: string; details?: unknown } | undefined, statusText: string): never {
        throw new RebaseApiError(
            status,
            body?.error?.message || body?.message || statusText,
            body?.error?.code || body?.code,
            body?.error?.details || body?.details,
        );
    }

    function emit(event: AuthChangeEvent, session: RebaseSession | null) {
        for (const fn of listeners) {
            try { fn(event, session); } catch (e) { /* ignore */ }
        }
    }

    function saveSession(session: RebaseSession) {
        if (!persistSession) return;
        try {
            storage.setItem(STORAGE_KEY, JSON.stringify(session));
        } catch (e) { /* ignore */ }
    }

    function clearStoredSession() {
        try {
            storage.removeItem(STORAGE_KEY);
        } catch (e) { /* ignore */ }
    }

    function loadStoredSession(): RebaseSession | null {
        try {
            const raw = storage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw) as RebaseSession;
        } catch (e) { /* ignore */ }
        return null;
    }

    function scheduleRefresh(expiresAt: number) {
        if (refreshTimeout) clearTimeout(refreshTimeout);
        if (!autoRefresh) return;

        const delay = (expiresAt - REFRESH_BUFFER_MS) - Date.now();

        if (delay <= 0) {
            refreshSession().catch(() => signOut());
            return;
        }

        refreshTimeout = setTimeout(async () => {
            try {
                await refreshSession();
            } catch (e) {
                signOut();
            }
        }, delay);
    }

    function handleAuthResponse(data: { tokens: RebaseTokens, user: RebaseUser }, event?: AuthChangeEvent): RebaseSession {
        const session: RebaseSession = {
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            expiresAt: data.tokens.accessTokenExpiresAt,
            user: data.user,
        };
        currentSession = session;
        saveSession(session);
        transport.setToken(session.accessToken);
        scheduleRefresh(session.expiresAt);
        emit(event || "SIGNED_IN", session);
        return session;
    }

    async function signInWithEmail(email: string, password: string) {
        const fetchFn = getFetch();
        const res = await fetchFn(authUrl("/login"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throwApiError(res.status, body, res.statusText);
        const session = handleAuthResponse(body, "SIGNED_IN");
        return { user: session.user, accessToken: session.accessToken, refreshToken: session.refreshToken };
    }

    async function signUp(email: string, password: string, displayName?: string) {
        const fetchFn = getFetch();
        const payload: Record<string, string> = { email, password };
        if (displayName !== undefined) payload.displayName = displayName;
        const res = await fetchFn(authUrl("/register"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throwApiError(res.status, body, res.statusText);
        const session = handleAuthResponse(body, "SIGNED_IN");
        return { user: session.user, accessToken: session.accessToken, refreshToken: session.refreshToken };
    }

    async function signInWithGoogle(idToken: string) {
        const fetchFn = getFetch();
        const res = await fetchFn(authUrl("/google"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throwApiError(res.status, body, res.statusText);
        const session = handleAuthResponse(body, "SIGNED_IN");
        return { user: session.user, accessToken: session.accessToken, refreshToken: session.refreshToken };
    }

    async function signOut() {
        const fetchFn = getFetch();
        try {
            if (currentSession?.refreshToken) {
                await fetchFn(authUrl("/logout"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken: currentSession.refreshToken }),
                });
            }
        } catch (e) { /* ignore */ }
        currentSession = null;
        clearStoredSession();
        if (refreshTimeout) {
            clearTimeout(refreshTimeout);
            refreshTimeout = null;
        }
        transport.setToken(null);
        emit("SIGNED_OUT", null);
    }

    async function refreshSession() {
        if (!currentSession?.refreshToken) {
            throw new Error("No active session to refresh");
        }
        const fetchFn = getFetch();
        const res = await fetchFn(authUrl("/refresh"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: currentSession.refreshToken }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throwApiError(res.status, body, res.statusText);
        const session: RebaseSession = {
            accessToken: body.tokens.accessToken,
            refreshToken: body.tokens.refreshToken,
            expiresAt: body.tokens.accessTokenExpiresAt,
            user: currentSession.user,
        };
        currentSession = session;
        saveSession(session);
        transport.setToken(session.accessToken);
        scheduleRefresh(session.expiresAt);
        emit("TOKEN_REFRESHED", session);
        return session;
    }

    async function getUser() {
        const data = await transport.request<{ user: RebaseUser }>(authPath + "/me", { method: "GET" });
        return data.user;
    }

    async function updateUser(updates: { displayName?: string, photoURL?: string }) {
        const data = await transport.request<{ user: RebaseUser }>(authPath + "/me", {
            method: "PATCH",
            body: JSON.stringify(updates),
        });
        if (currentSession) {
            currentSession = { ...currentSession, user: data.user };
            saveSession(currentSession);
            emit("USER_UPDATED", currentSession);
        }
        return data.user;
    }

    async function resetPasswordForEmail(email: string) {
        const fetchFn = getFetch();
        const res = await fetchFn(authUrl("/forgot-password"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throwApiError(res.status, body, res.statusText);
        return body as { success: boolean; message: string; };
    }

    async function resetPassword(token: string, password: string) {
        const fetchFn = getFetch();
        const res = await fetchFn(authUrl("/reset-password"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throwApiError(res.status, body, res.statusText);
        return body as { success: boolean; message: string; };
    }

    async function changePassword(oldPassword: string, newPassword: string) {
        return transport.request<{ success: boolean; message: string; }>(authPath + "/change-password", {
            method: "POST",
            body: JSON.stringify({ oldPassword, newPassword }),
        });
    }

    async function sendVerificationEmail() {
        return transport.request<{ success: boolean; message: string; }>(authPath + "/send-verification", {
            method: "POST",
        });
    }

    async function verifyEmail(token: string) {
        const fetchFn = getFetch();
        const res = await fetchFn(authUrl("/verify-email?token=" + encodeURIComponent(token)), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throwApiError(res.status, body, res.statusText);
        return body as { success: boolean; message: string; };
    }

    async function getSessions() {
        const data = await transport.request<{ sessions: Record<string, unknown>[] }>(authPath + "/sessions", { method: "GET" });
        return data.sessions;
    }

    async function revokeSession(sessionId: string) {
        return transport.request<{ success: boolean }>(authPath + "/sessions/" + encodeURIComponent(sessionId), {
            method: "DELETE",
        });
    }

    async function revokeAllSessions() {
        const result = await transport.request<{ success: boolean }>(authPath + "/sessions", {
            method: "DELETE",
        });
        currentSession = null;
        clearStoredSession();
        if (refreshTimeout) {
            clearTimeout(refreshTimeout);
            refreshTimeout = null;
        }
        transport.setToken(null);
        emit("SIGNED_OUT", null);
        return result;
    }

    async function getAuthConfig() {
        const fetchFn = getFetch();
        const res = await fetchFn(authUrl("/config"), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throwApiError(res.status, body, res.statusText);
        return body as AuthConfig;
    }

    function getSession() {
        return currentSession;
    }

    function onAuthStateChange(callback: (event: AuthChangeEvent, session: RebaseSession | null) => void) {
        listeners.add(callback);
        return () => listeners.delete(callback);
    }

    if (persistSession) {
        const stored = loadStoredSession();
        if (stored && stored.accessToken && stored.refreshToken) {
            if (stored.expiresAt > Date.now()) {
                currentSession = stored;
                transport.setToken(stored.accessToken);
                scheduleRefresh(stored.expiresAt);
            } else if (stored.refreshToken) {
                currentSession = stored;
                refreshSession().catch(() => {
                    currentSession = null;
                    clearStoredSession();
                    transport.setToken(null);
                });
            }
        }
    }

    return {
        signInWithEmail,
        signUp,
        signInWithGoogle,
        signOut,
        refreshSession,
        getUser,
        updateUser,
        resetPasswordForEmail,
        resetPassword,
        changePassword,
        sendVerificationEmail,
        verifyEmail,
        getSessions,
        revokeSession,
        revokeAllSessions,
        getAuthConfig,
        getSession,
        onAuthStateChange,
    };
}
