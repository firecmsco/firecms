import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { createAuth, createMemoryStorage, RebaseSession, RebaseUser } from "../src/auth";
import { Transport } from "../src/transport";

describe("createAuth", () => {
    let mockRequest: jest.Mock<any>;
    let transport: Transport;
    let mockFetch: jest.Mock<any>;

    const mockUser: RebaseUser = {
        uid: "usr_1",
        email: "test@example.com",
        displayName: "Test User",
        roles: ["user"],
        photoURL: null,
    };

    const mockSession: RebaseSession = {
        accessToken: "fake-jwt",
        refreshToken: "fake-refresh",
        expiresAt: Date.now() + 3600000,
        user: mockUser,
    };

    beforeEach(() => {
        jest.useFakeTimers();
        mockRequest = jest.fn() as jest.Mock<any>;
        mockFetch = jest.fn() as jest.Mock<any>;
        transport = {
            request: mockRequest,
            baseUrl: "http://localhost",
            apiPath: "/api/v1",
            fetchFn: mockFetch,
            setToken: jest.fn()
        } as unknown as Transport;
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it("initializes without a session if storage is empty", () => {
        const auth = createAuth(transport, { storage: createMemoryStorage() });
        expect(auth.getSession()).toBeNull();
    });

    it("signInWithEmail sends credentials and initiates session", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                tokens: {
                    accessToken: mockSession.accessToken,
                    refreshToken: mockSession.refreshToken,
                    accessTokenExpiresAt: mockSession.expiresAt
                },
                user: mockUser
            })
        } as any);
        
        const storage = createMemoryStorage();
        const auth = createAuth(transport, { storage });

        const sessionInfo = await auth.signInWithEmail("test@example.com", "password123");
        
        expect(sessionInfo.accessToken).toEqual(mockSession.accessToken);
        expect(mockFetch).toHaveBeenCalledWith("http://localhost/api/v1/auth/login", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "test@example.com", password: "password123" })
        });

        expect(auth.getSession()?.accessToken).toEqual(mockSession.accessToken);
        expect(storage.getItem("rebase_auth")).toBe(JSON.stringify(mockSession));
    });

    it("signUp creates a user and initiates session", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                tokens: {
                    accessToken: mockSession.accessToken,
                    refreshToken: mockSession.refreshToken,
                    accessTokenExpiresAt: mockSession.expiresAt
                },
                user: mockUser
            })
        } as any);
        
        const auth = createAuth(transport, { storage: createMemoryStorage() });

        const sessionInfo = await auth.signUp("test@example.com", "password123", "Test User");
        
        expect(sessionInfo.accessToken).toEqual(mockSession.accessToken);
        expect(mockFetch).toHaveBeenCalledWith("http://localhost/api/v1/auth/register", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "test@example.com", password: "password123", displayName: "Test User" })
        });
    });

    it("signOut clears session and storage, notifies listeners, calling backend", async () => {
        const storage = createMemoryStorage();
        storage.setItem("rebase_auth", JSON.stringify(mockSession));

        const auth = createAuth(transport, { storage });
        
        expect(auth.getSession()?.accessToken).toEqual(mockSession.accessToken);

        const listener = jest.fn();
        auth.onAuthStateChange(listener);

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) } as any);

        await auth.signOut();

        expect(auth.getSession()).toBeNull();
        expect(storage.getItem("rebase_auth")).toBeNull();
        expect(transport.setToken).toHaveBeenCalledWith(null);
        expect(listener).toHaveBeenCalledWith("SIGNED_OUT", null);
        expect(mockFetch).toHaveBeenCalledWith("http://localhost/api/v1/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: mockSession.refreshToken })
        });
    });

    describe("Auto-Refresh", () => {
        it("refreshes token when called directly and updates storage", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            
            const currentSession = mockSession;
            const newSession = { ...currentSession, accessToken: "new-jwt", refreshToken: "new-refresh" };

            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify(currentSession));
            const authWithSession = createAuth(transport, { storage });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tokens: {
                        accessToken: newSession.accessToken,
                        refreshToken: newSession.refreshToken,
                        accessTokenExpiresAt: newSession.expiresAt
                    }
                })
            } as any);

            const result = await authWithSession.refreshSession();

            expect(result.accessToken).toEqual("new-jwt");
            expect(mockFetch).toHaveBeenCalledWith("http://localhost/api/v1/auth/refresh", { 
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: "fake-refresh" }) 
            });
            expect(transport.setToken).toHaveBeenCalledWith("new-jwt");
        });
    });

    describe("User Management Methods", () => {
        it("getSessions calls /auth/sessions", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockRequest.mockResolvedValueOnce({ sessions: [] } as any);

            const sessions = await auth.getSessions();
            expect(sessions).toEqual([]);
            expect(mockRequest).toHaveBeenCalledWith("/auth/sessions", { method: "GET" });
        });

        it("revokeSession calls DELETE /auth/sessions/:id", async () => {
            const auth = createAuth(transport, { storage: createMemoryStorage() });
            mockRequest.mockResolvedValueOnce({ success: true } as any);

            await auth.revokeSession("sess_1");
            expect(mockRequest).toHaveBeenCalledWith("/auth/sessions/sess_1", { method: "DELETE" });
        });
    });

    describe("MemoryStorage", () => {
        it("stores and retrieves properties", () => {
            const storage = createMemoryStorage();
            storage.setItem("key", "val");
            expect(storage.getItem("key")).toBe("val");
            storage.removeItem("key");
            expect(storage.getItem("key")).toBeNull();
        });
    });
});
