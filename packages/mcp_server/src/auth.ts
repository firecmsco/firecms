/**
 * Authentication module for the FireCMS MCP server.
 *
 * Delegates to the CLI package (@firecms/cli) — same OAuth flow,
 * same token storage at ~/.firecms/tokens.json.
 */
import {
    login,
    logout,
    getTokens,
    refreshCredentials,
    parseJwt,
} from "@firecms/cli";

const ENV = "prod" as const;
const DEBUG = false;

export interface StoredTokens {
    access_token: string;
    refresh_token: string;
    id_token: string;
    expiry_date: number;
    scope: string;
    token_type: string;
    env?: string;
}

// ─── Token access ──────────────────────────────────────────

export async function getStoredTokens(): Promise<StoredTokens | null> {
    const tokens = await getTokens(ENV, DEBUG);
    return tokens as StoredTokens | null;
}

export async function getValidTokens(): Promise<StoredTokens | null> {
    const tokens = await getStoredTokens();
    if (!tokens) return null;

    const refreshed = await refreshCredentials(ENV, tokens);
    return refreshed as StoredTokens | null;
}

// ─── Convenience helpers ───────────────────────────────────

export function getCurrentUserEmail(): string | null {
    // getTokens is async, but for a quick sync check we read the file directly.
    // The CLI stores tokens at ~/.firecms/tokens.json.
    try {
        const fs = require("fs");
        const path = require("path");
        const os = require("os");
        const filePath = path.join(os.homedir(), ".firecms", "tokens.json");
        if (!fs.existsSync(filePath)) return null;
        const tokens = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (!tokens?.id_token) return null;
        const payload = parseJwt(tokens.id_token);
        return (payload as any)["email"] ?? null;
    } catch {
        return null;
    }
}

export function isLoggedIn(): boolean {
    return getCurrentUserEmail() !== null;
}

// ─── Login / Logout ────────────────────────────────────────

export async function loginFlow(): Promise<void> {
    await login(ENV, DEBUG);
}

export async function logoutFlow(): Promise<void> {
    await logout(ENV, DEBUG);
}
