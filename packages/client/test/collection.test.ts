import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createCollectionClient } from "../src/collection";
import { Transport } from "../src/transport";

/** Shape of the mock "posts" model used across tests. */
interface PostModel {
    title: string;
}

describe("createCollectionClient", () => {
    let mockRequest: jest.Mock<Transport["request"]>;
    let transport: Transport;

    beforeEach(() => {
        mockRequest = jest.fn() as jest.Mock<Transport["request"]>;
        transport = {
            request: mockRequest,
            baseUrl: "http://localhost",
            apiPath: "/api/v1",
            fetchFn: globalThis.fetch,
            setToken: jest.fn(),
            setAuthTokenGetter: jest.fn(),
            getHeaders: jest.fn().mockReturnValue({}),
            resolveToken: jest.fn().mockResolvedValue(null)
        } as Transport;
    });

    it("exposes all CRUD methods", () => {
        const client = createCollectionClient<PostModel>(transport, "posts");
        expect(typeof client.find).toBe("function");
        expect(typeof client.findById).toBe("function");
        expect(typeof client.create).toBe("function");
        expect(typeof client.update).toBe("function");
        expect(typeof client.delete).toBe("function");
    });

    describe("find", () => {
        it("calls GET /slug with correct query parameters and wraps into Entity", async () => {
            const client = createCollectionClient<PostModel>(transport, "posts");
            mockRequest.mockResolvedValueOnce({ data: [{ id: 1, title: "Hello" }], meta: { total: 1, limit: 10, offset: 20, hasMore: false } });

            const result = await client.find({ limit: 10, offset: 20 });
            
            // Response should wrap flat rows into Entity<M> objects
            expect(result).toEqual({
                data: [{ id: 1, path: "posts", values: { title: "Hello" } }],
                meta: { total: 1, limit: 10, offset: 20, hasMore: false }
            });
            expect(mockRequest).toHaveBeenCalledWith("/data/posts?limit=10&offset=20", { method: "GET" });
        });

        it("calls GET /slug without query string if no params are passed", async () => {
            const client = createCollectionClient<PostModel>(transport, "posts");
            mockRequest.mockResolvedValueOnce({ data: [], meta: { total: 0, limit: 20, offset: 0, hasMore: false } });

            const result = await client.find();
            expect(result.data).toEqual([]);
            expect(mockRequest).toHaveBeenCalledWith("/data/posts", { method: "GET" });
        });
    });

    describe("findById", () => {
        it("calls GET /slug/id and wraps into Entity", async () => {
            const client = createCollectionClient<PostModel>(transport, "posts");
            mockRequest.mockResolvedValueOnce({ id: "123", title: "Test" });

            const result = await client.findById("123");
            expect(result).toEqual({ id: "123", path: "posts", values: { title: "Test" } });
            expect(mockRequest).toHaveBeenCalledWith("/data/posts/123", { method: "GET" });
        });

        it("returns undefined when backend returns falsy", async () => {
            const client = createCollectionClient<PostModel>(transport, "posts");
            mockRequest.mockResolvedValueOnce(null);

            const result = await client.findById("999");
            expect(result).toBeUndefined();
        });

        it("URI encodes the ID", async () => {
            const client = createCollectionClient<PostModel>(transport, "posts");
            mockRequest.mockResolvedValueOnce({ id: "a/b", title: "Encoded" });

            await client.findById("a/b");
            expect(mockRequest).toHaveBeenCalledWith("/data/posts/a%2Fb", { method: "GET" });
        });
    });

    describe("create", () => {
        it("calls POST /slug with JSON body and wraps response into Entity", async () => {
            const client = createCollectionClient<PostModel>(transport, "posts");
            mockRequest.mockResolvedValueOnce({ id: 1, title: "New" });

            const input: Partial<PostModel> = { title: "New" };
            const result = await client.create(input);

            expect(result).toEqual({ id: 1, path: "posts", values: { title: "New" } });
            expect(mockRequest).toHaveBeenCalledWith("/data/posts", { method: "POST", body: JSON.stringify(input) });
        });

        it("includes id in POST body when provided", async () => {
            const client = createCollectionClient<PostModel>(transport, "posts");
            mockRequest.mockResolvedValueOnce({ id: "custom-id", title: "Custom" });

            const input: Partial<PostModel> = { title: "Custom" };
            const result = await client.create(input, "custom-id");

            expect(result).toEqual({ id: "custom-id", path: "posts", values: { title: "Custom" } });
            expect(mockRequest).toHaveBeenCalledWith("/data/posts", {
                method: "POST",
                body: JSON.stringify({ title: "Custom", id: "custom-id" })
            });
        });
    });

    describe("update", () => {
        it("calls PUT /slug/id with JSON body and wraps response into Entity", async () => {
            const client = createCollectionClient<PostModel>(transport, "posts");
            mockRequest.mockResolvedValueOnce({ id: 1, title: "Updated" });

            const patch: Partial<PostModel> = { title: "Updated" };
            const result = await client.update(1, patch);

            expect(result).toEqual({ id: 1, path: "posts", values: { title: "Updated" } });
            expect(mockRequest).toHaveBeenCalledWith("/data/posts/1", { method: "PUT", body: JSON.stringify(patch) });
        });
    });

    describe("delete", () => {
        it("calls DELETE /slug/id", async () => {
            const client = createCollectionClient<PostModel>(transport, "posts");
            mockRequest.mockResolvedValueOnce(undefined);

            await client.delete(42);
            expect(mockRequest).toHaveBeenCalledWith("/data/posts/42", { method: "DELETE" });
        });
    });
});
