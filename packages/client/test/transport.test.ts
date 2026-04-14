import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createTransport, buildQueryString, RebaseApiError } from "../src/transport";

/**
 * A minimal mock shape that satisfies the `fetch` signature used by `createTransport`.
 * This avoids `as any` by providing a compatible callable type.
 */
type MockFetch = jest.Mock<(input: RequestInfo | URL, init?: RequestInit) => Promise<Partial<Response>>>;

// --------------------------------------------------------------------------
// buildQueryString
// --------------------------------------------------------------------------
describe("buildQueryString", () => {
    it("returns empty string for undefined", () => {
        expect(buildQueryString(undefined)).toBe("");
    });

    it("returns empty string for empty params", () => {
        expect(buildQueryString({})).toBe("");
    });

    it("serializes limit and offset parameters", () => {
        expect(buildQueryString({ limit: 10, offset: 20 })).toBe("?limit=10&offset=20");
    });

    it("serializes page parameter", () => {
        expect(buildQueryString({ page: 3 })).toBe("?page=3");
    });

    it("serializes orderBy parameter", () => {
        expect(buildQueryString({ orderBy: "createdAt:desc" })).toBe("?orderBy=createdAt%3Adesc");
    });

    it("serializes include array", () => {
        expect(buildQueryString({ include: ["author", "tags"] }))
            .toBe("?include=author%2Ctags");
    });

    it("skips empty include array", () => {
        expect(buildQueryString({ include: [] })).toBe("");
    });

    it("serializes PostgREST-style where clauses directly as query parameters", () => {
        expect(buildQueryString({ where: { status: "eq.published", count: "gt.5" } }))
            .toBe("?status=eq.published&count=gt.5");
    });

    it("URL encodes values correctly", () => {
        expect(buildQueryString({ where: { name: "eq.John Doe&" } }))
            .toBe("?name=eq.John%20Doe%26");
    });

    it("combines multiple parameter types", () => {
        const qs = buildQueryString({
            limit: 5,
            offset: 10,
            orderBy: "name",
            include: ["tags"],
            where: { active: "true" }
        });
        expect(qs).toContain("limit=5");
        expect(qs).toContain("offset=10");
        expect(qs).toContain("orderBy=name");
        expect(qs).toContain("include=tags");
        expect(qs).toContain("active=true");
        expect(qs.startsWith("?")).toBe(true);
    });
});

// --------------------------------------------------------------------------
// RebaseApiError
// --------------------------------------------------------------------------
describe("RebaseApiError", () => {
    it("sets name, status, code, and details", () => {
        const err = new RebaseApiError(422, "Validation failed", "INVALID_INPUT", { field: "email" });
        expect(err).toBeInstanceOf(Error);
        expect(err.name).toBe("RebaseApiError");
        expect(err.status).toBe(422);
        expect(err.message).toBe("Validation failed");
        expect(err.code).toBe("INVALID_INPUT");
        expect(err.details).toEqual({ field: "email" });
    });

    it("works without optional parameters", () => {
        const err = new RebaseApiError(500, "Server error");
        expect(err.code).toBeUndefined();
        expect(err.details).toBeUndefined();
    });
});

// --------------------------------------------------------------------------
// createTransport
// --------------------------------------------------------------------------
describe("createTransport", () => {
    let fetchMock: MockFetch;

    beforeEach(() => {
        fetchMock = jest.fn() as MockFetch;
    });

    // --- Initialization ---
    it("initializes with default apiPath", () => {
        const transport = createTransport({ baseUrl: "https://api.example.com", token: "jwt-token" });
        expect(transport.baseUrl).toBe("https://api.example.com");
        expect(transport.apiPath).toBe("/api");
    });

    it("uses custom apiPath when provided", () => {
        const transport = createTransport({ baseUrl: "https://api.example.com", apiPath: "/v2" });
        expect(transport.apiPath).toBe("/v2");
    });

    it("strips trailing slash from baseUrl", () => {
        const transport = createTransport({ baseUrl: "https://api.example.com/" });
        expect(transport.baseUrl).toBe("https://api.example.com");
    });

    it("exposes fetchFn", () => {
        const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as typeof globalThis.fetch });
        expect(transport.fetchFn).toBe(fetchMock);
    });

    // --- Basic requests ---
    it("makes a basic GET request", async () => {
        const transport = createTransport({ baseUrl: "https://api.example.com", fetch: fetchMock as typeof globalThis.fetch });
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ data: "success" })
        });

        const res = await transport.request("/test", { method: "GET" });
        expect(res).toEqual({ data: "success" });

        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.example.com/api/test",
            expect.objectContaining({
                method: "GET",
                headers: expect.objectContaining({
                    "Content-Type": "application/json"
                })
            })
        );
    });

    it("handles 204 No Content responses", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as typeof globalThis.fetch });
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 204,
        });

        const result = await transport.request("/delete-thing", { method: "DELETE" });
        expect(result).toBeUndefined();
    });

    // --- Token management ---
    it("injects Authorization headers when a token is provided", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", token: "static-token", fetch: fetchMock as typeof globalThis.fetch });
        fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

        await transport.request("/secure", { method: "GET" });

        expect(fetchMock).toHaveBeenCalledWith(
            "http://localhost/api/secure",
            expect.objectContaining({
                headers: expect.objectContaining({
                    "Authorization": "Bearer static-token"
                })
            })
        );
    });

    it("updates token dynamically using setToken", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as typeof globalThis.fetch });
        transport.setToken("dynamic-token");

        fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

        await transport.request("/secure", { method: "GET" });
        expect(fetchMock).toHaveBeenCalledWith(
            "http://localhost/api/secure",
            expect.objectContaining({
                headers: expect.objectContaining({
                    "Authorization": "Bearer dynamic-token"
                })
            })
        );
    });

    it("clears token when setToken is called with null", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", token: "initial", fetch: fetchMock as typeof globalThis.fetch });
        transport.setToken(null);

        fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });
        await transport.request("/test");

        const callArgs = fetchMock.mock.calls[0];
        const headers = (callArgs[1] as RequestInit).headers as Record<string, string>;
        expect(headers["Authorization"]).toBeUndefined();
    });

    // --- Token getter ---
    it("uses tokenGetter over static token when set", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", token: "static", fetch: fetchMock as typeof globalThis.fetch });
        transport.setAuthTokenGetter(async () => "dynamic-from-getter");

        fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });
        await transport.request("/test");

        expect(fetchMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    "Authorization": "Bearer dynamic-from-getter"
                })
            })
        );
    });

    it("falls back to static token when tokenGetter returns null", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", token: "fallback", fetch: fetchMock as typeof globalThis.fetch });
        transport.setAuthTokenGetter(async () => null);

        fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });
        await transport.request("/test");

        expect(fetchMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    "Authorization": "Bearer fallback"
                })
            })
        );
    });

    it("falls back to static token when tokenGetter throws", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", token: "fallback", fetch: fetchMock as typeof globalThis.fetch });
        transport.setAuthTokenGetter(async () => { throw new Error("getter failed"); });

        fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });
        await transport.request("/test");

        expect(fetchMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    "Authorization": "Bearer fallback"
                })
            })
        );
    });

    // --- resolveToken ---
    it("resolveToken returns tokenGetter result when set", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", token: "static" });
        transport.setAuthTokenGetter(async () => "from-getter");

        const resolved = await transport.resolveToken();
        expect(resolved).toBe("from-getter");
    });

    it("resolveToken returns static token when no getter", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", token: "static" });
        const resolved = await transport.resolveToken();
        expect(resolved).toBe("static");
    });

    it("resolveToken returns null when nothing is set", async () => {
        const transport = createTransport({ baseUrl: "http://localhost" });
        const resolved = await transport.resolveToken();
        expect(resolved).toBeNull();
    });

    it("resolveToken falls back to static when getter throws", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", token: "static" });
        transport.setAuthTokenGetter(async () => { throw new Error("fail"); });
        const resolved = await transport.resolveToken();
        expect(resolved).toBe("static");
    });

    // --- getHeaders ---
    it("getHeaders returns proper headers with token", () => {
        const transport = createTransport({ baseUrl: "http://localhost", token: "test-token" });
        const headers = transport.getHeaders();
        expect(headers["Content-Type"]).toBe("application/json");
        expect(headers["Authorization"]).toBe("Bearer test-token");
    });

    it("getHeaders without token omits Authorization", () => {
        const transport = createTransport({ baseUrl: "http://localhost" });
        const headers = transport.getHeaders();
        expect(headers["Content-Type"]).toBe("application/json");
        expect(headers["Authorization"]).toBeUndefined();
    });

    it("getHeaders merges custom headers from init", () => {
        const transport = createTransport({ baseUrl: "http://localhost" });
        const headers = transport.getHeaders({ headers: { "X-Custom": "val" } as any } as RequestInit);
        expect(headers["X-Custom"]).toBe("val");
    });

    // --- FormData handling ---
    it("removes Content-Type header for FormData bodies", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as typeof globalThis.fetch });
        const formData = new FormData();
        formData.append("file", "data");

        fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });
        await transport.request("/upload", { method: "POST", body: formData });

        const callHeaders = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
        expect(callHeaders["Content-Type"]).toBeUndefined();
    });

    // --- POST body ---
    it("parses JSON payloads for standard POST bodies", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as typeof globalThis.fetch });
        fetchMock.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 1 }) });

        await transport.request("/create", { method: "POST", body: JSON.stringify({ name: "test" }) });
        expect(fetchMock).toHaveBeenCalledWith(
            "http://localhost/api/create",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ name: "test" })
            })
        );
    });

    // --- Error Handling ---
    describe("Error Handling", () => {
        it("throws RebaseApiError on non-ok JSON responses", async () => {
            const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as typeof globalThis.fetch });
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: { message: "Bad Request", code: "validation_failed" } })
            });

            await expect(transport.request("/fail", { method: "GET" })).rejects.toThrow(RebaseApiError);

            const transport2 = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as typeof globalThis.fetch });
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: { message: "Bad Request", code: "validation_failed" } })
            });
            await expect(transport2.request("/fail", { method: "GET" })).rejects.toThrow("Bad Request");
        });

        it("captures error code and details on RebaseApiError", async () => {
            const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as typeof globalThis.fetch });
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 422,
                json: async () => ({ error: { message: "Validation failed", code: "INVALID", details: { field: "email" } } })
            });

            try {
                await transport.request("/fail");
            } catch (e) {
                expect(e).toBeInstanceOf(RebaseApiError);
                const err = e as RebaseApiError;
                expect(err.status).toBe(422);
                expect(err.code).toBe("INVALID");
                expect(err.details).toEqual({ field: "email" });
            }
        });

        it("falls back to top-level message/code when error.message is missing", async () => {
            const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as typeof globalThis.fetch });
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 403,
                json: async () => ({ message: "Forbidden", code: "ACCESS_DENIED" })
            });

            try {
                await transport.request("/fail");
            } catch (e) {
                const err = e as RebaseApiError;
                expect(err.message).toBe("Forbidden");
                expect(err.code).toBe("ACCESS_DENIED");
            }
        });

        it("throws RebaseApiError falling back to statusText on generic failure", async () => {
            const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as typeof globalThis.fetch });
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: "Server Error",
                json: async () => { throw new Error("not json"); },
            });

            await expect(transport.request("/fail", { method: "GET" })).rejects.toThrow("Server Error");
        });
    });

    // --- 401 Retry Logic ---
    describe("401 Retry Logic", () => {
        it("retries once if onUnauthorized callback returns true", async () => {
            const onUnauthorized = jest.fn<() => Promise<boolean>>().mockResolvedValueOnce(true);
            const transport = createTransport({
                baseUrl: "http://localhost",
                onUnauthorized,
                fetch: fetchMock as typeof globalThis.fetch
            });

            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({ error: { message: "Unauthorized" } })
            });

            fetchMock.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ success: true })
            });

            const res = await transport.request("/retry", { method: "GET" });
            expect(res).toEqual({ success: true });
            expect(onUnauthorized).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledTimes(2);
        });

        it("fails immediately if onUnauthorized returns false", async () => {
            const onUnauthorized = jest.fn<() => Promise<boolean>>().mockResolvedValueOnce(false);
            const transport = createTransport({
                baseUrl: "http://localhost",
                onUnauthorized,
                fetch: fetchMock as typeof globalThis.fetch
            });

            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({ error: { message: "Unauthorized" } })
            });

            await expect(transport.request("/retry", { method: "GET" })).rejects.toThrow("Unauthorized");
            expect(onUnauthorized).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        it("handles 204 on retry correctly", async () => {
            const onUnauthorized = jest.fn<() => Promise<boolean>>().mockResolvedValueOnce(true);
            const transport = createTransport({
                baseUrl: "http://localhost",
                onUnauthorized,
                fetch: fetchMock as typeof globalThis.fetch
            });

            fetchMock.mockResolvedValueOnce({
                ok: false, status: 401,
                json: async () => ({ error: { message: "Unauthorized" } })
            });
            fetchMock.mockResolvedValueOnce({
                ok: true, status: 204,
            });

            const result = await transport.request("/retry");
            expect(result).toBeUndefined();
        });

        it("throws error when retry also fails", async () => {
            const onUnauthorized = jest.fn<() => Promise<boolean>>().mockResolvedValueOnce(true);
            const transport = createTransport({
                baseUrl: "http://localhost",
                onUnauthorized,
                fetch: fetchMock as typeof globalThis.fetch
            });

            fetchMock.mockResolvedValueOnce({
                ok: false, status: 401,
                json: async () => ({ error: { message: "Unauthorized" } })
            });
            fetchMock.mockResolvedValueOnce({
                ok: false, status: 403,
                statusText: "Forbidden",
                json: async () => ({ error: { message: "Still forbidden" } })
            });

            await expect(transport.request("/retry")).rejects.toThrow("Still forbidden");
        });

        it("uses fresh tokenGetter value on retry", async () => {
            let callCount = 0;
            const onUnauthorized = jest.fn<() => Promise<boolean>>().mockResolvedValueOnce(true);
            const transport = createTransport({
                baseUrl: "http://localhost",
                onUnauthorized,
                fetch: fetchMock as typeof globalThis.fetch
            });
            transport.setAuthTokenGetter(async () => {
                callCount++;
                return callCount === 1 ? "old-token" : "refreshed-token";
            });

            fetchMock.mockResolvedValueOnce({
                ok: false, status: 401,
                json: async () => ({ error: { message: "Unauthorized" } })
            });
            fetchMock.mockResolvedValueOnce({
                ok: true, status: 200,
                json: async () => ({ data: "ok" })
            });

            await transport.request("/retry");

            // Second call should have the refreshed token
            const secondCallHeaders = (fetchMock.mock.calls[1][1] as RequestInit).headers as Record<string, string>;
            expect(secondCallHeaders["Authorization"]).toBe("Bearer refreshed-token");
        });

        it("does not retry 401 when no onUnauthorized is configured", async () => {
            const transport = createTransport({
                baseUrl: "http://localhost",
                fetch: fetchMock as typeof globalThis.fetch
            });

            fetchMock.mockResolvedValueOnce({
                ok: false, status: 401,
                statusText: "Unauthorized",
                json: async () => ({ error: { message: "Unauthorized" } })
            });

            await expect(transport.request("/no-retry")).rejects.toThrow("Unauthorized");
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
    });
});
