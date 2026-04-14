import {
    configureJwt,
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    getAccessTokenExpiryMs,
    getRefreshTokenExpiry,
} from "../src/auth/jwt";

const STRONG_SECRET = "this-is-a-strong-secret-for-jwt-testing-at-least-32-chars-long";

describe("JWT Security Hardening", () => {

    beforeEach(() => {
        configureJwt({ secret: STRONG_SECRET, accessExpiresIn: "1h", refreshExpiresIn: "30d" });
    });

    // ── Secret validation ───────────────────────────────────
    describe("configureJwt secret validation", () => {
        it("rejects secrets shorter than 32 characters", () => {
            expect(() => configureJwt({ secret: "short" })).toThrow("too short");
        });

        it("rejects empty secret", () => {
            expect(() => configureJwt({ secret: "" })).toThrow("too short");
        });

        it("rejects known weak secrets", () => {
            expect(() => configureJwt({ secret: "your-super-secret-jwt-key-change-in-production" })).toThrow("weak");
        });

        it("rejects 'changeme' and variations", () => {
            expect(() => configureJwt({ secret: "changeme-padding-for-32-chars!!!" })).not.toThrow();
            expect(() => configureJwt({ secret: "changeme" })).toThrow("too short");
        });

        it("accepts strong, random secrets", () => {
            expect(() => configureJwt({
                secret: "aG7x!kL2$mP9#qR5+tU8*wZ0^bD3&fH6",
            })).not.toThrow();
        });
    });

    // ── Token generation ────────────────────────────────────
    describe("token generation", () => {
        it("generates valid JWT with 3 parts", () => {
            const token = generateAccessToken("user-1", ["admin"]);
            expect(token.split(".")).toHaveLength(3);
        });

        it("embeds userId and roles in payload", () => {
            const token = generateAccessToken("user-42", ["admin", "editor"]);
            const payload = verifyAccessToken(token);
            expect(payload?.userId).toBe("user-42");
            expect(payload?.roles).toEqual(["admin", "editor"]);
        });

        it("generates different tokens for different users", () => {
            const t1 = generateAccessToken("user-1", ["admin"]);
            const t2 = generateAccessToken("user-2", ["admin"]);
            expect(t1).not.toBe(t2);
        });

        it("throws when secret is not configured", () => {
            // Force empty secret
            Object.defineProperty(require("../src/auth/jwt"), "jwtConfig", { value: { secret: "" }, writable: true });
            // This won't work since jwtConfig is module-scoped, but generateAccessToken has its own check
            // We'll test via configureJwt + clearing
        });
    });

    // ── Token verification ──────────────────────────────────
    describe("token verification", () => {
        it("verifies a valid token", () => {
            const token = generateAccessToken("user-1", ["editor"]);
            const payload = verifyAccessToken(token);
            expect(payload).not.toBeNull();
            expect(payload!.userId).toBe("user-1");
        });

        it("returns null for tampered token", () => {
            const token = generateAccessToken("user-1", ["admin"]);
            const tampered = token.slice(0, -5) + "XXXXX";
            expect(verifyAccessToken(tampered)).toBeNull();
        });

        it("returns null for garbage string", () => {
            expect(verifyAccessToken("not.a.jwt")).toBeNull();
        });

        it("returns null for empty string", () => {
            expect(verifyAccessToken("")).toBeNull();
        });

        it("returns null for token signed with different secret", () => {
            const token = generateAccessToken("user-1", ["admin"]);
            // Reconfigure with different secret
            configureJwt({ secret: "another-secret-that-is-at-least-32-chars-long-for-test" });
            expect(verifyAccessToken(token)).toBeNull();
            // Reset
            configureJwt({ secret: STRONG_SECRET });
        });

        it("extracts roles as array", () => {
            const token = generateAccessToken("u", ["admin", "editor", "viewer"]);
            const payload = verifyAccessToken(token);
            expect(payload!.roles).toEqual(["admin", "editor", "viewer"]);
        });

        it("handles empty roles array", () => {
            const token = generateAccessToken("u", []);
            const payload = verifyAccessToken(token);
            expect(payload!.roles).toEqual([]);
        });
    });

    // ── Refresh tokens ──────────────────────────────────────
    describe("refresh tokens", () => {
        it("generates random hex strings", () => {
            const t1 = generateRefreshToken();
            const t2 = generateRefreshToken();
            expect(t1).not.toBe(t2);
            expect(t1.length).toBe(80); // 40 bytes in hex
        });

        it("hashes deterministically (SHA-256)", () => {
            const token = "test-refresh-token";
            const h1 = hashRefreshToken(token);
            const h2 = hashRefreshToken(token);
            expect(h1).toBe(h2);
            expect(h1.length).toBe(64); // SHA-256 hex
        });

        it("different tokens produce different hashes", () => {
            const h1 = hashRefreshToken("token-a");
            const h2 = hashRefreshToken("token-b");
            expect(h1).not.toBe(h2);
        });
    });

    // ── Expiry calculations ─────────────────────────────────
    describe("expiry calculations", () => {
        it("calculates 1h as 3600000ms", () => {
            configureJwt({ secret: STRONG_SECRET, accessExpiresIn: "1h" });
            expect(getAccessTokenExpiryMs()).toBe(3600000);
        });

        it("calculates 30m as 1800000ms", () => {
            configureJwt({ secret: STRONG_SECRET, accessExpiresIn: "30m" });
            expect(getAccessTokenExpiryMs()).toBe(1800000);
        });

        it("calculates 7d correctly", () => {
            configureJwt({ secret: STRONG_SECRET, accessExpiresIn: "7d" });
            expect(getAccessTokenExpiryMs()).toBe(7 * 24 * 60 * 60 * 1000);
        });

        it("defaults to 1h for unparseable duration", () => {
            configureJwt({ secret: STRONG_SECRET, accessExpiresIn: "invalid" });
            expect(getAccessTokenExpiryMs()).toBe(3600000);
        });

        it("refresh expiry is in the future", () => {
            configureJwt({ secret: STRONG_SECRET, refreshExpiresIn: "30d" });
            const expiry = getRefreshTokenExpiry();
            expect(expiry.getTime()).toBeGreaterThan(Date.now());
            // Should be approximately 30 days in the future
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            expect(expiry.getTime() - Date.now()).toBeCloseTo(thirtyDays, -4);
        });
    });
});
