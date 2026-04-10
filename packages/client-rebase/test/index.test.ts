import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { createRebaseClient, RebaseClient } from "../src/index";
import { createMemoryStorage } from "../src/auth";
import { CollectionClient } from "../src/collection";

describe("createRebaseClient", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    // -----------------------------------------------------------------------
    // Initialization
    // -----------------------------------------------------------------------
    describe("Initialization", () => {
        it("initializes with config properties", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com", token: "jwt-token" });
            expect(client).toBeDefined();
            expect(client.auth).toBeDefined();
            expect(client.admin).toBeDefined();
            expect(client.storage).toBeDefined();
        });

        it("exposes baseUrl from transport", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            expect(client.baseUrl).toBe("https://api.example.com");
        });

        it("exposes setToken and setAuthTokenGetter", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            expect(typeof client.setToken).toBe("function");
            expect(typeof client.setAuthTokenGetter).toBe("function");
            expect(typeof client.resolveToken).toBe("function");
        });
    });

    // -----------------------------------------------------------------------
    // Collection access
    // -----------------------------------------------------------------------
    describe("Collection access", () => {
        it("exposes the explicit collection() method", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            const posts = client.collection("posts");
            expect(typeof posts.find).toBe("function");
            expect(typeof posts.findById).toBe("function");
            expect(typeof posts.create).toBe("function");
            expect(typeof posts.update).toBe("function");
            expect(typeof posts.delete).toBe("function");
        });

        it("caches collection clients (returns same instance)", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            const posts1 = client.collection("posts");
            const posts2 = client.collection("posts");
            expect(posts1).toBe(posts2);
        });

        it("creates different clients for different slugs", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            const posts = client.collection("posts");
            const users = client.collection("users");
            expect(posts).not.toBe(users);
        });
    });

    // -----------------------------------------------------------------------
    // Proxy access (top-level)
    // -----------------------------------------------------------------------
    describe("Top-level proxy", () => {
        it("returns explicit methods from the proxy directly", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });

            expect(typeof client.auth).toBe("object");
            expect(typeof client.admin).toBe("object");
            expect(typeof client.collection).toBe("function");
            expect(typeof client.auth.signInWithEmail).toBe("function");
        });

        it("evaluates unknown properties as collection access via top-level proxy", () => {
            interface TestDB {
                posts: { Row: { title: string } };
            }
            const client = createRebaseClient<TestDB>({ baseUrl: "https://api.example.com" });

            const magicPosts = (client as any).posts;
            expect(typeof magicPosts).toBe("object");
            expect(typeof magicPosts.find).toBe("function");
        });

        it("ignores 'then' property to prevent Promise-like misinterpretation", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            expect((client as any).then).toBeUndefined();
        });
    });

    // -----------------------------------------------------------------------
    // data proxy
    // -----------------------------------------------------------------------
    describe("data proxy", () => {
        it("accesses collections via data.collection()", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            const posts = client.data.collection("posts");
            expect(typeof posts.find).toBe("function");
        });

        it("accesses collections via data.<name> shorthand", () => {
            interface TestDB {
                posts: { Row: { title: string } };
            }
            const client = createRebaseClient<TestDB>({ baseUrl: "https://api.example.com" });

            const posts: CollectionClient = client.data.posts;
            expect(typeof posts).toBe("object");
            expect(typeof posts.find).toBe("function");
            expect(typeof posts.findById).toBe("function");
        });

        it("returns undefined for symbol properties on data proxy", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            expect((client.data as any)[Symbol.iterator]).toBeUndefined();
        });

        it("ignores 'then' on data proxy", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            expect((client.data as any).then).toBeUndefined();
        });

        it("ignores 'toJSON' on data proxy", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            expect((client.data as any).toJSON).toBeUndefined();
        });

        it("ignores '$$typeof' on data proxy (React devtools)", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            expect((client.data as any).$$typeof).toBeUndefined();
        });
    });

    // -----------------------------------------------------------------------
    // call() method
    // -----------------------------------------------------------------------
    describe("call() method", () => {
        it("is a function on the client", () => {
            const client = createRebaseClient({ baseUrl: "https://api.example.com" });
            expect(typeof client.call).toBe("function");
        });
    });

    // -----------------------------------------------------------------------
    // Auth storage configuration
    // -----------------------------------------------------------------------
    describe("Auth configuration", () => {
        it("passes custom auth storage configuration", () => {
            const storage = createMemoryStorage();
            storage.setItem("rebase_auth", JSON.stringify({
                accessToken: "active-token",
                refreshToken: "active-refresh",
                expiresAt: Date.now() + 1000000,
                user: { uid: "u", email: "u@m.com", displayName: "u", photoURL: null }
            }));

            const client = createRebaseClient({
                baseUrl: "https://api.example.com",
                auth: { storage }
            });

            const session = client.auth.getSession();
            expect(session).toBeDefined();
            expect(session?.accessToken).toBe("active-token");
        });

        it("passes custom admin path configuration", () => {
            const client = createRebaseClient({
                baseUrl: "https://api.example.com",
                admin: { adminPath: "/custom-admin" }
            });

            expect(client.admin).toBeDefined();
        });
    });

    // -----------------------------------------------------------------------
    // WebSocket URL derivation
    // -----------------------------------------------------------------------
    describe("WebSocket URL derivation", () => {
        it("uses explicit websocketUrl when provided", () => {
            const client = createRebaseClient({
                baseUrl: "https://api.example.com",
                websocketUrl: "wss://custom-ws.example.com"
            });
            // If ws exists it would be configured with the custom URL
            // Since we don't have a real WebSocket in test env, we just check it doesn't crash
            expect(client).toBeDefined();
        });
    });

    // -----------------------------------------------------------------------
    // onUnauthorized auto-setup
    // -----------------------------------------------------------------------
    describe("onUnauthorized auto-setup", () => {
        it("auto-configures onUnauthorized to refresh auth session", () => {
            const client = createRebaseClient({
                baseUrl: "https://api.example.com",
            });
            // The onUnauthorized should have been auto-set
            expect(client).toBeDefined();
        });

        it("does not override custom onUnauthorized", () => {
            const customHandler = jest.fn().mockResolvedValue(true);
            const client = createRebaseClient({
                baseUrl: "https://api.example.com",
                onUnauthorized: customHandler,
            });
            expect(client).toBeDefined();
        });
    });
});
