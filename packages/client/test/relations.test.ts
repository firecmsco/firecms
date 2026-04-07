import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createCollectionClient, CollectionClient } from "../src/collection";
import { createRebaseClient } from "../src/index";
import { Transport, buildQueryString } from "../src/transport";
import { QueryBuilder } from "../src/query_builder";

// ==========================================================================
// Helpers
// ==========================================================================

interface PostModel { title: string; body?: string; author_id?: number; author?: any; tags?: any[]; category?: any; }

function createMockTransport(): { transport: Transport; mockRequest: jest.Mock<Transport["request"]> } {
    const mockRequest = jest.fn() as jest.Mock<Transport["request"]>;
    const transport: Transport = {
        request: mockRequest, baseUrl: "http://localhost", apiPath: "/api/v1",
        fetchFn: globalThis.fetch, setToken: jest.fn(), setAuthTokenGetter: jest.fn(),
        getHeaders: jest.fn().mockReturnValue({}), resolveToken: jest.fn().mockResolvedValue(null)
    };
    return { transport, mockRequest };
}

function mockFindResponse(data: any[], meta?: any) {
    return { data, meta: meta ?? { total: data.length, limit: 20, offset: 0, hasMore: false } };
}

// ==========================================================================
// 1. buildQueryString — include serialization
// ==========================================================================
describe("buildQueryString — include", () => {
    it("single relation", () => expect(buildQueryString({ include: ["author"] })).toBe("?include=author"));
    it("multiple relations comma-separated", () => expect(buildQueryString({ include: ["author", "tags", "category"] })).toBe("?include=author%2Ctags%2Ccategory"));
    it("wildcard *", () => expect(buildQueryString({ include: ["*"] })).toBe("?include=*"));
    it("empty array omitted", () => expect(buildQueryString({ include: [] })).toBe(""));
    it("undefined params", () => expect(buildQueryString(undefined)).toBe(""));
    it("empty params", () => expect(buildQueryString({})).toBe(""));
    it("include + limit + offset + orderBy", () => {
        const qs = buildQueryString({ limit: 10, offset: 0, include: ["author", "tags"], orderBy: "created_at:desc" });
        expect(qs).toContain("limit=10"); expect(qs).toContain("offset=0");
        expect(qs).toContain("include=author%2Ctags"); expect(qs).toContain("orderBy=created_at%3Adesc");
    });
    it("include + where", () => {
        const qs = buildQueryString({ include: ["author"], where: { status: "eq.published" } });
        expect(qs).toContain("include=author"); expect(qs).toContain("status=eq.published");
    });
    it("include + page", () => {
        const qs = buildQueryString({ include: ["tags"], page: 3 });
        expect(qs).toContain("include=tags"); expect(qs).toContain("page=3");
    });
    it("include + multiple where conditions", () => {
        const qs = buildQueryString({ include: ["author"], where: { status: "eq.active", age: "gte.18" } });
        expect(qs).toContain("include=author"); expect(qs).toContain("status=eq.active"); expect(qs).toContain("age=gte.18");
    });
    // BUG: searchString is silently dropped
    it("BUG: searchString is NOT serialized", () => {
        expect(buildQueryString({ searchString: "hello" })).toBe("");
    });
    it("BUG: searchString + include loses searchString", () => {
        expect(buildQueryString({ searchString: "test", include: ["author"] })).toBe("?include=author");
    });
});

// ==========================================================================
// 2. find() — include query string passthrough
// ==========================================================================
describe("find() — include passthrough", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("single include", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.find({ include: ["author"] });
        expect(mockRequest).toHaveBeenCalledWith("/data/posts?include=author", { method: "GET" });
    });
    it("multiple includes", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.find({ include: ["author", "tags", "category"] });
        expect(mockRequest).toHaveBeenCalledWith("/data/posts?include=author%2Ctags%2Ccategory", { method: "GET" });
    });
    it("wildcard include", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.find({ include: ["*"] });
        expect(mockRequest).toHaveBeenCalledWith("/data/posts?include=*", { method: "GET" });
    });
    it("no include omits param", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.find({ limit: 10 });
        expect((mockRequest.mock.calls[0][0] as string)).not.toContain("include");
    });
    it("no params at all", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.find();
        expect(mockRequest).toHaveBeenCalledWith("/data/posts", { method: "GET" });
    });
    it("include + limit + offset + orderBy + where combined", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.find({ limit: 5, offset: 10, orderBy: "title:asc", include: ["author"], where: { status: "eq.published" } });
        const p = mockRequest.mock.calls[0][0] as string;
        expect(p).toContain("limit=5"); expect(p).toContain("offset=10");
        expect(p).toContain("orderBy=title%3Aasc"); expect(p).toContain("include=author"); expect(p).toContain("status=eq.published");
    });
    it("empty include array omits param", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.find({ include: [] });
        expect((mockRequest.mock.calls[0][0] as string)).not.toContain("include");
    });
});

// ==========================================================================
// 3. find() — response handling: one-to-one relations
// ==========================================================================
describe("find() — one-to-one relation response", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("preserves relation object in values", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([
            { id: 1, title: "Hello", author_id: 5, author: { id: 5, name: "Alice", email: "a@b.com" } }
        ]));
        const r = await c.find({ include: ["author"] });
        expect(r.data[0].id).toBe(1); expect(r.data[0].path).toBe("posts");
        expect(r.data[0].values.author).toEqual({ id: 5, name: "Alice", email: "a@b.com" });
        expect(r.data[0].values.title).toBe("Hello"); expect(r.data[0].values.author_id).toBe(5);
    });
    it("null relation", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 1, title: "Solo", author: null }]));
        const r = await c.find({ include: ["author"] });
        expect(r.data[0].values.author).toBeNull();
    });
    it("missing relation field entirely", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 1, title: "Minimal" }]));
        const r = await c.find({ include: ["author"] });
        expect(r.data[0].values.author).toBeUndefined();
    });
    it("relation with nested objects preserved", async () => {
        const c = createCollectionClient<any>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([
            { id: 1, title: "Deep", author: { id: 5, name: "X", address: { city: "NYC", zip: "10001" } } }
        ]));
        const r = await c.find({ include: ["author"] });
        expect(r.data[0].values.author.address).toEqual({ city: "NYC", zip: "10001" });
    });
    it("relation with date strings preserved", async () => {
        const c = createCollectionClient<any>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([
            { id: 1, title: "P", author: { id: 5, created_at: "2024-01-15T10:30:00Z" } }
        ]));
        const r = await c.find({ include: ["author"] });
        expect(r.data[0].values.author.created_at).toBe("2024-01-15T10:30:00Z");
    });
    it("relation with all extra fields preserved", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([
            { id: 1, title: "P", author: { id: 5, name: "A", email: "a@b", bio: "dev", avatar: "url", count: 42 } }
        ]));
        const a = (await c.find({ include: ["author"] })).data[0].values.author;
        expect(a.bio).toBe("dev"); expect(a.avatar).toBe("url"); expect(a.count).toBe(42);
    });
});

// ==========================================================================
// 4. find() — response handling: one-to-many relations
// ==========================================================================
describe("find() — one-to-many relation response", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("preserves array of related entities", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([
            { id: 1, title: "P", tags: [{ id: 10, name: "ts" }, { id: 20, name: "js" }] }
        ]));
        const r = await c.find({ include: ["tags"] });
        expect(r.data[0].values.tags).toHaveLength(2);
        expect(r.data[0].values.tags[0]).toEqual({ id: 10, name: "ts" });
    });
    it("empty array", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 1, title: "P", tags: [] }]));
        expect((await c.find({ include: ["tags"] })).data[0].values.tags).toEqual([]);
    });
    it("large array (50 items)", async () => {
        const tags = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `tag-${i + 1}` }));
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 1, title: "Many", tags }]));
        const r = await c.find({ include: ["tags"] });
        expect(r.data[0].values.tags).toHaveLength(50);
        expect(r.data[0].values.tags[49]).toEqual({ id: 50, name: "tag-50" });
    });
});

// ==========================================================================
// 5. find() — multiple relations simultaneously
// ==========================================================================
describe("find() — multiple relations", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("preserves all relation types together", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{
            id: 1, title: "Multi", author: { id: 5, name: "Bob" },
            tags: [{ id: 10, name: "react" }, { id: 11, name: "next" }], category: { id: 3, name: "Tech" }
        }]));
        const p = (await c.find({ include: ["author", "tags", "category"] })).data[0];
        expect(p.values.author).toEqual({ id: 5, name: "Bob" });
        expect(p.values.tags).toHaveLength(2);
        expect(p.values.category).toEqual({ id: 3, name: "Tech" });
    });
    it("mixed states: some have relations, some don't", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([
            { id: 1, title: "Full", author: { id: 5, name: "A" }, tags: [{ id: 10, name: "ts" }] },
            { id: 2, title: "Partial", author: null, tags: [] },
            { id: 3, title: "Bare" }
        ]));
        const r = await c.find({ include: ["author", "tags"] });
        expect(r.data[0].values.author).toEqual({ id: 5, name: "A" });
        expect(r.data[0].values.tags).toHaveLength(1);
        expect(r.data[1].values.author).toBeNull();
        expect(r.data[1].values.tags).toEqual([]);
        expect(r.data[2].values.author).toBeUndefined();
        expect(r.data[2].values.tags).toBeUndefined();
    });
    it("relation objects not confused with regular map fields", async () => {
        const c = createCollectionClient<any>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([
            { id: 1, title: "P", metadata: { views: 100, likes: 50 }, author: { id: 5, name: "A" } }
        ]));
        const r = await c.find({ include: ["author"] });
        expect(r.data[0].values.metadata).toEqual({ views: 100, likes: 50 });
        expect(r.data[0].values.author).toEqual({ id: 5, name: "A" });
    });
});

// ==========================================================================
// 6. find() — ID types with relations
// ==========================================================================
describe("find() — ID types in relations", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("string UUIDs", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([
            { id: "uuid-1", title: "P", author: { id: "uuid-2", name: "A" } }
        ]));
        const r = await c.find({ include: ["author"] });
        expect(r.data[0].id).toBe("uuid-1"); expect(r.data[0].values.author.id).toBe("uuid-2");
    });
    it("numeric IDs", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 42, title: "P", author: { id: 7, name: "A" } }]));
        const r = await c.find({ include: ["author"] });
        expect(r.data[0].id).toBe(42); expect(r.data[0].values.author.id).toBe(7);
    });
    it("zero ID", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 0, title: "P" }]));
        const r = await c.find();
        expect(r.data[0].id).toBe(0);
    });
});

// ==========================================================================
// 7. find() — without include (regression)
// ==========================================================================
describe("find() — without include", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("wraps entities correctly", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 1, title: "Plain", author_id: 5 }]));
        expect((await c.find()).data[0]).toEqual({ id: 1, path: "posts", values: { title: "Plain", author_id: 5 } });
    });
    it("handles undefined data gracefully", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({ data: undefined, meta: {} });
        expect((await c.find()).data).toEqual([]);
    });
    it("handles empty data array", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        expect((await c.find()).data).toEqual([]);
    });
});

// ==========================================================================
// 8. findById() — relation data
// ==========================================================================
describe("findById() — relation data", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("preserves one-to-one relation in values", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({ id: 1, title: "Hi", author: { id: 5, name: "A" } });
        const r = await c.findById(1);
        expect(r!.values.author).toEqual({ id: 5, name: "A" });
    });
    it("preserves array relation in values", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({ id: "abc", title: "T", tags: [{ id: 1, name: "r" }, { id: 2, name: "v" }] });
        const r = await c.findById("abc");
        expect(r!.id).toBe("abc"); expect(r!.values.tags).toHaveLength(2);
    });
    it("null relation", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({ id: 1, title: "S", author: null });
        expect((await c.findById(1))!.values.author).toBeNull();
    });
    it("returns undefined for null backend response", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(null);
        expect(await c.findById(99)).toBeUndefined();
    });
    it("encodes special ID characters", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({ id: "a/b", title: "E" });
        await c.findById("a/b");
        expect(mockRequest).toHaveBeenCalledWith("/data/posts/a%2Fb", { method: "GET" });
    });
    it("BUG: no include support on findById", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({ id: 1, title: "T" });
        await c.findById(1);
        expect((mockRequest.mock.calls[0][0] as string)).toBe("/data/posts/1");
        expect((mockRequest.mock.calls[0][0] as string)).not.toContain("include");
    });
});

// ==========================================================================
// 9. create/update — relation fields
// ==========================================================================
describe("create/update — relation fields", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("create sends FK, preserves relation in response", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({ id: 1, title: "New", author_id: 5, author: { id: 5, name: "A" } });
        const r = await c.create({ title: "New", author_id: 5 });
        expect(r.values.author_id).toBe(5); expect(r.values.author).toEqual({ id: 5, name: "A" });
        expect(mockRequest).toHaveBeenCalledWith("/data/posts", { method: "POST", body: JSON.stringify({ title: "New", author_id: 5 }) });
    });
    it("create with explicit ID puts id in body", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({ id: "custom", title: "C" });
        await c.create({ title: "C" }, "custom");
        expect(JSON.parse(mockRequest.mock.calls[0][1]!.body as string).id).toBe("custom");
    });
    it("update preserves relation data in response", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({ id: 1, title: "U", author_id: 10, author: { id: 10, name: "B" } });
        const r = await c.update(1, { author_id: 10 });
        expect(r.values.author_id).toBe(10); expect(r.values.author).toEqual({ id: 10, name: "B" });
    });
    it("update encodes special chars in ID", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({ id: "x/y", title: "U" });
        await c.update("x/y", { title: "U" });
        expect(mockRequest).toHaveBeenCalledWith("/data/posts/x%2Fy", expect.any(Object));
    });
    it("delete calls correct endpoint", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(undefined);
        await c.delete(42);
        expect(mockRequest).toHaveBeenCalledWith("/data/posts/42", { method: "DELETE" });
    });
});

// ==========================================================================
// 10. QueryBuilder.include() — chaining & execution
// ==========================================================================
describe("QueryBuilder.include()", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("passes include to find()", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.include("author", "tags").find();
        expect((mockRequest.mock.calls[0][0] as string)).toContain("include=author%2Ctags");
    });
    it("wildcard *", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.include("*").find();
        expect((mockRequest.mock.calls[0][0] as string)).toContain("include=*");
    });
    it("chains with where + limit", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 1, title: "F", author: { id: 5, name: "A" } }]));
        const r = await c.where("status", "==", "published").include("author").limit(5).find();
        const p = mockRequest.mock.calls[0][0] as string;
        expect(p).toContain("include=author"); expect(p).toContain("limit=5"); expect(p).toContain("status=published");
        expect(r.data[0].values.author).toEqual({ id: 5, name: "A" });
    });
    it("second include() overrides first", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.include("author").include("tags").find();
        const p = mockRequest.mock.calls[0][0] as string;
        expect(p).toContain("include=tags"); expect(p).not.toContain("author");
    });
    it("include + orderBy", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.include("author").orderBy("title", "desc").find();
        const p = mockRequest.mock.calls[0][0] as string;
        expect(p).toContain("include=author"); expect(p).toContain("orderBy=title%3Adesc");
    });
    it("include + offset", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.include("tags").offset(20).find();
        const p = mockRequest.mock.calls[0][0] as string;
        expect(p).toContain("include=tags"); expect(p).toContain("offset=20");
    });
    it("include + search (searchString bug: not serialized)", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.search("hello").include("author").find();
        const p = mockRequest.mock.calls[0][0] as string;
        expect(p).toContain("include=author");
        // BUG: searchString is NOT in the URL
    });
    it("full chain: where → orderBy → limit → offset → include", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.where("status", "==", "active").orderBy("title", "asc").limit(25).offset(50).include("author").find();
        const p = mockRequest.mock.calls[0][0] as string;
        expect(p).toContain("status=active"); expect(p).toContain("orderBy=title%3Aasc");
        expect(p).toContain("limit=25"); expect(p).toContain("offset=50"); expect(p).toContain("include=author");
    });
    it("all fluent methods return this for chaining", () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        const qb = c.where("title", "==", "x");
        expect(qb.orderBy("title")).toBe(qb); expect(qb.limit(1)).toBe(qb);
        expect(qb.offset(1)).toBe(qb); expect(qb.search("x")).toBe(qb); expect(qb.include("r")).toBe(qb);
    });
    it("BUG: QueryBuilder has no findById", () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        expect((c.include("author") as any).findById).toBeUndefined();
    });
});

// ==========================================================================
// 11. listen() — include behavior
// ==========================================================================
describe("listen() — include", () => {
    it("throws without websocket", () => {
        const { transport } = createMockTransport();
        const c = createCollectionClient<PostModel>(transport, "posts");
        expect(() => c.include("author").listen(jest.fn())).toThrow("Listen is only available");
    });
    it("listen is undefined without ws", () => {
        const { transport } = createMockTransport();
        expect(createCollectionClient<PostModel>(transport, "posts").listen).toBeUndefined();
    });
    it("BUG: include dropped in WS subscription", () => {
        const mockWs = { listenCollection: jest.fn().mockReturnValue(() => {}), listenEntity: jest.fn().mockReturnValue(() => {}) } as any;
        const { transport } = createMockTransport();
        const c = createCollectionClient<PostModel>(transport, "posts", mockWs);
        c.listen!({ include: ["author"], limit: 10 }, jest.fn());
        expect(mockWs.listenCollection.mock.calls[0][0].include).toBeUndefined();
        expect(mockWs.listenCollection.mock.calls[0][0].path).toBe("posts");
        expect(mockWs.listenCollection.mock.calls[0][0].limit).toBe(10);
    });
    it("listen passes searchString to WS", () => {
        const mockWs = { listenCollection: jest.fn().mockReturnValue(() => {}), listenEntity: jest.fn().mockReturnValue(() => {}) } as any;
        const { transport } = createMockTransport();
        const c = createCollectionClient<PostModel>(transport, "posts", mockWs);
        c.listen!({ searchString: "hello" }, jest.fn());
        expect(mockWs.listenCollection.mock.calls[0][0].searchString).toBe("hello");
    });
    it("listen parses orderBy correctly", () => {
        const mockWs = { listenCollection: jest.fn().mockReturnValue(() => {}), listenEntity: jest.fn().mockReturnValue(() => {}) } as any;
        const { transport } = createMockTransport();
        const c = createCollectionClient<PostModel>(transport, "posts", mockWs);
        c.listen!({ orderBy: "title:desc" }, jest.fn());
        const args = mockWs.listenCollection.mock.calls[0][0];
        expect(args.orderBy).toBe("title"); expect(args.order).toBe("desc");
    });
    it("listen returns unsubscribe function", () => {
        const unsub = jest.fn();
        const mockWs = { listenCollection: jest.fn().mockReturnValue(unsub), listenEntity: jest.fn().mockReturnValue(() => {}) } as any;
        const { transport } = createMockTransport();
        const c = createCollectionClient<PostModel>(transport, "posts", mockWs);
        expect(c.listen!({}, jest.fn())).toBe(unsub);
    });
    it("listenById passes correct args", () => {
        const mockWs = { listenCollection: jest.fn().mockReturnValue(() => {}), listenEntity: jest.fn().mockReturnValue(() => {}) } as any;
        const { transport } = createMockTransport();
        const c = createCollectionClient<PostModel>(transport, "posts", mockWs);
        c.listenById!("abc", jest.fn());
        expect(mockWs.listenEntity).toHaveBeenCalledWith({ path: "posts", entityId: "abc" }, expect.any(Function), undefined);
    });
    it("listenById converts null to undefined", () => {
        let cb: any;
        const mockWs = { listenCollection: jest.fn().mockReturnValue(() => {}), listenEntity: jest.fn().mockImplementation((_, c) => { cb = c; return () => {}; }) } as any;
        const { transport } = createMockTransport();
        const c = createCollectionClient<PostModel>(transport, "posts", mockWs);
        const onUpdate = jest.fn();
        c.listenById!("x", onUpdate);
        cb(null);
        expect(onUpdate).toHaveBeenCalledWith(undefined);
    });
});

// ==========================================================================
// 12. Pagination with include
// ==========================================================================
describe("Pagination with include", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("page 1", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse(
            [{ id: 1, title: "A", author: { id: 5, name: "X" } }, { id: 2, title: "B", author: { id: 6, name: "Y" } }],
            { total: 10, limit: 2, offset: 0, hasMore: true }
        ));
        const r = await c.include("author").limit(2).offset(0).find();
        expect(r.data).toHaveLength(2); expect(r.meta.hasMore).toBe(true);
        expect(r.data[0].values.author).toEqual({ id: 5, name: "X" });
    });
    it("page 2", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse(
            [{ id: 3, title: "C", author: { id: 7, name: "Z" } }, { id: 4, title: "D", author: null }],
            { total: 10, limit: 2, offset: 2, hasMore: true }
        ));
        const r = await c.include("author").limit(2).offset(2).find();
        expect(r.data[0].values.author).toEqual({ id: 7, name: "Z" });
        expect(r.data[1].values.author).toBeNull();
    });
});

// ==========================================================================
// 13. E2E via createRebaseClient
// ==========================================================================
describe("E2E — createRebaseClient + include", () => {
    it("full stack: data proxy → collection → transport → response", async () => {
        const fetchMock = jest.fn() as jest.Mock<typeof globalThis.fetch>;
        fetchMock.mockResolvedValueOnce({
            ok: true, status: 200,
            json: async () => mockFindResponse([
                { id: 1, title: "E2E", author: { id: 10, name: "Full" }, tags: [{ id: 100, name: "a" }, { id: 101, name: "b" }] }
            ])
        } as unknown as Response);
        const client = createRebaseClient({ baseUrl: "http://localhost:3100", fetch: fetchMock as any, websocketUrl: "" });
        const r = await client.data.posts.include("author", "tags").find();
        expect((fetchMock.mock.calls[0][0] as string)).toContain("include=author%2Ctags");
        expect(r.data).toHaveLength(1);
        expect(r.data[0].values.title).toBe("E2E");
        expect(r.data[0].values.author).toEqual({ id: 10, name: "Full" });
        expect(r.data[0].values.tags).toHaveLength(2);
    });
    it("collection caching: same slug returns same instance", () => {
        const client = createRebaseClient({ baseUrl: "http://localhost" });
        expect(client.collection("posts")).toBe(client.collection("posts"));
        expect(client.collection("posts")).not.toBe(client.collection("users"));
    });
    it("data proxy shorthand equals collection()", () => {
        const client = createRebaseClient({ baseUrl: "http://localhost" });
        expect(client.data.posts).toBe(client.data.collection("posts"));
    });
    it("top-level proxy shorthand", () => {
        const client = createRebaseClient({ baseUrl: "http://localhost" });
        expect(typeof (client as any).posts.find).toBe("function");
    });
});

// ==========================================================================
// 14. parseWhereFilter — exhaustive edge cases via listen
// ==========================================================================
describe("parseWhereFilter via listen", () => {
    function setup() {
        const mockWs = { listenCollection: jest.fn().mockReturnValue(() => {}), listenEntity: jest.fn().mockReturnValue(() => {}) } as any;
        const { transport } = createMockTransport();
        return { client: createCollectionClient<any>(transport, "posts", mockWs), mockWs };
    }
    it("eq", () => { const { client, mockWs } = setup(); client.listen!({ where: { status: "eq.published" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.status).toEqual(["==", "published"]); });
    it("neq", () => { const { client, mockWs } = setup(); client.listen!({ where: { status: "neq.draft" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.status).toEqual(["!=", "draft"]); });
    it("gt numeric", () => { const { client, mockWs } = setup(); client.listen!({ where: { count: "gt.5" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.count).toEqual([">", 5]); });
    it("gte", () => { const { client, mockWs } = setup(); client.listen!({ where: { count: "gte.10" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.count).toEqual([">=", 10]); });
    it("lt", () => { const { client, mockWs } = setup(); client.listen!({ where: { count: "lt.3" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.count).toEqual(["<", 3]); });
    it("lte", () => { const { client, mockWs } = setup(); client.listen!({ where: { count: "lte.0" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.count).toEqual(["<=", 0]); });
    it("in with parens", () => { const { client, mockWs } = setup(); client.listen!({ where: { status: "in.(active,pending)" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.status).toEqual(["in", ["active", "pending"]]); });
    it("nin with parens", () => { const { client, mockWs } = setup(); client.listen!({ where: { type: "nin.(a,b)" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.type).toEqual(["not-in", ["a", "b"]]); });
    it("cs (array-contains)", () => { const { client, mockWs } = setup(); client.listen!({ where: { tags: "cs.featured" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.tags).toEqual(["array-contains", "featured"]); });
    it("csa (array-contains-any)", () => { const { client, mockWs } = setup(); client.listen!({ where: { tags: "csa.(a,b,c)" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.tags).toEqual(["array-contains-any", ["a", "b", "c"]]); });
    it("boolean true", () => { const { client, mockWs } = setup(); client.listen!({ where: { active: "eq.true" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.active).toEqual(["==", true]); });
    it("boolean false", () => { const { client, mockWs } = setup(); client.listen!({ where: { active: "eq.false" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.active).toEqual(["==", false]); });
    it("null", () => { const { client, mockWs } = setup(); client.listen!({ where: { d: "eq.null" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.d).toEqual(["==", null]); });
    it("plain value = implicit eq", () => { const { client, mockWs } = setup(); client.listen!({ where: { status: "published" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.status).toEqual(["==", "published"]); });
    it("unknown op defaults to eq with full value", () => { const { client, mockWs } = setup(); client.listen!({ where: { x: "xyz.something" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.x).toEqual(["==", "xyz.something"]); });
    it("float value stays as number", () => { const { client, mockWs } = setup(); client.listen!({ where: { price: "gte.19.99" } }, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter.price[1]).toBe(19.99); });
    it("no where returns undefined filter", () => { const { client, mockWs } = setup(); client.listen!({}, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter).toBeUndefined(); });
    it("undefined params returns undefined filter", () => { const { client, mockWs } = setup(); client.listen!(undefined, jest.fn()); expect(mockWs.listenCollection.mock.calls[0][0].filter).toBeUndefined(); });
});

// ==========================================================================
// 15. Collection slug handling
// ==========================================================================
describe("Collection slug handling", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("uses slug in basePath", async () => {
        const c = createCollectionClient<any>(transport, "my_collection");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c.find();
        expect(mockRequest).toHaveBeenCalledWith("/data/my_collection", { method: "GET" });
    });
    it("slug appears in entity path", async () => {
        const c = createCollectionClient<any>(transport, "orders");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 1, total: 100 }]));
        expect((await c.find()).data[0].path).toBe("orders");
    });
    it("different slugs create independent paths", async () => {
        const c1 = createCollectionClient<any>(transport, "posts");
        const c2 = createCollectionClient<any>(transport, "users");
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        mockRequest.mockResolvedValueOnce(mockFindResponse([]));
        await c1.find(); await c2.find();
        expect(mockRequest.mock.calls[0][0]).toContain("/data/posts");
        expect(mockRequest.mock.calls[1][0]).toContain("/data/users");
    });
});

// ==========================================================================
// 16. QueryBuilder operator mapping
// ==========================================================================
describe("QueryBuilder operator mapping", () => {
    const { transport } = createMockTransport();
    function qb() { return new QueryBuilder(createCollectionClient<any>(transport, "t")); }

    it("== → eq (plain value)", () => { expect((qb().where("a", "==", 1) as any).params.where.a).toBe("1"); });
    it("!= → neq", () => { expect((qb().where("a", "!=", 1) as any).params.where.a).toBe("neq.1"); });
    it("> → gt", () => { expect((qb().where("a", ">", 1) as any).params.where.a).toBe("gt.1"); });
    it(">= → gte", () => { expect((qb().where("a", ">=", 1) as any).params.where.a).toBe("gte.1"); });
    it("< → lt", () => { expect((qb().where("a", "<", 1) as any).params.where.a).toBe("lt.1"); });
    it("<= → lte", () => { expect((qb().where("a", "<=", 1) as any).params.where.a).toBe("lte.1"); });
    it("array-contains → cs", () => { expect((qb().where("a", "array-contains", "x") as any).params.where.a).toBe("cs.x"); });
    it("array-contains-any → csa", () => { expect((qb().where("a", "array-contains-any", ["x", "y"]) as any).params.where.a).toBe("csa.(x,y)"); });
    it("not-in → nin", () => { expect((qb().where("a", "not-in", ["x", "y"]) as any).params.where.a).toBe("nin.(x,y)"); });
    it("in → in", () => { expect((qb().where("a", "in", ["x", "y"]) as any).params.where.a).toBe("in.(x,y)"); });
    it("null value", () => { expect((qb().where("a", "==", null) as any).params.where.a).toBe("null"); });
    it("boolean true", () => { expect((qb().where("a", "==", true) as any).params.where.a).toBe("true"); });
    it("boolean false", () => { expect((qb().where("a", "==", false) as any).params.where.a).toBe("false"); });
    it("empty string", () => { expect((qb().where("a", "==", "") as any).params.where.a).toBe(""); });
    it("zero", () => { expect((qb().where("a", "==", 0) as any).params.where.a).toBe("0"); });
    it("short ops pass through", () => { expect((qb().where("a", "gt", 5) as any).params.where.a).toBe("gt.5"); });
    it("multiple where conditions", () => {
        const p = (qb().where("a", "==", 1).where("b", ">", 2).where("c", "in", ["x"]) as any).params.where;
        expect(p.a).toBe("1"); expect(p.b).toBe("gt.2"); expect(p.c).toBe("in.(x)");
    });
});

// ==========================================================================
// 17. CMS Entity Relation shape — the __type: "relation" format
//     Backend's drizzleResultToEntity wraps relations as:
//     { __type: "relation", id, path, data: { id, path, values } }
//     But REST path (drizzleResultToRestRow) returns flat:
//     { id, name, email, ... }
//     The client SDK consumes the REST format. These tests verify
//     both formats are handled by rowToEntity.
// ==========================================================================
describe("CMS relation shape — __type: 'relation' format", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("REST format (flat object) preserved in values", async () => {
        // This is what drizzleResultToRestRow returns via the REST API
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{
            id: 1, title: "Post",
            author: { id: "5", name: "Alice", email: "a@b.com" }
        }]));
        const r = await c.find({ include: ["author"] });
        // REST format: flat object with id, no __type, no path, no data wrapper
        expect(r.data[0].values.author).toEqual({ id: "5", name: "Alice", email: "a@b.com" });
        expect(r.data[0].values.author.__type).toBeUndefined();
        expect(r.data[0].values.author.path).toBeUndefined();
    });

    it("CMS entity format (__type:relation) also preserved as-is (passthrough)", async () => {
        // If the backend somehow returns CMS-format relations through REST,
        // rowToEntity should still preserve them in values
        const c = createCollectionClient<any>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{
            id: 1, title: "Post",
            author: {
                __type: "relation",
                id: "5", path: "users",
                data: { id: "5", path: "users", values: { name: "Alice", email: "a@b.com" } }
            }
        }]));
        const r = await c.find({ include: ["author"] });
        // The SDK doesn't transform — it passes through whatever shape the backend sends
        expect(r.data[0].values.author.__type).toBe("relation");
        expect(r.data[0].values.author.data.values.name).toBe("Alice");
    });

    it("REST format: many-relation returns array of flat objects", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{
            id: 1, title: "Post",
            tags: [
                { id: "10", name: "ts", slug: "typescript" },
                { id: "20", name: "js", slug: "javascript" }
            ]
        }]));
        const r = await c.find({ include: ["tags"] });
        expect(r.data[0].values.tags[0].id).toBe("10");
        expect(r.data[0].values.tags[0].name).toBe("ts");
        expect(r.data[0].values.tags[0].__type).toBeUndefined();
    });

    it("CMS format: many-relation with __type:relation objects", async () => {
        const c = createCollectionClient<any>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{
            id: 1, title: "Post",
            tags: [
                { __type: "relation", id: "10", path: "tags", data: { id: "10", path: "tags", values: { name: "ts" } } },
                { __type: "relation", id: "20", path: "tags", data: { id: "20", path: "tags", values: { name: "js" } } }
            ]
        }]));
        const r = await c.find({ include: ["tags"] });
        expect(r.data[0].values.tags[0].__type).toBe("relation");
        expect(r.data[0].values.tags[0].data.values.name).toBe("ts");
    });

    it("REST format: id is always stringified by backend", async () => {
        // drizzleResultToRestRow does String(row[idInfo.fieldName])
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{
            id: "1", title: "Post",
            author: { id: "5", name: "Alice" }
        }]));
        const r = await c.find({ include: ["author"] });
        expect(typeof r.data[0].values.author.id).toBe("string");
    });
});

// ==========================================================================
// 18. Transport error handling during relation fetches
// ==========================================================================
describe("Transport errors during find with include", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("transport error propagates from find() with include", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockRejectedValueOnce(new Error("Network error"));
        await expect(c.find({ include: ["author"] })).rejects.toThrow("Network error");
    });
    it("transport error propagates from findById()", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockRejectedValueOnce(new Error("Not Found"));
        await expect(c.findById(999)).rejects.toThrow("Not Found");
    });
    it("transport error propagates from QueryBuilder.find()", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockRejectedValueOnce(new Error("500"));
        await expect(c.include("author").find()).rejects.toThrow("500");
    });
    it("transport error propagates from create()", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockRejectedValueOnce(new Error("Conflict"));
        await expect(c.create({ title: "X" })).rejects.toThrow("Conflict");
    });
    it("transport error propagates from update()", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockRejectedValueOnce(new Error("Not Found"));
        await expect(c.update(1, { title: "X" })).rejects.toThrow("Not Found");
    });
    it("transport error propagates from delete()", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockRejectedValueOnce(new Error("Forbidden"));
        await expect(c.delete(1)).rejects.toThrow("Forbidden");
    });
});

// ==========================================================================
// 19. BUG: count() not implemented in CollectionClient
// ==========================================================================
describe("BUG: count() not implemented", () => {
    it("count is not defined on CollectionClient", () => {
        const { transport } = createMockTransport();
        const c = createCollectionClient<PostModel>(transport, "posts");
        // CollectionAccessor type declares count?() as optional, but
        // createCollectionClient doesn't implement it
        expect((c as any).count).toBeUndefined();
    });
});

// ==========================================================================
// 20. Concurrent find calls with include
// ==========================================================================
describe("Concurrent find calls with include", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("multiple concurrent finds don't interfere", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest
            .mockResolvedValueOnce(mockFindResponse([{ id: 1, title: "A", author: { id: 5, name: "X" } }]))
            .mockResolvedValueOnce(mockFindResponse([{ id: 2, title: "B", tags: [{ id: 10, name: "y" }] }]));

        const [r1, r2] = await Promise.all([
            c.find({ include: ["author"] }),
            c.find({ include: ["tags"] })
        ]);

        expect(r1.data[0].values.author).toEqual({ id: 5, name: "X" });
        expect(r2.data[0].values.tags).toHaveLength(1);
        expect(mockRequest).toHaveBeenCalledTimes(2);
    });
});

// ==========================================================================
// 21. createRebaseClient — data proxy edge cases
// ==========================================================================
describe("createRebaseClient — data proxy edge cases", () => {
    it("accessing .then returns undefined (prevents accidental await)", () => {
        const client = createRebaseClient({ baseUrl: "http://localhost" });
        expect((client.data as any).then).toBeUndefined();
    });
    it("accessing .toJSON returns undefined", () => {
        const client = createRebaseClient({ baseUrl: "http://localhost" });
        expect((client.data as any).toJSON).toBeUndefined();
    });
    it("accessing .$$typeof returns undefined (React internal)", () => {
        const client = createRebaseClient({ baseUrl: "http://localhost" });
        expect((client.data as any).$$typeof).toBeUndefined();
    });
    it("symbol properties return undefined", () => {
        const client = createRebaseClient({ baseUrl: "http://localhost" });
        expect((client.data as any)[Symbol.toPrimitive]).toBeUndefined();
    });
    it("top-level proxy: .then returns undefined", () => {
        const client = createRebaseClient({ baseUrl: "http://localhost" });
        expect((client as any).then).toBeUndefined();
    });
});

// ==========================================================================
// 22. buildQueryString — param encoding edge cases
// ==========================================================================
describe("buildQueryString — encoding edge cases", () => {
    it("where value with special chars is encoded", () => {
        const qs = buildQueryString({ where: { email: "eq.user@test.com" } });
        expect(qs).toBe("?email=eq.user%40test.com");
    });
    it("where key with special chars is encoded", () => {
        const qs = buildQueryString({ where: { "user.name": "eq.alice" } });
        expect(qs).toContain("user.name=eq.alice");
    });
    it("orderBy with colon is encoded", () => {
        const qs = buildQueryString({ orderBy: "created_at:desc" });
        expect(qs).toBe("?orderBy=created_at%3Adesc");
    });
    it("include with dots in relation name", () => {
        const qs = buildQueryString({ include: ["author.profile"] });
        expect(qs).toContain("include=author.profile");
    });
    it("limit=0 is included", () => {
        const qs = buildQueryString({ limit: 0 });
        expect(qs).toBe("?limit=0");
    });
    it("offset=0 is included", () => {
        const qs = buildQueryString({ offset: 0 });
        expect(qs).toBe("?offset=0");
    });
    it("page=1", () => {
        const qs = buildQueryString({ page: 1 });
        expect(qs).toBe("?page=1");
    });
});

// ==========================================================================
// 23. rowToEntity — edge cases in id extraction
// ==========================================================================
describe("rowToEntity — id extraction edge cases", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("undefined id field", async () => {
        const c = createCollectionClient<any>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: undefined, title: "No ID" }]));
        const r = await c.find();
        expect(r.data[0].id).toBeUndefined();
    });
    it("empty string id", async () => {
        const c = createCollectionClient<any>(transport, "posts");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: "", title: "Empty" }]));
        const r = await c.find();
        expect(r.data[0].id).toBe("");
    });
    it("boolean values preserved in entity values", async () => {
        const c = createCollectionClient<any>(transport, "items");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 1, active: true, deleted: false }]));
        const r = await c.find();
        expect(r.data[0].values.active).toBe(true);
        expect(r.data[0].values.deleted).toBe(false);
    });
    it("null values preserved in entity values", async () => {
        const c = createCollectionClient<any>(transport, "items");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 1, description: null, count: 0 }]));
        const r = await c.find();
        expect(r.data[0].values.description).toBeNull();
        expect(r.data[0].values.count).toBe(0);
    });
    it("array values preserved in entity values", async () => {
        const c = createCollectionClient<any>(transport, "items");
        mockRequest.mockResolvedValueOnce(mockFindResponse([{ id: 1, labels: ["a", "b", "c"] }]));
        const r = await c.find();
        expect(r.data[0].values.labels).toEqual(["a", "b", "c"]);
    });
});

// ==========================================================================
// 24. E2E — createRebaseClient call() method
// ==========================================================================
describe("createRebaseClient — call()", () => {
    it("call() sends POST to custom endpoint", async () => {
        const fetchMock = jest.fn() as jest.Mock<typeof globalThis.fetch>;
        fetchMock.mockResolvedValueOnce({
            ok: true, status: 200,
            json: async () => ({ data: { result: "ok" } })
        } as unknown as Response);
        const client = createRebaseClient({ baseUrl: "http://localhost:3100", fetch: fetchMock as any, websocketUrl: "" });
        const result = await client.call("my-endpoint", { foo: "bar" });
        const calledUrl = fetchMock.mock.calls[0][0] as string;
        expect(calledUrl).toContain("/my-endpoint");
        expect(result).toEqual({ result: "ok" });
    });
    it("call() with leading slash", async () => {
        const fetchMock = jest.fn() as jest.Mock<typeof globalThis.fetch>;
        fetchMock.mockResolvedValueOnce({
            ok: true, status: 200,
            json: async () => ({ data: { ok: true } })
        } as unknown as Response);
        const client = createRebaseClient({ baseUrl: "http://localhost:3100", fetch: fetchMock as any, websocketUrl: "" });
        await client.call("/my-endpoint");
        const calledUrl = fetchMock.mock.calls[0][0] as string;
        // Should not double-slash
        expect(calledUrl).not.toContain("//my-endpoint");
    });
});

// ==========================================================================
// 25. QueryBuilder — fresh instance per chain
// ==========================================================================
describe("QueryBuilder — instance isolation", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("each fluent method from collection creates new QueryBuilder", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValue(mockFindResponse([]));

        const qb1 = c.where("status", "==", "active");
        const qb2 = c.where("status", "==", "draft");

        await qb1.find();
        await qb2.find();

        expect((mockRequest.mock.calls[0][0] as string)).toContain("status=active");
        expect((mockRequest.mock.calls[1][0] as string)).toContain("status=draft");
        // They should be independent
        expect((mockRequest.mock.calls[0][0] as string)).not.toContain("draft");
        expect((mockRequest.mock.calls[1][0] as string)).not.toContain("active");
    });

    it("include() from collection creates fresh builder each time", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValue(mockFindResponse([]));

        await c.include("author").find();
        await c.include("tags").find();

        expect((mockRequest.mock.calls[0][0] as string)).toContain("include=author");
        expect((mockRequest.mock.calls[0][0] as string)).not.toContain("tags");
        expect((mockRequest.mock.calls[1][0] as string)).toContain("include=tags");
        expect((mockRequest.mock.calls[1][0] as string)).not.toContain("author");
    });
});

// ==========================================================================
// 26. Meta passthrough
// ==========================================================================
describe("Meta passthrough", () => {
    let transport: Transport; let mockRequest: jest.Mock<Transport["request"]>;
    beforeEach(() => ({ transport, mockRequest } = createMockTransport()));

    it("meta values are passed through from backend", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({
            data: [{ id: 1, title: "P" }],
            meta: { total: 100, limit: 25, offset: 50, hasMore: true, customField: "extra" }
        });
        const r = await c.find({ include: ["author"] });
        expect(r.meta.total).toBe(100);
        expect(r.meta.limit).toBe(25);
        expect(r.meta.offset).toBe(50);
        expect(r.meta.hasMore).toBe(true);
        expect(r.meta.customField).toBe("extra");
    });
    it("empty meta is preserved", async () => {
        const c = createCollectionClient<PostModel>(transport, "posts");
        mockRequest.mockResolvedValueOnce({ data: [], meta: {} });
        const r = await c.find();
        expect(r.meta).toEqual({});
    });
});
