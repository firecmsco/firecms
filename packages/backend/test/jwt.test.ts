import {
    configureJwt,
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    getRefreshTokenExpiry,
    getAccessTokenExpiryMs,
    getAccessTokenExpiry
} from "../src/auth/jwt";

describe("JWT Utilities", () => {
    const testSecret = "test-secret-key-for-jwt-testing-12345";

    beforeEach(() => {
        // Reset JWT config before each test
        configureJwt({
            secret: testSecret,
            accessExpiresIn: "1h",
            refreshExpiresIn: "30d"
        });
    });

    describe("configureJwt", () => {
        it("should configure JWT with provided secret", () => {
            configureJwt({ secret: "new-secret" });
            // Configuration is internal, but we can verify it works by generating a token
            expect(() => generateAccessToken("user-1", ["admin"])).not.toThrow();
        });

        it("should allow partial configuration updates", () => {
            configureJwt({ secret: testSecret, accessExpiresIn: "2h" });
            // Token generation should still work
            const token = generateAccessToken("user-1", ["admin"]);
            expect(token).toBeTruthy();
        });
    });

    describe("generateAccessToken", () => {
        it("should generate a valid JWT token", () => {
            const token = generateAccessToken("user-123", ["admin", "editor"]);
            expect(token).toBeTruthy();
            expect(typeof token).toBe("string");
            // JWT tokens have 3 parts separated by dots
            expect(token.split(".")).toHaveLength(3);
        });

        it("should throw error if secret is not configured", () => {
            configureJwt({ secret: "" });
            expect(() => generateAccessToken("user-1", ["admin"]))
                .toThrow("JWT secret not configured");
        });

        it("should include userId and roles in payload", () => {
            const token = generateAccessToken("user-456", ["viewer"]);
            const payload = verifyAccessToken(token);
            expect(payload).toEqual({
                userId: "user-456",
                roles: ["viewer"]
            });
        });

        it("should handle empty roles array", () => {
            const token = generateAccessToken("user-789", []);
            const payload = verifyAccessToken(token);
            expect(payload?.roles).toEqual([]);
        });
    });

    describe("verifyAccessToken", () => {
        it("should verify and decode a valid token", () => {
            const token = generateAccessToken("user-123", ["admin"]);
            const payload = verifyAccessToken(token);
            expect(payload).toEqual({
                userId: "user-123",
                roles: ["admin"]
            });
        });

        it("should return null for invalid token", () => {
            const payload = verifyAccessToken("invalid-token");
            expect(payload).toBeNull();
        });

        it("should return null for token signed with different secret", () => {
            const token = generateAccessToken("user-123", ["admin"]);
            configureJwt({ secret: "different-secret" });
            const payload = verifyAccessToken(token);
            expect(payload).toBeNull();
        });

        it("should return null for malformed JWT", () => {
            const payload = verifyAccessToken("not.a.valid.jwt.token");
            expect(payload).toBeNull();
        });

        it("should throw error if secret is not configured", () => {
            const token = generateAccessToken("user-1", ["admin"]);
            configureJwt({ secret: "" });
            expect(() => verifyAccessToken(token))
                .toThrow("JWT secret not configured");
        });
    });

    describe("generateRefreshToken", () => {
        it("should generate a random token", () => {
            const token = generateRefreshToken();
            expect(token).toBeTruthy();
            expect(typeof token).toBe("string");
            // 40 random bytes = 80 hex characters
            expect(token).toHaveLength(80);
        });

        it("should generate unique tokens each time", () => {
            const token1 = generateRefreshToken();
            const token2 = generateRefreshToken();
            expect(token1).not.toBe(token2);
        });
    });

    describe("hashRefreshToken", () => {
        it("should hash a token consistently", () => {
            const token = "test-refresh-token";
            const hash1 = hashRefreshToken(token);
            const hash2 = hashRefreshToken(token);
            expect(hash1).toBe(hash2);
        });

        it("should produce different hashes for different tokens", () => {
            const hash1 = hashRefreshToken("token1");
            const hash2 = hashRefreshToken("token2");
            expect(hash1).not.toBe(hash2);
        });

        it("should return a SHA256 hash (64 hex characters)", () => {
            const hash = hashRefreshToken("any-token");
            expect(hash).toHaveLength(64);
            expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
        });
    });

    describe("getAccessTokenExpiryMs", () => {
        it("should return correct milliseconds for hours", () => {
            configureJwt({ secret: testSecret, accessExpiresIn: "2h" });
            expect(getAccessTokenExpiryMs()).toBe(2 * 60 * 60 * 1000);
        });

        it("should return correct milliseconds for days", () => {
            configureJwt({ secret: testSecret, accessExpiresIn: "7d" });
            expect(getAccessTokenExpiryMs()).toBe(7 * 24 * 60 * 60 * 1000);
        });

        it("should return correct milliseconds for minutes", () => {
            configureJwt({ secret: testSecret, accessExpiresIn: "30m" });
            expect(getAccessTokenExpiryMs()).toBe(30 * 60 * 1000);
        });

        it("should return correct milliseconds for seconds", () => {
            configureJwt({ secret: testSecret, accessExpiresIn: "300s" });
            expect(getAccessTokenExpiryMs()).toBe(300 * 1000);
        });

        it("should default to 1 hour for invalid format", () => {
            configureJwt({ secret: testSecret, accessExpiresIn: "invalid" });
            expect(getAccessTokenExpiryMs()).toBe(60 * 60 * 1000);
        });
    });

    describe("getAccessTokenExpiry", () => {
        it("should return a timestamp in the future", () => {
            const now = Date.now();
            const expiry = getAccessTokenExpiry();
            expect(expiry).toBeGreaterThan(now);
        });

        it("should match the configured expiry duration", () => {
            configureJwt({ secret: testSecret, accessExpiresIn: "1h" });
            const now = Date.now();
            const expiry = getAccessTokenExpiry();
            // Should be approximately 1 hour from now (with small tolerance)
            const expectedExpiry = now + (60 * 60 * 1000);
            expect(expiry).toBeGreaterThanOrEqual(expectedExpiry - 1000);
            expect(expiry).toBeLessThanOrEqual(expectedExpiry + 1000);
        });
    });

    describe("getRefreshTokenExpiry", () => {
        it("should return a Date in the future", () => {
            const expiry = getRefreshTokenExpiry();
            expect(expiry).toBeInstanceOf(Date);
            expect(expiry.getTime()).toBeGreaterThan(Date.now());
        });

        it("should return approximately 30 days from now by default", () => {
            const expiry = getRefreshTokenExpiry();
            const expected = Date.now() + (30 * 24 * 60 * 60 * 1000);
            // Allow 1 second tolerance
            expect(expiry.getTime()).toBeGreaterThanOrEqual(expected - 1000);
            expect(expiry.getTime()).toBeLessThanOrEqual(expected + 1000);
        });

        it("should respect custom refresh expiry configuration", () => {
            configureJwt({ secret: testSecret, refreshExpiresIn: "7d" });
            const expiry = getRefreshTokenExpiry();
            const expected = Date.now() + (7 * 24 * 60 * 60 * 1000);
            expect(expiry.getTime()).toBeGreaterThanOrEqual(expected - 1000);
            expect(expiry.getTime()).toBeLessThanOrEqual(expected + 1000);
        });

        it("should handle hour-based refresh expiry", () => {
            configureJwt({ secret: testSecret, refreshExpiresIn: "24h" });
            const expiry = getRefreshTokenExpiry();
            const expected = Date.now() + (24 * 60 * 60 * 1000);
            expect(expiry.getTime()).toBeGreaterThanOrEqual(expected - 1000);
            expect(expiry.getTime()).toBeLessThanOrEqual(expected + 1000);
        });
    });
});
