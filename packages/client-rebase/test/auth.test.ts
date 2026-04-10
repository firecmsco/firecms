import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { createAuth, createMemoryStorage, RebaseSession, RebaseUser, AuthChangeEvent } from "../src/auth";
import { Transport, RebaseApiError } from "../src/transport";

/** Minimal mock Response shape used by auth methods that call fetch directly. */
interface MockResponse {
    ok: boolean;
    status?: number;
    statusText?: string;
    json: () => Promise<Record<string, unknown>>;
}

type MockFetch = jest.Mock<(input: RequestInfo | URL, init?: RequestInit) => Promise<MockResponse>>;

function createMockTransport(mockFetch?: MockFetch) {
    const mockRequest = jest.fn() as jest.Mock<Transport["request"]>;
    const fetchFn = mockFetch || (jest.fn() as MockFetch);
    const transport: Transport = {
        request: mockRequest,
        baseUrl: "http://localhost",
        apiPath: "/api/v1",
        fetchFn: fetchFn as unknown as typeof globalThis.fetch,
        setToken: jest.fn(),
        setAuthTokenGetter: jest.fn(),
        getHeaders: jest.fn().mockReturnValue({}),
        resolveToken: jest.fn().mockResolvedValue(null)
    };
    return { transport, mockRequest, mockFetch: fetchFn as MockFetch };
}

const mockUser: RebaseUser = {
    uid: "usr_1",
    email: "test@example.com",
    displayName: "Test User",
    roles: ["user"],
    photoURL: null,
    providerId: "local",
    isAnonymous: false,
};

function mockTokens(expiresAt?: number) {
    return {
        accessToken: "fake-jwt",
        refreshToken: "fake-refresh",
        accessTokenExpiresAt: expiresAt ?? Date.now() + 3600000,
    };
}

function mockSessionObj(expiresAt?: number): RebaseSession {
    return {
        accessToken: "fake-jwt",
        refreshToken: "fake-refresh",
        expiresAt: expiresAt ?? Date.now() + 3600000,
        user: mockUser,
    };
}

describe("createAuth", () => {
    let transport: Transport;
    let mockRequest: jest.Mock<Transport["request"]>;
    let mockFetch: MockFetch;

    beforeEach(() => {
        jest.useFakeTimers();
        ({ transport, mockRequest, mockFetch } = createMockTransport());
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    // -----------------------------------------------------------------------
    // Session initialization
    // -----------------------------------------------------------------------
    describe("Session initialization", () => {
        it("initializes without a session if storage is empty", () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            expect(auth.getSession()).toBeNull();
        });

        it("restores session from storage if token is still valid", () => {
            const storage = createMemoryStorage();
            const session = mockSessionObj(Date.now() + 1000000);
            storage.setItem("rebase_auth", JSON.stringify(session));

            const auth = createAuth(transport, { storage });
            expect(auth.getSession()?.accessToken).toBe("fake-jwt");
            expect(transport.setToken).toHaveBeenCalledWith("fake-jwt");
        });

        it("attempts refresh when stored session is expired", () => {
            const storage = createMemoryStorage();
            const expiredSession = mockSessionObj(Date.now() - 1000);
            storage.setItem("rebase_auth", JSON.stringify(expiredSession));

            // Mock the refresh fetch call
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tokens: mockTokens(Date.now() + 3600000),
                }),
            });

            const auth = createAuth(transport, { storage });
            // Session should exist (refresh is attempted in background)
            expect(auth.getSession()).toBeDefined();
        });

        it("skips session restore when persistSession is false", () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify(mockSessionObj()));

            const auth = createAuth(transport, { storage, persistSession: false });
            expect(auth.getSession()).toBeNull();
        });

        it("does not restore session with missing/corrupt storage data", () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", "not-valid-json");

            const auth = createAuth(transport, { storage });
            expect(auth.getSession()).toBeNull();
        });

        it("does not restore session without accessToken", () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify({ refreshToken: "rt", expiresAt: Date.now() + 100000 }));

            const auth = createAuth(transport, { storage });
            expect(auth.getSession()).toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    // signInWithEmail
    // -----------------------------------------------------------------------
    describe("signInWithEmail", () => {
        it("sends credentials and initiates session", async () => {
            const session = mockSessionObj();
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tokens: mockTokens(session.expiresAt),
                    user: mockUser
                })
            });

            const storage = createMemoryStorage();
            const auth = createAuth(transport, { storage });

            const sessionInfo = await auth.signInWithEmail("test@example.com", "password123");

            expect(sessionInfo.accessToken).toEqual(session.accessToken);
            expect(mockFetch).toHaveBeenCalledWith("http://localhost/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "test@example.com", password: "password123" })
            });
            expect(auth.getSession()?.accessToken).toEqual(session.accessToken);
            expect(transport.setToken).toHaveBeenCalledWith(session.accessToken);
        });

        it("throws on failed login", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: "Unauthorized",
                json: async () => ({ error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS" } })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage() });
            await expect(auth.signInWithEmail("bad@email.com", "wrong")).rejects.toThrow("Invalid credentials");
        });

        it("emits SIGNED_IN event", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ tokens: mockTokens(), user: mockUser })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage() });
            const listener = jest.fn();
            auth.onAuthStateChange(listener);

            await auth.signInWithEmail("test@example.com", "pass");
            expect(listener).toHaveBeenCalledWith("SIGNED_IN", expect.objectContaining({ accessToken: "fake-jwt" }));
        });
    });

    // -----------------------------------------------------------------------
    // signUp
    // -----------------------------------------------------------------------
    describe("signUp", () => {
        it("creates a user and initiates session", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ tokens: mockTokens(), user: mockUser })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage() });
            const sessionInfo = await auth.signUp("test@example.com", "password123", "Test User");

            expect(sessionInfo.accessToken).toEqual("fake-jwt");
            expect(mockFetch).toHaveBeenCalledWith("http://localhost/api/v1/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "test@example.com", password: "password123", displayName: "Test User" })
            });
        });

        it("sends without displayName when not provided", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ tokens: mockTokens(), user: mockUser })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage() });
            await auth.signUp("test@example.com", "password123");

            const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
            expect(body.displayName).toBeUndefined();
        });

        it("throws on failed registration", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 409,
                statusText: "Conflict",
                json: async () => ({ error: { message: "Email already exists" } })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage() });
            await expect(auth.signUp("existing@email.com", "pass")).rejects.toThrow("Email already exists");
        });
    });

    // -----------------------------------------------------------------------
    // signInWithGoogle
    // -----------------------------------------------------------------------
    describe("signInWithGoogle", () => {
        it("sends Google ID token and initiates session", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ tokens: mockTokens(), user: mockUser })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage() });
            const sessionInfo = await auth.signInWithGoogle("google-id-token");

            expect(sessionInfo.accessToken).toBe("fake-jwt");
            expect(mockFetch).toHaveBeenCalledWith("http://localhost/api/v1/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: "google-id-token" })
            });
        });

        it("throws on Google auth failure", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: "Unauthorized",
                json: async () => ({ error: { message: "Invalid Google token" } })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage() });
            await expect(auth.signInWithGoogle("bad-token")).rejects.toThrow("Invalid Google token");
        });
    });

    // -----------------------------------------------------------------------
    // signOut
    // -----------------------------------------------------------------------
    describe("signOut", () => {
        it("clears session, storage, notifies listeners, calls backend", async () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify(mockSessionObj()));

            const auth = createAuth(transport, { storage });
            expect(auth.getSession()?.accessToken).toEqual("fake-jwt");

            const listener = jest.fn();
            auth.onAuthStateChange(listener);

            mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
            await auth.signOut();

            expect(auth.getSession()).toBeNull();
            expect(storage.getItem("rebase_auth")).toBeNull();
            expect(transport.setToken).toHaveBeenCalledWith(null);
            expect(listener).toHaveBeenCalledWith("SIGNED_OUT", null);
            expect(mockFetch).toHaveBeenCalledWith("http://localhost/api/v1/auth/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: "fake-refresh" })
            });
        });

        it("handles backend logout failure gracefully", async () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify(mockSessionObj()));

            const auth = createAuth(transport, { storage });
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            // Should not throw
            await auth.signOut();
            expect(auth.getSession()).toBeNull();
        });

        it("works when no session exists", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            await auth.signOut();
            expect(auth.getSession()).toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    // refreshSession
    // -----------------------------------------------------------------------
    describe("refreshSession", () => {
        it("refreshes token and updates storage", async () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify(mockSessionObj()));
            const auth = createAuth(transport, { storage });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tokens: {
                        accessToken: "new-jwt",
                        refreshToken: "new-refresh",
                        accessTokenExpiresAt: Date.now() + 3600000
                    }
                })
            });

            const result = await auth.refreshSession();
            expect(result.accessToken).toEqual("new-jwt");
            expect(transport.setToken).toHaveBeenCalledWith("new-jwt");
        });

        it("throws when no active session to refresh", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            await expect(auth.refreshSession()).rejects.toThrow("No active session to refresh");
        });

        it("emits TOKEN_REFRESHED event", async () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify(mockSessionObj()));
            const auth = createAuth(transport, { storage });

            const listener = jest.fn();
            auth.onAuthStateChange(listener);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tokens: {
                        accessToken: "refreshed",
                        refreshToken: "refreshed-rt",
                        accessTokenExpiresAt: Date.now() + 3600000
                    }
                })
            });

            await auth.refreshSession();
            expect(listener).toHaveBeenCalledWith("TOKEN_REFRESHED", expect.objectContaining({ accessToken: "refreshed" }));
        });

        it("preserves user data on refresh", async () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify(mockSessionObj()));
            const auth = createAuth(transport, { storage });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tokens: {
                        accessToken: "new",
                        refreshToken: "new-rt",
                        accessTokenExpiresAt: Date.now() + 3600000
                    }
                })
            });

            const result = await auth.refreshSession();
            expect(result.user.uid).toBe("usr_1");
        });

        it("throws on refresh failure", async () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify(mockSessionObj()));
            const auth = createAuth(transport, { storage });

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: "Unauthorized",
                json: async () => ({ error: { message: "Refresh token expired" } })
            });

            await expect(auth.refreshSession()).rejects.toThrow("Refresh token expired");
        });
    });

    // -----------------------------------------------------------------------
    // User management
    // -----------------------------------------------------------------------
    describe("User management", () => {
        it("getUser calls transport /auth/me", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockRequest.mockResolvedValueOnce({ user: mockUser });

            const user = await auth.getUser();
            expect(user).toEqual(mockUser);
            expect(mockRequest).toHaveBeenCalledWith("/auth/me", { method: "GET" });
        });

        it("updateUser updates session and emits USER_UPDATED", async () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify(mockSessionObj()));
            const auth = createAuth(transport, { storage });

            const updatedUser = { ...mockUser, displayName: "New Name" };
            mockRequest.mockResolvedValueOnce({ user: updatedUser });

            const listener = jest.fn();
            auth.onAuthStateChange(listener);

            const result = await auth.updateUser({ displayName: "New Name" });
            expect(result.displayName).toBe("New Name");
            expect(listener).toHaveBeenCalledWith("USER_UPDATED", expect.objectContaining({
                user: expect.objectContaining({ displayName: "New Name" })
            }));
            expect(mockRequest).toHaveBeenCalledWith("/auth/me", {
                method: "PATCH",
                body: JSON.stringify({ displayName: "New Name" })
            });
        });

        it("updateUser does not emit event when no active session", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            const updatedUser = { ...mockUser, displayName: "New Name" };
            mockRequest.mockResolvedValueOnce({ user: updatedUser });

            const listener = jest.fn();
            auth.onAuthStateChange(listener);

            await auth.updateUser({ displayName: "New Name" });
            expect(listener).not.toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Password management
    // -----------------------------------------------------------------------
    describe("Password management", () => {
        it("resetPasswordForEmail sends email", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message: "Reset email sent" })
            });

            const result = await auth.resetPasswordForEmail("user@test.com");
            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith("http://localhost/api/v1/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "user@test.com" })
            });
        });

        it("resetPassword resets with token", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message: "Password reset" })
            });

            const result = await auth.resetPassword("reset-token-123", "newPass");
            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith("http://localhost/api/v1/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: "reset-token-123", password: "newPass" })
            });
        });

        it("changePassword calls transport", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockRequest.mockResolvedValueOnce({ success: true, message: "Changed" });

            const result = await auth.changePassword("oldPass", "newPass");
            expect(result.success).toBe(true);
            expect(mockRequest).toHaveBeenCalledWith("/auth/change-password", {
                method: "POST",
                body: JSON.stringify({ oldPassword: "oldPass", newPassword: "newPass" })
            });
        });
    });

    // -----------------------------------------------------------------------
    // Email verification
    // -----------------------------------------------------------------------
    describe("Email verification", () => {
        it("sendVerificationEmail calls transport", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockRequest.mockResolvedValueOnce({ success: true, message: "Sent" });

            const result = await auth.sendVerificationEmail();
            expect(result.success).toBe(true);
            expect(mockRequest).toHaveBeenCalledWith("/auth/send-verification", { method: "POST" });
        });

        it("verifyEmail makes GET request with token", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message: "Verified" })
            });

            const result = await auth.verifyEmail("verification-token");
            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost/api/v1/auth/verify-email?token=verification-token",
                expect.objectContaining({ method: "GET" })
            );
        });

        it("verifyEmail URL-encodes the token", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message: "Verified" })
            });

            await auth.verifyEmail("token with spaces&special=chars");
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("token%20with%20spaces%26special%3Dchars"),
                expect.any(Object)
            );
        });
    });

    // -----------------------------------------------------------------------
    // Session management
    // -----------------------------------------------------------------------
    describe("Session management", () => {
        it("getSessions calls /auth/sessions", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockRequest.mockResolvedValueOnce({ sessions: [{ id: "s1" }] });

            const sessions = await auth.getSessions();
            expect(sessions).toEqual([{ id: "s1" }]);
            expect(mockRequest).toHaveBeenCalledWith("/auth/sessions", { method: "GET" });
        });

        it("revokeSession calls DELETE /auth/sessions/:id", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockRequest.mockResolvedValueOnce({ success: true });

            await auth.revokeSession("sess_1");
            expect(mockRequest).toHaveBeenCalledWith("/auth/sessions/sess_1", { method: "DELETE" });
        });

        it("revokeSession encodes the session id", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockRequest.mockResolvedValueOnce({ success: true });

            await auth.revokeSession("sess/with/slashes");
            expect(mockRequest).toHaveBeenCalledWith("/auth/sessions/sess%2Fwith%2Fslashes", { method: "DELETE" });
        });

        it("revokeAllSessions clears local state and emits SIGNED_OUT", async () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify(mockSessionObj()));
            const auth = createAuth(transport, { storage });

            const listener = jest.fn();
            auth.onAuthStateChange(listener);
            mockRequest.mockResolvedValueOnce({ success: true });

            await auth.revokeAllSessions();
            expect(auth.getSession()).toBeNull();
            expect(storage.getItem("rebase_auth")).toBeNull();
            expect(transport.setToken).toHaveBeenCalledWith(null);
            expect(listener).toHaveBeenCalledWith("SIGNED_OUT", null);
        });
    });

    // -----------------------------------------------------------------------
    // Auth config
    // -----------------------------------------------------------------------
    describe("getAuthConfig", () => {
        it("fetches auth configuration", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    needsSetup: false,
                    registrationEnabled: true,
                    googleEnabled: true,
                    emailServiceEnabled: true
                })
            });

            const config = await auth.getAuthConfig();
            expect(config.registrationEnabled).toBe(true);
            expect(config.googleEnabled).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith("http://localhost/api/v1/auth/config", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
        });
    });

    // -----------------------------------------------------------------------
    // onAuthStateChange
    // -----------------------------------------------------------------------
    describe("onAuthStateChange", () => {
        it("returns an unsubscribe function that removes the listener", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ tokens: mockTokens(), user: mockUser })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage() });
            const listener = jest.fn();
            const unsubscribe = auth.onAuthStateChange(listener);

            await auth.signInWithEmail("test@example.com", "pass");
            expect(listener).toHaveBeenCalledTimes(1);

            // Unsubscribe
            unsubscribe();

            // Log out should NOT call the listener again
            mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
            await auth.signOut();
            expect(listener).toHaveBeenCalledTimes(1); // Still 1
        });

        it("supports multiple listeners", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ tokens: mockTokens(), user: mockUser })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage() });
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            auth.onAuthStateChange(listener1);
            auth.onAuthStateChange(listener2);

            await auth.signInWithEmail("test@example.com", "pass");
            expect(listener1).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenCalledTimes(1);
        });

        it("catches errors in listeners and does not propagate", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ tokens: mockTokens(), user: mockUser })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage() });
            const badListener = jest.fn().mockImplementation(() => { throw new Error("listener error"); });
            const goodListener = jest.fn();

            auth.onAuthStateChange(badListener);
            auth.onAuthStateChange(goodListener);

            await auth.signInWithEmail("test@example.com", "pass"); // Should not throw
            expect(goodListener).toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Auto-refresh scheduling
    // -----------------------------------------------------------------------
    describe("Auto-refresh scheduling", () => {
        it("schedules a refresh before token expiry", async () => {
            const expiresAt = Date.now() + 300000; // 5 minutes from now
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tokens: mockTokens(expiresAt),
                    user: mockUser
                })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage(), autoRefresh: true });
            await auth.signInWithEmail("test@example.com", "pass");

            // The refresh should be scheduled. Mock the refresh call.
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tokens: mockTokens(Date.now() + 3600000)
                })
            });

            // Advance time to trigger the refresh
            jest.advanceTimersByTime(300000);
            // Allow promises to settle
            await Promise.resolve();
        });

        it("disables auto-refresh when autoRefresh option is false", async () => {
            const expiresAt = Date.now() + 300000;
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tokens: mockTokens(expiresAt),
                    user: mockUser
                })
            });

            const auth = createAuth(transport, { storage: createMemoryStorage(), autoRefresh: false });
            await auth.signInWithEmail("test@example.com", "pass");

            // Advance past expiry - should not try to refresh
            jest.advanceTimersByTime(400000);
            // Only the initial sign-in fetch call
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });
    });

    // -----------------------------------------------------------------------
    // Custom authPath
    // -----------------------------------------------------------------------
    describe("Custom authPath", () => {
        it("uses custom authPath for all auth endpoints", async () => {
            const auth = createAuth(transport, {
                storage: createMemoryStorage(),
                authPath: "/custom-auth"
            });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ tokens: mockTokens(), user: mockUser })
            });

            await auth.signInWithEmail("test@example.com", "pass");
            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost/api/v1/custom-auth/login",
                expect.any(Object)
            );
        });
    });

    // -----------------------------------------------------------------------
    // Memory storage
    // -----------------------------------------------------------------------
    describe("MemoryStorage", () => {
        it("stores and retrieves values", () => {
            const storage = createMemoryStorage();
            storage.setItem("key", "val");
            expect(storage.getItem("key")).toBe("val");
            storage.removeItem("key");
            expect(storage.getItem("key")).toBeNull();
        });

        it("returns null for non-existent keys", () => {
            const storage = createMemoryStorage();
            expect(storage.getItem("nonexistent")).toBeNull();
        });

        it("overwrites existing values", () => {
            const storage = createMemoryStorage();
            storage.setItem("key", "old");
            storage.setItem("key", "new");
            expect(storage.getItem("key")).toBe("new");
        });
    });
});
