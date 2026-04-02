/**
 * Authentication helpers for the Rebase CLI.
 *
 * Token storage lives at ~/.rebase/tokens.json (prod) or
 * ~/.rebase/staging.tokens.json (dev).
 */
import fs from "fs";
import path from "path";
import * as os from "os";

const TOKEN_DIR = path.join(os.homedir(), ".rebase");

function tokenPath(env: "prod" | "dev"): string {
    return path.join(TOKEN_DIR, (env === "dev" ? "staging." : "") + "tokens.json");
}

// ─── Token persistence ────────────────────────────────────

function saveTokens(tokens: object, env: "prod" | "dev") {
    if (!fs.existsSync(TOKEN_DIR)) {
        fs.mkdirSync(TOKEN_DIR, { recursive: true });
    }
    fs.writeFileSync(tokenPath(env), JSON.stringify(tokens));
}

// ─── Public API ───────────────────────────────────────────

export async function getTokens(env: "prod" | "dev", _debug?: boolean): Promise<object | null> {
    const fp = tokenPath(env);
    if (!fs.existsSync(fp)) return null;
    try {
        const data = fs.readFileSync(fp, "utf-8");
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export function parseJwt(token: string): object {
    if (!token) throw new Error("No JWT token");
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const buffer = Buffer.from(base64, "base64");
    return JSON.parse(buffer.toString());
}

export async function refreshCredentials(
    env: "dev" | "prod",
    credentials?: object | null,
    _onErr?: (e: unknown) => void,
): Promise<object | null> {
    if (!credentials) return null;
    // If the token hasn't expired, just return it.
    const expiryDate = new Date((credentials as Record<string, unknown>)["expiry_date"] as number);
    if (expiryDate.getTime() > Date.now()) {
        return credentials;
    }
    // Without a server endpoint we can't actually refresh –
    // the caller should handle the null return by re-authenticating.
    return null;
}

export async function login(env: "prod" | "dev", _debug?: boolean): Promise<void> {
    console.log(
        "Interactive login is not yet implemented in @rebasepro/cli.\n" +
        "Please authenticate via the Rebase dashboard and copy your tokens to " +
        tokenPath(env),
    );
}

export async function logout(env: "prod" | "dev", _debug?: boolean): Promise<void> {
    const fp = tokenPath(env);
    if (fs.existsSync(fp)) {
        fs.unlinkSync(fp);
        console.log("You have been logged out.");
    } else {
        console.log("You are not logged in.");
    }
}
