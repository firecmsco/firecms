/**
 * Auth Routes — Integration Tests
 *
 * Tests the full Hono request → route handler → JSON response cycle.
 * Services are mocked so we can exercise the HTTP layer in isolation while
 * still verifying business logic (first-user bootstrap, token rotation, etc.).
 */

import { Hono } from "hono";
import type { HonoEnv } from "../src/api/types";
import { errorHandler } from "../src/api/errors";
import { createAuthRoutes, AuthModuleConfig } from "../src/auth/routes";
import type { AuthRepository } from "../src/auth/interfaces";
import { configureJwt, generateAccessToken, hashRefreshToken } from "../src/auth/jwt";

// ── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("../src/auth/password");
jest.mock("../src/auth/google-oauth");

// Bypass rate limiters — they share state across tests and cause 429s
jest.mock("../src/auth/rate-limiter", () => {
    const passthrough = async (_c: unknown, next: () => Promise<void>) => next();
    return {
        createRateLimiter: () => passthrough,
        defaultAuthLimiter: passthrough,
        strictAuthLimiter: passthrough,
    };
});

import { hashPassword, verifyPassword, validatePasswordStrength } from "../src/auth/password";
import { verifyGoogleIdToken, isGoogleOAuthConfigured } from "../src/auth/google-oauth";

// ── Helpers ─────────────────────────────────────────────────────────────────

const TEST_SECRET = "integration-test-secret-key-that-is-definitely-32-chars-long!!";

function mockUser(overrides: Partial<{ id: string; email: string; passwordHash: string | null; displayName: string | null; photoUrl: string | null; provider: string; emailVerified: boolean; emailVerificationToken: string | null }> = {}) {
    return {
        id: overrides.id ?? "user-1",
        email: overrides.email ?? "test@example.com",
        passwordHash: "passwordHash" in overrides ? overrides.passwordHash : "salt:hash",
        displayName: overrides.displayName ?? "Test User",
        photoUrl: overrides.photoUrl ?? null,
        provider: overrides.provider ?? "email",
        googleId: null,
        emailVerified: overrides.emailVerified ?? false,
        emailVerificationToken: overrides.emailVerificationToken ?? null,
        emailVerificationSentAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

function mockRole(id: string, isAdmin = false) {
    return { id, name: id.charAt(0).toUpperCase() + id.slice(1), isAdmin, defaultPermissions: null, collectionPermissions: null, config: null };
}

let mockAuthRepo: jest.Mocked<AuthRepository>;
let mockEmailService: { send: jest.Mock; isConfigured: jest.Mock };

function createApp(opts: { allowRegistration?: boolean; withEmail?: boolean; defaultRole?: string } = {}) {
    // Re-create mocked service instances each time
                
    // Wire constructor mocks to return our instances
                
    // Default returns for mocked services
    
    mockAuthRepo = {
        getUserByEmail: jest.fn().mockResolvedValue(null),
        getUserByGoogleId: jest.fn().mockResolvedValue(null),
        getUserById: jest.fn().mockResolvedValue(null),
        createUser: jest.fn().mockImplementation((data) =>
            Promise.resolve(mockUser({ email: data.email, displayName: data.displayName, passwordHash: data.passwordHash }))
        ),
        listUsers: jest.fn().mockResolvedValue([]),
        getUserRoles: jest.fn().mockResolvedValue([mockRole("editor")]),
        getUserRoleIds: jest.fn().mockResolvedValue(["editor"]),
        assignDefaultRole: jest.fn().mockResolvedValue(undefined),
        setUserRoles: jest.fn().mockResolvedValue(undefined),
        updateUser: jest.fn().mockImplementation((id, data) =>
            Promise.resolve(mockUser({ id, ...data }))
        ),
        deleteUser: jest.fn().mockResolvedValue(undefined),
        updatePassword: jest.fn().mockResolvedValue(undefined),
        setEmailVerified: jest.fn().mockResolvedValue(undefined),
        setVerificationToken: jest.fn().mockResolvedValue(undefined),
        getUserByVerificationToken: jest.fn().mockResolvedValue(null),
        getUserWithRoles: jest.fn().mockImplementation(async (userId) => {
            const user = mockUser({ id: userId });
            return { user, roles: [mockRole("editor")] };
        }),
        createRefreshToken: jest.fn().mockResolvedValue(undefined),
        findRefreshTokenByHash: jest.fn().mockResolvedValue(null),
        deleteRefreshToken: jest.fn().mockResolvedValue(undefined),
        deleteAllRefreshTokensForUser: jest.fn().mockResolvedValue(undefined),
        listRefreshTokensForUser: jest.fn().mockResolvedValue([]),
        deleteRefreshTokenById: jest.fn().mockResolvedValue(undefined),
        createPasswordResetToken: jest.fn().mockResolvedValue(undefined),
        findValidPasswordResetToken: jest.fn().mockResolvedValue(null),
        markPasswordResetTokenUsed: jest.fn().mockResolvedValue(undefined),
        deleteExpiredPasswordResetTokens: jest.fn().mockResolvedValue(undefined)
    } as unknown as jest.Mocked<AuthRepository>;
    

    // Password mocks
    (validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true, errors: [] });
    (hashPassword as jest.Mock).mockResolvedValue("hashed-pw");
    (verifyPassword as jest.Mock).mockResolvedValue(true);

    // Google mocks
    (isGoogleOAuthConfigured as jest.Mock).mockReturnValue(false);
    (verifyGoogleIdToken as jest.Mock).mockResolvedValue(null);

    // Email mock
    mockEmailService = { send: jest.fn().mockResolvedValue(undefined), isConfigured: jest.fn().mockReturnValue(opts.withEmail ?? false) };

    const config: AuthModuleConfig = {
        authRepo: mockAuthRepo,
        allowRegistration: opts.allowRegistration ?? true,
        defaultRole: opts.defaultRole,
        emailService: opts.withEmail ? mockEmailService as any : undefined,
        emailConfig: opts.withEmail ? { from: "test@test.com", appName: "TestApp", resetPasswordUrl: "https://app.test", verifyEmailUrl: "https://app.test" } : undefined,
    };

    const app = new Hono<HonoEnv>();
    app.onError(errorHandler);
    app.route("/auth", createAuthRoutes(config));
    return app;
}

function json(body: Record<string, unknown>) {
    return {
        method: "POST" as const,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    };
}

function authHeader(userId = "user-1", roles = ["editor"]) {
    return { Authorization: `Bearer ${generateAccessToken(userId, roles)}` };
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe("Auth Routes (Integration)", () => {
    beforeAll(() => {
        configureJwt({ secret: TEST_SECRET, accessExpiresIn: "1h" });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── Registration ────────────────────────────────────────────────────
    describe("POST /auth/register", () => {
        it("registers a new user and returns 201 with tokens", async () => {
            const app = createApp();
            // allowRegistration=true → isRegistrationAllowed() returns immediately
            // Only the isFirstUser check calls listUsers
            mockAuthRepo.listUsers
                .mockResolvedValueOnce([mockUser()]); // isFirstUser check

            const res = await app.request("/auth/register", json({ email: "new@test.com", password: "StrongPass1" }));
            expect(res.status).toBe(201);
            const body = await res.json() as any;
            expect(body.tokens.accessToken).toBeTruthy();
            expect(body.tokens.refreshToken).toBeTruthy();
            expect(body.user.email).toBe("new@test.com");
        });

        it("first user gets admin role", async () => {
            const app = createApp();
            // allowRegistration=true → isRegistrationAllowed() returns immediately
            // Only the isFirstUser check calls listUsers (after createUser)
            mockAuthRepo.listUsers
                .mockResolvedValueOnce([mockUser()]); // allUsers.length === 1 → isFirstUser

            await app.request("/auth/register", json({ email: "first@test.com", password: "StrongPass1" }));
            expect(mockAuthRepo.assignDefaultRole).toHaveBeenCalledWith(expect.any(String), "admin");
        });

        it("second user gets configured default role", async () => {
            const app = createApp({ defaultRole: "editor" });
            // allowRegistration=true → isRegistrationAllowed() returns immediately
            // isFirstUser check: 2 users → not first
            mockAuthRepo.listUsers
                .mockResolvedValueOnce([mockUser(), mockUser({ id: "user-2" })]);

            await app.request("/auth/register", json({ email: "second@test.com", password: "StrongPass1" }));
            expect(mockAuthRepo.assignDefaultRole).toHaveBeenCalledWith(expect.any(String), "editor");
        });

        it("second user gets no role by default when not configured", async () => {
            const app = createApp();
            mockAuthRepo.listUsers
                .mockResolvedValueOnce([mockUser(), mockUser({ id: "user-2" })]);

            await app.request("/auth/register", json({ email: "third@test.com", password: "StrongPass1" }));
            expect(mockAuthRepo.assignDefaultRole).not.toHaveBeenCalled();
        });

        it("returns 409 when email already exists", async () => {
            const app = createApp();
            mockAuthRepo.getUserByEmail.mockResolvedValueOnce(mockUser());

            const res = await app.request("/auth/register", json({ email: "existing@test.com", password: "StrongPass1" }));
            expect(res.status).toBe(409);
            const body = await res.json() as any;
            expect(body.error.code).toBe("EMAIL_EXISTS");
        });

        it("returns 400 for weak password", async () => {
            const app = createApp();
            (validatePasswordStrength as jest.Mock).mockReturnValueOnce({ valid: false, errors: ["Too short"] });

            const res = await app.request("/auth/register", json({ email: "new@test.com", password: "weak" }));
            expect(res.status).toBe(400);
            const body = await res.json() as any;
            expect(body.error.code).toBe("WEAK_PASSWORD");
        });

        it("returns 400 for invalid email (Zod)", async () => {
            const app = createApp();
            const res = await app.request("/auth/register", json({ email: "not-an-email", password: "StrongPass1" }));
            expect(res.status).toBe(400);
            const body = await res.json() as any;
            expect(body.error.code).toBe("INVALID_INPUT");
        });

        it("returns 400 for missing password", async () => {
            const app = createApp();
            const res = await app.request("/auth/register", json({ email: "a@b.com" }));
            expect(res.status).toBe(400);
        });

        it("returns 403 when registration is disabled and users exist", async () => {
            const app = createApp({ allowRegistration: false });
            mockAuthRepo.listUsers.mockResolvedValueOnce([mockUser()]); // users exist

            const res = await app.request("/auth/register", json({ email: "new@test.com", password: "StrongPass1" }));
            expect(res.status).toBe(403);
            const body = await res.json() as any;
            expect(body.error.code).toBe("REGISTRATION_DISABLED");
        });

        it("allows first-user registration even when registration is disabled", async () => {
            const app = createApp({ allowRegistration: false });
            mockAuthRepo.listUsers
                .mockResolvedValueOnce([])   // isRegistrationAllowed → empty = allow
                .mockResolvedValueOnce([mockUser()]); // isFirstUser

            const res = await app.request("/auth/register", json({ email: "first@test.com", password: "StrongPass1" }));
            expect(res.status).toBe(201);
        });

        it("stores refresh token after registration", async () => {
            const app = createApp();
            mockAuthRepo.listUsers.mockResolvedValueOnce([mockUser()]);

            await app.request("/auth/register", json({ email: "a@b.com", password: "StrongPass1" }));
            expect(mockAuthRepo.createRefreshToken).toHaveBeenCalledTimes(1);
        });
    });

    // ── Login ───────────────────────────────────────────────────────────
    describe("POST /auth/login", () => {
        it("returns tokens on successful login", async () => {
            const app = createApp();
            const user = mockUser({ passwordHash: "salt:hash" });
            mockAuthRepo.getUserByEmail.mockResolvedValueOnce(user);

            const res = await app.request("/auth/login", json({ email: "test@example.com", password: "ValidPass1" }));
            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.tokens.accessToken).toBeTruthy();
            expect(body.user.uid).toBe("user-1");
        });

        it("returns 401 for non-existent email", async () => {
            const app = createApp();
            mockAuthRepo.getUserByEmail.mockResolvedValueOnce(null);

            const res = await app.request("/auth/login", json({ email: "nobody@test.com", password: "Any1" }));
            expect(res.status).toBe(401);
            const body = await res.json() as any;
            expect(body.error.code).toBe("INVALID_CREDENTIALS");
        });

        it("returns 401 for wrong password", async () => {
            const app = createApp();
            mockAuthRepo.getUserByEmail.mockResolvedValueOnce(mockUser());
            (verifyPassword as jest.Mock).mockResolvedValueOnce(false);

            const res = await app.request("/auth/login", json({ email: "test@example.com", password: "Wrong1" }));
            expect(res.status).toBe(401);
        });

        it("returns 401 for user without password hash (Google-only)", async () => {
            const app = createApp();
            mockAuthRepo.getUserByEmail.mockResolvedValueOnce(mockUser({ passwordHash: null }));

            const res = await app.request("/auth/login", json({ email: "google@test.com", password: "Any1" }));
            expect(res.status).toBe(401);
        });

        it("returns 400 for missing email field", async () => {
            const app = createApp();
            const res = await app.request("/auth/login", json({ password: "Any1" }));
            expect(res.status).toBe(400);
        });

        it("stores refresh token on login", async () => {
            const app = createApp();
            mockAuthRepo.getUserByEmail.mockResolvedValueOnce(mockUser());

            await app.request("/auth/login", json({ email: "test@example.com", password: "ValidPass1" }));
            expect(mockAuthRepo.createRefreshToken).toHaveBeenCalledTimes(1);
        });
    });

    // ── Google OAuth ────────────────────────────────────────────────────
    describe("POST /auth/google", () => {
        it("returns 503 when Google OAuth is not configured", async () => {
            const app = createApp();
            const res = await app.request("/auth/google", json({ idToken: "google-token" }));
            expect(res.status).toBe(503);
            const body = await res.json() as any;
            expect(body.error.code).toBe("NOT_CONFIGURED");
        });

        it("returns 401 for invalid Google token", async () => {
            const app = createApp();
            (isGoogleOAuthConfigured as jest.Mock).mockReturnValueOnce(true);
            (verifyGoogleIdToken as jest.Mock).mockResolvedValueOnce(null);

            const res = await app.request("/auth/google", json({ idToken: "bad-token" }));
            expect(res.status).toBe(401);
            const body = await res.json() as any;
            expect(body.error.code).toBe("INVALID_TOKEN");
        });

        it("creates a new user for new Google sign-in", async () => {
            const app = createApp();
            (isGoogleOAuthConfigured as jest.Mock).mockReturnValue(true);
            (verifyGoogleIdToken as jest.Mock).mockResolvedValueOnce({
                googleId: "g-123",
                email: "google@test.com",
                displayName: "Google User",
                photoUrl: "https://photo.url",
                emailVerified: true,
            });
            mockAuthRepo.getUserByGoogleId.mockResolvedValueOnce(null);
            mockAuthRepo.getUserByEmail.mockResolvedValueOnce(null);
            mockAuthRepo.listUsers.mockResolvedValueOnce([mockUser()]); // not first user

            const res = await app.request("/auth/google", json({ idToken: "valid-token" }));
            expect(res.status).toBe(200);
            expect(mockAuthRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({
                email: "google@test.com",
                provider: "google",
                googleId: "g-123",
            }));
        });

        it("links Google to existing account by email", async () => {
            const app = createApp();
            (isGoogleOAuthConfigured as jest.Mock).mockReturnValue(true);
            (verifyGoogleIdToken as jest.Mock).mockResolvedValueOnce({
                googleId: "g-456",
                email: "existing@test.com",
                displayName: "Existing",
                photoUrl: null,
                emailVerified: true,
            });
            const existing = mockUser({ email: "existing@test.com" });
            mockAuthRepo.getUserByGoogleId.mockResolvedValueOnce(null);
            mockAuthRepo.getUserByEmail.mockResolvedValueOnce(existing);

            const res = await app.request("/auth/google", json({ idToken: "link-token" }));
            expect(res.status).toBe(200);
            expect(mockAuthRepo.updateUser).toHaveBeenCalledWith(existing.id, { googleId: "g-456" });
        });

        it("updates profile for returning Google user", async () => {
            const app = createApp();
            (isGoogleOAuthConfigured as jest.Mock).mockReturnValue(true);
            const existingUser = mockUser({ id: "g-user-1" });
            (verifyGoogleIdToken as jest.Mock).mockResolvedValueOnce({
                googleId: "g-789",
                email: "returning@test.com",
                displayName: "Updated Name",
                photoUrl: "https://new-photo.url",
                emailVerified: true,
            });
            mockAuthRepo.getUserByGoogleId.mockResolvedValueOnce(existingUser);

            const res = await app.request("/auth/google", json({ idToken: "returning-token" }));
            expect(res.status).toBe(200);
            expect(mockAuthRepo.updateUser).toHaveBeenCalledWith(existingUser.id, expect.objectContaining({
                displayName: "Updated Name",
                photoUrl: "https://new-photo.url",
            }));
        });
    });

    // ── Token Refresh ───────────────────────────────────────────────────
    describe("POST /auth/refresh", () => {
        it("returns new tokens on valid refresh", async () => {
            const app = createApp();
            mockAuthRepo.findRefreshTokenByHash.mockResolvedValueOnce({
                id: "rt-1",
                userId: "user-1",
                tokenHash: "old-hash",
                expiresAt: new Date(Date.now() + 86400000),
                createdAt: new Date(),
                userAgent: "",
                ipAddress: "",
            });
            mockAuthRepo.getUserRoles.mockResolvedValueOnce([mockRole("editor")]);

            const res = await app.request("/auth/refresh", json({ refreshToken: "valid-refresh-token" }));
            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.tokens.accessToken).toBeTruthy();
            expect(body.tokens.refreshToken).toBeTruthy();
        });

        it("rotates refresh token — deletes old, creates new", async () => {
            const app = createApp();
            mockAuthRepo.findRefreshTokenByHash.mockResolvedValueOnce({
                id: "rt-1",
                userId: "user-1",
                tokenHash: "old-hash",
                expiresAt: new Date(Date.now() + 86400000),
                createdAt: new Date(),
                userAgent: "",
                ipAddress: "",
            });

            await app.request("/auth/refresh", json({ refreshToken: "the-token" }));
            // Old token deleted
            expect(mockAuthRepo.deleteRefreshToken).toHaveBeenCalledTimes(1);
            // New token stored
            expect(mockAuthRepo.createRefreshToken).toHaveBeenCalledTimes(1);
        });

        it("returns 401 for unknown refresh token", async () => {
            const app = createApp();
            mockAuthRepo.findRefreshTokenByHash.mockResolvedValueOnce(null);

            const res = await app.request("/auth/refresh", json({ refreshToken: "unknown" }));
            expect(res.status).toBe(401);
            const body = await res.json() as any;
            expect(body.error.code).toBe("INVALID_TOKEN");
        });

        it("returns 401 and deletes expired refresh token", async () => {
            const app = createApp();
            mockAuthRepo.findRefreshTokenByHash.mockResolvedValueOnce({
                id: "rt-1",
                userId: "user-1",
                tokenHash: "expired-hash",
                expiresAt: new Date(Date.now() - 1000), // expired
                createdAt: new Date(),
                userAgent: "",
                ipAddress: "",
            });

            const res = await app.request("/auth/refresh", json({ refreshToken: "expired-token" }));
            expect(res.status).toBe(401);
            const body = await res.json() as any;
            expect(body.error.code).toBe("TOKEN_EXPIRED");
            expect(mockAuthRepo.deleteRefreshToken).toHaveBeenCalled();
        });

        it("returns 400 for missing refreshToken field", async () => {
            const app = createApp();
            const res = await app.request("/auth/refresh", json({}));
            expect(res.status).toBe(400);
        });
    });

    // ── Logout ──────────────────────────────────────────────────────────
    describe("POST /auth/logout", () => {
        it("deletes refresh token on logout", async () => {
            const app = createApp();
            const res = await app.request("/auth/logout", json({ refreshToken: "rt-to-delete" }));
            expect(res.status).toBe(200);
            expect(mockAuthRepo.deleteRefreshToken).toHaveBeenCalledTimes(1);
        });

        it("returns 200 even without refresh token", async () => {
            const app = createApp();
            const res = await app.request("/auth/logout", json({}));
            expect(res.status).toBe(200);
            expect(mockAuthRepo.deleteRefreshToken).not.toHaveBeenCalled();
        });
    });

    // ── Forgot Password ─────────────────────────────────────────────────
    describe("POST /auth/forgot-password", () => {
        it("always returns success (timing-safe)", async () => {
            const app = createApp({ withEmail: true });
            mockAuthRepo.getUserByEmail.mockResolvedValueOnce(null); // user doesn't exist

            const res = await app.request("/auth/forgot-password", json({ email: "nobody@test.com" }));
            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.success).toBe(true);
        });

        it("sends reset email when user exists", async () => {
            const app = createApp({ withEmail: true });
            mockAuthRepo.getUserByEmail.mockResolvedValueOnce(mockUser());

            await app.request("/auth/forgot-password", json({ email: "test@example.com" }));
            expect(mockAuthRepo.createPasswordResetToken).toHaveBeenCalledTimes(1);
            expect(mockEmailService.send).toHaveBeenCalledTimes(1);
        });

        it("does not send email when user does not exist", async () => {
            const app = createApp({ withEmail: true });
            mockAuthRepo.getUserByEmail.mockResolvedValueOnce(null);

            await app.request("/auth/forgot-password", json({ email: "nobody@test.com" }));
            expect(mockAuthRepo.createPasswordResetToken).not.toHaveBeenCalled();
            expect(mockEmailService.send).not.toHaveBeenCalled();
        });

        it("returns 503 when email service is not configured", async () => {
            const app = createApp({ withEmail: false });
            const res = await app.request("/auth/forgot-password", json({ email: "test@test.com" }));
            expect(res.status).toBe(503);
            const body = await res.json() as any;
            expect(body.error.code).toBe("EMAIL_NOT_CONFIGURED");
        });
    });

    // ── Reset Password ──────────────────────────────────────────────────
    describe("POST /auth/reset-password", () => {
        it("resets password with valid token", async () => {
            const app = createApp();
            mockAuthRepo.findValidPasswordResetToken.mockResolvedValueOnce({
                userId: "user-1",
                expiresAt: new Date(Date.now() + 3600000),
            });

            const res = await app.request("/auth/reset-password", json({ token: "valid-reset-token", password: "NewStrong1" }));
            expect(res.status).toBe(200);
            expect(mockAuthRepo.updatePassword).toHaveBeenCalledWith("user-1", "hashed-pw");
            expect(mockAuthRepo.markPasswordResetTokenUsed).toHaveBeenCalled();
        });

        it("invalidates all sessions after password reset", async () => {
            const app = createApp();
            mockAuthRepo.findValidPasswordResetToken.mockResolvedValueOnce({
                userId: "user-1",
                expiresAt: new Date(Date.now() + 3600000),
            });

            await app.request("/auth/reset-password", json({ token: "token", password: "NewStrong1" }));
            expect(mockAuthRepo.deleteAllRefreshTokensForUser).toHaveBeenCalledWith("user-1");
        });

        it("returns 400 for invalid/expired token", async () => {
            const app = createApp();
            mockAuthRepo.findValidPasswordResetToken.mockResolvedValueOnce(null);

            const res = await app.request("/auth/reset-password", json({ token: "expired", password: "NewStrong1" }));
            expect(res.status).toBe(400);
            const body = await res.json() as any;
            expect(body.error.code).toBe("INVALID_TOKEN");
        });

        it("returns 400 for weak new password", async () => {
            const app = createApp();
            (validatePasswordStrength as jest.Mock).mockReturnValueOnce({ valid: false, errors: ["Too weak"] });

            const res = await app.request("/auth/reset-password", json({ token: "token", password: "weak" }));
            expect(res.status).toBe(400);
            const body = await res.json() as any;
            expect(body.error.code).toBe("WEAK_PASSWORD");
        });
    });

    // ── Change Password ─────────────────────────────────────────────────
    describe("POST /auth/change-password", () => {
        it("changes password for authenticated user", async () => {
            const app = createApp();
            mockAuthRepo.getUserById.mockResolvedValue(mockUser());

            const res = await app.request("/auth/change-password", {
                ...json({ oldPassword: "OldPass1", newPassword: "NewPass1" }),
                headers: { ...json({}).headers, ...authHeader() },
            });
            expect(res.status).toBe(200);
            expect(mockAuthRepo.updatePassword).toHaveBeenCalled();
        });

        it("invalidates all sessions after password change", async () => {
            const app = createApp();
            mockAuthRepo.getUserById.mockResolvedValue(mockUser());

            await app.request("/auth/change-password", {
                ...json({ oldPassword: "Old1", newPassword: "New1Pass" }),
                headers: { ...json({}).headers, ...authHeader() },
            });
            expect(mockAuthRepo.deleteAllRefreshTokensForUser).toHaveBeenCalledWith("user-1");
        });

        it("returns 401 for wrong old password", async () => {
            const app = createApp();
            mockAuthRepo.getUserById.mockResolvedValue(mockUser());
            (verifyPassword as jest.Mock).mockResolvedValueOnce(false);

            const res = await app.request("/auth/change-password", {
                ...json({ oldPassword: "Wrong1", newPassword: "New1Pass" }),
                headers: { ...json({}).headers, ...authHeader() },
            });
            expect(res.status).toBe(401);
        });

        it("returns 400 for weak new password", async () => {
            const app = createApp();
            mockAuthRepo.getUserById.mockResolvedValue(mockUser());
            (validatePasswordStrength as jest.Mock).mockReturnValueOnce({ valid: false, errors: ["Too short"] });

            const res = await app.request("/auth/change-password", {
                ...json({ oldPassword: "Old1", newPassword: "x" }),
                headers: { ...json({}).headers, ...authHeader() },
            });
            expect(res.status).toBe(400);
        });

        it("returns 401 without auth", async () => {
            const app = createApp();
            const res = await app.request("/auth/change-password", json({ oldPassword: "Old1", newPassword: "New1Pass" }));
            expect(res.status).toBe(401);
        });

        it("returns 400 for user without password (Google-only account)", async () => {
            const app = createApp();
            mockAuthRepo.getUserById.mockResolvedValue(mockUser({ passwordHash: null }));

            const res = await app.request("/auth/change-password", {
                ...json({ oldPassword: "Old1", newPassword: "New1Pass" }),
                headers: { ...json({}).headers, ...authHeader() },
            });
            expect(res.status).toBe(400);
            const body = await res.json() as any;
            expect(body.error.code).toBe("INVALID_ACCOUNT");
        });
    });

    // ── Email Verification ──────────────────────────────────────────────
    describe("Email verification", () => {
        describe("POST /auth/send-verification", () => {
            it("sends verification email for authenticated user", async () => {
                const app = createApp({ withEmail: true });
                mockAuthRepo.getUserById.mockResolvedValueOnce(mockUser({ emailVerified: false }));

                const res = await app.request("/auth/send-verification", {
                    method: "POST",
                    headers: { ...authHeader() },
                });
                expect(res.status).toBe(200);
                expect(mockAuthRepo.setVerificationToken).toHaveBeenCalled();
                expect(mockEmailService.send).toHaveBeenCalled();
            });

            it("returns 400 when email is already verified", async () => {
                const app = createApp({ withEmail: true });
                mockAuthRepo.getUserById.mockResolvedValueOnce(mockUser({ emailVerified: true }));

                const res = await app.request("/auth/send-verification", {
                    method: "POST",
                    headers: { ...authHeader() },
                });
                expect(res.status).toBe(400);
                const body = await res.json() as any;
                expect(body.error.code).toBe("ALREADY_VERIFIED");
            });

            it("returns 401 without auth", async () => {
                const app = createApp({ withEmail: true });
                const res = await app.request("/auth/send-verification", { method: "POST" });
                expect(res.status).toBe(401);
            });

            it("returns 503 when email service is not configured", async () => {
                const app = createApp({ withEmail: false });
                const res = await app.request("/auth/send-verification", {
                    method: "POST",
                    headers: { ...authHeader() },
                });
                expect(res.status).toBe(503);
            });
        });

        describe("GET /auth/verify-email", () => {
            it("verifies email with valid token", async () => {
                const app = createApp();
                mockAuthRepo.getUserByVerificationToken.mockResolvedValueOnce(mockUser());

                const res = await app.request("/auth/verify-email?token=valid-token");
                expect(res.status).toBe(200);
                expect(mockAuthRepo.setEmailVerified).toHaveBeenCalledWith("user-1", true);
            });

            it("returns 400 for invalid verification token", async () => {
                const app = createApp();
                mockAuthRepo.getUserByVerificationToken.mockResolvedValueOnce(null);

                const res = await app.request("/auth/verify-email?token=bad-token");
                expect(res.status).toBe(400);
                const body = await res.json() as any;
                expect(body.error.code).toBe("INVALID_TOKEN");
            });

            it("returns 400 when token is missing", async () => {
                const app = createApp();
                const res = await app.request("/auth/verify-email");
                expect(res.status).toBe(400);
            });
        });
    });

    // ── User Profile ────────────────────────────────────────────────────
    describe("GET /auth/me", () => {
        it("returns authenticated user with roles", async () => {
            const app = createApp();
            const res = await app.request("/auth/me", {
                headers: { ...authHeader("user-1", ["admin"]) },
            });
            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.user.uid).toBe("user-1");
            expect(body.user.roles).toBeDefined();
        });

        it("returns 401 without auth", async () => {
            const app = createApp();
            const res = await app.request("/auth/me");
            expect(res.status).toBe(401);
        });

        it("returns 404 when user is deleted", async () => {
            const app = createApp();
            mockAuthRepo.getUserWithRoles.mockResolvedValueOnce(null);

            const res = await app.request("/auth/me", {
                headers: { ...authHeader() },
            });
            expect(res.status).toBe(404);
        });
    });

    describe("PATCH /auth/me", () => {
        it("updates user profile", async () => {
            const app = createApp();
            mockAuthRepo.updateUser.mockResolvedValueOnce(mockUser({ displayName: "New Name" }));

            const res = await app.request("/auth/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ displayName: "New Name" }),
            });
            expect(res.status).toBe(200);
            expect(mockAuthRepo.updateUser).toHaveBeenCalledWith("user-1", expect.objectContaining({
                displayName: "New Name",
            }));
        });

        it("returns 401 without auth", async () => {
            const app = createApp();
            const res = await app.request("/auth/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ displayName: "Name" }),
            });
            expect(res.status).toBe(401);
        });
    });

    // ── Sessions ────────────────────────────────────────────────────────
    describe("Session management", () => {
        it("GET /auth/sessions lists active sessions", async () => {
            const app = createApp();
            mockAuthRepo.listRefreshTokensForUser.mockResolvedValueOnce([
                { id: "s1", userId: "user-1", tokenHash: "h1", expiresAt: new Date(), createdAt: new Date(), userAgent: "Chrome", ipAddress: "1.2.3.4" },
            ]);

            const res = await app.request("/auth/sessions", { headers: { ...authHeader() } });
            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.sessions).toHaveLength(1);
            expect(body.sessions[0].id).toBe("s1");
        });

        it("DELETE /auth/sessions revokes all sessions", async () => {
            const app = createApp();
            const res = await app.request("/auth/sessions", {
                method: "DELETE",
                headers: { ...authHeader() },
            });
            expect(res.status).toBe(200);
            expect(mockAuthRepo.deleteAllRefreshTokensForUser).toHaveBeenCalledWith("user-1");
        });

        it("DELETE /auth/sessions/:id revokes specific session", async () => {
            const app = createApp();
            const res = await app.request("/auth/sessions/s123", {
                method: "DELETE",
                headers: { ...authHeader() },
            });
            expect(res.status).toBe(200);
            expect(mockAuthRepo.deleteRefreshTokenById).toHaveBeenCalledWith("s123", "user-1");
        });

        it("sessions endpoints return 401 without auth", async () => {
            const app = createApp();
            const res1 = await app.request("/auth/sessions");
            expect(res1.status).toBe(401);

            const res2 = await app.request("/auth/sessions", { method: "DELETE" });
            expect(res2.status).toBe(401);
        });
    });

    // ── Auth Config ─────────────────────────────────────────────────────
    describe("GET /auth/config", () => {
        it("returns setup status when no users exist", async () => {
            const app = createApp();
            mockAuthRepo.listUsers.mockResolvedValueOnce([]);

            const res = await app.request("/auth/config");
            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.needsSetup).toBe(true);
            expect(body.registrationEnabled).toBe(true); // always true when needsSetup
        });

        it("returns correct flags when users exist", async () => {
            const app = createApp({ allowRegistration: false });
            mockAuthRepo.listUsers.mockResolvedValueOnce([mockUser()]);

            const res = await app.request("/auth/config");
            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.needsSetup).toBe(false);
            expect(body.registrationEnabled).toBe(false);
            expect(body.googleEnabled).toBe(false);
        });

        it("reports Google enabled when configured", async () => {
            const app = createApp();
            (isGoogleOAuthConfigured as jest.Mock).mockReturnValue(true);
            mockAuthRepo.listUsers.mockResolvedValueOnce([mockUser()]);

            const res = await app.request("/auth/config");
            const body = await res.json() as any;
            expect(body.googleEnabled).toBe(true);
        });
    });
});
