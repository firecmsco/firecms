import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createCollectionClient } from "../src/collection";
import { Transport } from "../src/transport";

describe("createCollectionClient", () => {
    let mockRequest: jest.Mock<any>;
    let transport: Transport;

    beforeEach(() => {
        mockRequest = jest.fn() as jest.Mock<any>;
        transport = {
            request: mockRequest,
            baseUrl: "http://localhost",
            apiPath: "/api/v1",
            fetchFn: globalThis.fetch,
            setToken: jest.fn()
        } as unknown as Transport;
    });

    it("exposes all CRUD methods", () => {
        const client = createCollectionClient(transport, "posts");
        expect(typeof client.find).toBe("function");
        expect(typeof client.findById).toBe("function");
        expect(typeof client.create).toBe("function");
        expect(typeof client.update).toBe("function");
        expect(typeof client.delete).toBe("function");
    });

    describe("find", () => {
        it("calls GET /slug with correct query parameters", async () => {
            const client = createCollectionClient(transport as any, "posts");
            mockRequest.mockResolvedValueOnce({ data: [{ id: 1 }], meta: { total: 1 } });

            const result = await client.find({ limit: 10, offset: 20 });
            
            expect(result).toEqual({ data: [{ id: 1 }], meta: { total: 1 } });
            expect(mockRequest).toHaveBeenCalledWith("/posts?limit=10&offset=20", { method: "GET" });
        });

        it("calls GET /slug without query string if no params are passed", async () => {
            const client = createCollectionClient(transport as any, "posts");
            mockRequest.mockResolvedValueOnce({ data: [] });

            await client.find();
            expect(mockRequest).toHaveBeenCalledWith("/posts", { method: "GET" });
        });
    });

    describe("findById", () => {
        it("calls GET /slug/id directly", async () => {
            const client = createCollectionClient(transport as any, "posts");
            mockRequest.mockResolvedValueOnce({ id: "123", title: "Test" });

            const result = await client.findById("123");
            expect(result).toEqual({ id: "123", title: "Test" });
            expect(mockRequest).toHaveBeenCalledWith("/posts/123", { method: "GET" });
        });

        it("URI encodes the ID", async () => {
            const client = createCollectionClient(transport as any, "posts");
            mockRequest.mockResolvedValueOnce({ id: "a/b" });

            await client.findById("a/b");
            expect(mockRequest).toHaveBeenCalledWith("/posts/a%2Fb", { method: "GET" });
        });
    });

    describe("create", () => {
        it("calls POST /slug with JSON body", async () => {
            const client = createCollectionClient(transport as any, "posts");
            mockRequest.mockResolvedValueOnce({ id: 1, title: "New" });

            const input = { title: "New" };
            const result = await client.create(input as any);

            expect(result).toEqual({ id: 1, title: "New" });
            expect(mockRequest).toHaveBeenCalledWith("/posts", { method: "POST", body: JSON.stringify(input) });
        });
    });

    describe("update", () => {
        it("calls PUT /slug/id with JSON body", async () => {
            const client = createCollectionClient(transport as any, "posts");
            mockRequest.mockResolvedValueOnce({ id: 1, title: "Updated" });

            const patch = { title: "Updated" };
            const result = await client.update(1, patch as any);

            expect(result).toEqual({ id: 1, title: "Updated" });
            expect(mockRequest).toHaveBeenCalledWith("/posts/1", { method: "PUT", body: JSON.stringify(patch) });
        });
    });

    describe("delete", () => {
        it("calls DELETE /slug/id", async () => {
            const client = createCollectionClient(transport as any, "posts");
            mockRequest.mockResolvedValueOnce(undefined);

            await client.delete(42);
            expect(mockRequest).toHaveBeenCalledWith("/posts/42", { method: "DELETE" });
        });
    });
});
