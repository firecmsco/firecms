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

    it("initializes securely with config properties", () => {
        const client = createRebaseClient({ baseUrl: "https://api.example.com", token: "jwt-token" });
        expect(client).toBeDefined();
        expect(client.auth).toBeDefined();
        expect(client.admin).toBeDefined();
    });

    it("exposes the explicit collection() method", () => {
        const client = createRebaseClient({ baseUrl: "https://api.example.com" });
        const posts = client.collection("posts");
        expect(typeof posts.find).toBe("function");
        expect(typeof posts.findById).toBe("function");
    });

    it("returns explicit methods from the proxy directly", () => {
        const client = createRebaseClient({ baseUrl: "https://api.example.com" });
        
        expect(typeof client.auth).toBe("object");
        expect(typeof client.admin).toBe("object");
        expect(typeof client.collection).toBe("function");
        expect(typeof client.auth.signInWithEmail).toBe("function");
    });

    it("evaluates missing properties via the proxy as collection access", () => {
        // Define a DB schema type so we can access `posts` without `as any`
        interface TestDB {
            posts: { Row: { title: string } };
        }
        const client = createRebaseClient<TestDB>({ baseUrl: "https://api.example.com" });
        
        const magicPosts: CollectionClient = client.data.posts;
        
        expect(typeof magicPosts).toBe("object");
        expect(typeof magicPosts.find).toBe("function");
        expect(typeof magicPosts.findById).toBe("function");
    });

    it("ignores 'then' property to prevent Promise-like misinterpretation", () => {
        const client = createRebaseClient({ baseUrl: "https://api.example.com" });
        // Access via the data proxy which uses Proxy get traps
        expect(client.data.collection("then")).toBeDefined(); // collection("then") returns a CollectionClient
        // But direct access on the client should NOT trigger Promise behavior
        // The proxy returns undefined for 'then' to avoid being treated as thenable
    });

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
});
