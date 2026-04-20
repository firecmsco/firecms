import { describe, expect, test, jest, beforeEach, afterEach } from "@jest/globals";
import { buildAdminApi } from "../src/api/admin_api";

// ─── Mock fetch ────────────────────────────────────────────────────

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
(global as any).fetch = mockFetch;

const mockGetToken = jest.fn().mockResolvedValue("test-token-123") as jest.MockedFunction<() => Promise<string>>;
const TEST_HOST = "https://api.test.firecms.co";
const TEST_PROJECT = "test-project-id";

function mockJsonResponse(data: any, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 200 ? "OK" : "Error",
        json: () => Promise.resolve(data),
    } as Response;
}

describe("Admin API Client", () => {

    let api: ReturnType<typeof buildAdminApi>;

    beforeEach(() => {
        jest.clearAllMocks();
        api = buildAdminApi(TEST_HOST, mockGetToken);
    });

    // ─── listCollections ───────────────────────────────────────

    describe("listCollections", () => {
        test("calls correct endpoint for root collections", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ collections: ["users", "products"] })
            );

            const result = await api.listCollections(TEST_PROJECT);

            expect(mockGetToken).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                `${TEST_HOST}/projects/${TEST_PROJECT}/admin/collections/list`,
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        Authorization: "Bearer test-token-123",
                        "Content-Type": "application/json",
                    }),
                })
            );
            expect(result.collections).toEqual(["users", "products"]);
        });

        test("sends parentDocumentPath for subcollections", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ collections: ["subcol1"] })
            );

            await api.listCollections(TEST_PROJECT, "users/user1");

            const body = JSON.parse(
                (mockFetch.mock.calls[0][1] as RequestInit).body as string
            );
            expect(body.parentDocumentPath).toBe("users/user1");
        });

        test("sends databaseId when provided", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ collections: [] })
            );

            await api.listCollections(TEST_PROJECT, undefined, "my-database");

            const body = JSON.parse(
                (mockFetch.mock.calls[0][1] as RequestInit).body as string
            );
            expect(body.databaseId).toBe("my-database");
        });
    });

    // ─── queryDocuments ────────────────────────────────────────

    describe("queryDocuments", () => {
        test("sends full query params", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({
                    documents: [{ id: "doc1", path: "col/doc1", values: {} }],
                    hasMore: false,
                })
            );

            const result = await api.queryDocuments(TEST_PROJECT, {
                path: "users",
                filters: [{ field: "age", op: ">=", value: 18 }],
                orderBy: "age",
                orderDirection: "desc",
                limit: 10,
            });

            const body = JSON.parse(
                (mockFetch.mock.calls[0][1] as RequestInit).body as string
            );
            expect(body.path).toBe("users");
            expect(body.filters).toEqual([{ field: "age", op: ">=", value: 18 }]);
            expect(body.orderBy).toBe("age");
            expect(body.orderDirection).toBe("desc");
            expect(body.limit).toBe(10);
            expect(result.hasMore).toBe(false);
            expect(result.documents).toHaveLength(1);
        });

        test("calls correct admin endpoint", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ documents: [], hasMore: false })
            );

            await api.queryDocuments(TEST_PROJECT, { path: "test" });

            expect(mockFetch).toHaveBeenCalledWith(
                `${TEST_HOST}/projects/${TEST_PROJECT}/admin/documents/query`,
                expect.anything()
            );
        });
    });

    // ─── batchWrite ────────────────────────────────────────────

    describe("batchWrite", () => {
        test("sends batch operations correctly", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({
                    totalOperations: 2,
                    batchesCompleted: 1,
                    totalBatches: 1,
                    failures: [],
                })
            );

            const result = await api.batchWrite(TEST_PROJECT, [
                { type: "set", path: "col", documentId: "d1", data: { a: 1 } },
                { type: "delete", path: "col", documentId: "d2" },
            ]);

            const body = JSON.parse(
                (mockFetch.mock.calls[0][1] as RequestInit).body as string
            );
            expect(body.operations).toHaveLength(2);
            expect(body.operations[0].type).toBe("set");
            expect(body.operations[1].type).toBe("delete");
            expect(result.totalOperations).toBe(2);
            expect(result.failures).toHaveLength(0);
        });

        test("calls correct admin endpoint", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ totalOperations: 0, batchesCompleted: 0, totalBatches: 0, failures: [] })
            );

            await api.batchWrite(TEST_PROJECT, []);

            expect(mockFetch).toHaveBeenCalledWith(
                `${TEST_HOST}/projects/${TEST_PROJECT}/admin/documents/batch_write`,
                expect.anything()
            );
        });
    });

    // ─── readDocumentAtTime ────────────────────────────────────

    describe("readDocumentAtTime", () => {
        test("sends readTime as string", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ id: "doc1", path: "col/doc1", values: { old: true } })
            );

            const result = await api.readDocumentAtTime(
                TEST_PROJECT, "col", "doc1", "2024-01-15T10:00:00Z"
            );

            const body = JSON.parse(
                (mockFetch.mock.calls[0][1] as RequestInit).body as string
            );
            expect(body.readTime).toBe("2024-01-15T10:00:00Z");
            expect(body.path).toBe("col");
            expect(body.documentId).toBe("doc1");
            expect(result?.values.old).toBe(true);
        });

        test("returns null on 404", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found",
                json: () => Promise.resolve({ error: "Not found" }),
            } as Response);

            const result = await api.readDocumentAtTime(
                TEST_PROJECT, "col", "doc1", "2024-01-15T10:00:00Z"
            );

            expect(result).toBeNull();
        });
    });

    // ─── listDocuments (existing endpoint) ─────────────────────

    describe("listDocuments", () => {
        test("calls the documents/list endpoint (not admin)", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ documents: [] })
            );

            await api.listDocuments(TEST_PROJECT, "users", { limit: 25 });

            expect(mockFetch).toHaveBeenCalledWith(
                `${TEST_HOST}/projects/${TEST_PROJECT}/documents/list`,
                expect.anything()
            );

            const body = JSON.parse(
                (mockFetch.mock.calls[0][1] as RequestInit).body as string
            );
            expect(body.path).toBe("users");
            expect(body.limit).toBe(25);
        });
    });

    // ─── Auth endpoints ────────────────────────────────────────

    describe("listAuthUsers", () => {
        test("calls GET with query params", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ users: [{ uid: "u1" }], pageToken: "next" })
            );

            const result = await api.listAuthUsers(TEST_PROJECT, 50, "token123");

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`${TEST_HOST}/projects/${TEST_PROJECT}/admin/auth/users`),
                expect.objectContaining({ method: "GET" })
            );
            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain("maxResults=50");
            expect(url).toContain("pageToken=token123");
            expect(result.users).toHaveLength(1);
            expect(result.pageToken).toBe("next");
        });
    });

    describe("setCustomClaims", () => {
        test("sends claims in body", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ uid: "u1", customClaims: { admin: true } })
            );

            await api.setCustomClaims(TEST_PROJECT, "u1", { admin: true });

            expect(mockFetch).toHaveBeenCalledWith(
                `${TEST_HOST}/projects/${TEST_PROJECT}/admin/auth/users/u1/claims`,
                expect.objectContaining({ method: "PATCH" })
            );
            const body = JSON.parse(
                (mockFetch.mock.calls[0][1] as RequestInit).body as string
            );
            expect(body.claims).toEqual({ admin: true });
        });
    });

    describe("deleteAuthUser", () => {
        test("calls DELETE method", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ success: true })
            );

            const result = await api.deleteAuthUser(TEST_PROJECT, "u1");

            expect(mockFetch).toHaveBeenCalledWith(
                `${TEST_HOST}/projects/${TEST_PROJECT}/admin/auth/users/u1`,
                expect.objectContaining({ method: "DELETE" })
            );
            expect(result.success).toBe(true);
        });
    });

    // ─── Error handling ────────────────────────────────────────

    describe("error handling", () => {
        test("throws on non-ok response", async () => {
            mockFetch.mockResolvedValueOnce(
                mockJsonResponse({ error: "Forbidden" }, 403)
            );

            await expect(
                api.listCollections(TEST_PROJECT)
            ).rejects.toThrow("Forbidden");
        });

        test("throws with statusText on unparseable error", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: "Internal Server Error",
                json: () => Promise.reject(new Error("parse error")),
            } as Response);

            await expect(
                api.listCollections(TEST_PROJECT)
            ).rejects.toThrow("Internal Server Error");
        });
    });
});
