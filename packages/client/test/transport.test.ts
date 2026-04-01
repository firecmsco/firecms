import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createTransport, buildQueryString, RebaseApiError } from "../src/transport";

describe("buildQueryString", () => {
    it("handles an empty params object", () => {
        expect(buildQueryString({})).toBe("");
    });

    it("serializes limit and offset parameters", () => {
        expect(buildQueryString({ limit: 10, offset: 20 })).toBe("?limit=10&offset=20");
    });

    it("serializes PostgREST-style where clauses directly as query parameters", () => {
        expect(buildQueryString({ where: { status: "eq.published", count: "gt.5" } }))
            .toBe("?status=eq.published&count=gt.5");
    });

    it("serializes array parameters correctly", () => {
        expect(buildQueryString({ include: ["author", "tags"] }))
            .toBe("?include=author%2Ctags");
    });

    it("URL encodes values correctly", () => {
        expect(buildQueryString({ where: { name: "eq.John Doe&" } }))
            .toBe("?name=eq.John%20Doe%26");
    });
});

describe("createTransport", () => {
    let fetchMock: jest.Mock<any>;

    beforeEach(() => {
        fetchMock = jest.fn() as jest.Mock<any>;
    });

    it("initializes securely with config properties", () => {
        const transport = createTransport({ baseUrl: "https://api.example.com", token: "jwt-token" });
        expect(transport.baseUrl).toBe("https://api.example.com");
        expect(transport.apiPath).toBe("/api");
    });

    it("makes a basic GET request overriding prefix", async () => {
        const transport = createTransport({ baseUrl: "https://api.example.com", fetch: fetchMock as any });
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ data: "success" })
        });

        const res = await transport.request("/test", { method: "GET" });
        expect(res).toEqual({ data: "success" });
        
        expect(fetchMock).toHaveBeenCalledTimes(1);
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

    it("injects Authorization headers when a token is provided", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", token: "static-token", fetch: fetchMock as any });
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
        const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as any });
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

    it("parses JSON payloads for standard POST bodies", async () => {
        const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as any });
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

    describe("Error Handling", () => {
        it("throws RebaseApiError on non-ok JSON responses", async () => {
            const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as any });
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: { message: "Bad Request", code: "validation_failed" } })
            });

            await expect(transport.request("/fail", { method: "GET" })).rejects.toThrow(RebaseApiError);
            
            const transport2 = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as any });
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: { message: "Bad Request", code: "validation_failed" } })
            });
            await expect(transport2.request("/fail", { method: "GET" })).rejects.toThrow("Bad Request");
        });

        it("throws RebaseApiError falling back to statusText on generic failure", async () => {
            const transport = createTransport({ baseUrl: "http://localhost", fetch: fetchMock as any });
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: "Server Error",
                json: async () => { throw new Error("not json"); },
                text: async () => "Internal Server Error"
            });

            await expect(transport.request("/fail", { method: "GET" })).rejects.toThrow("Server Error");
        });
    });

    describe("401 Retry Logic", () => {
        it("retries once if onUnauthorized callback returns true", async () => {
            const onUnauthorized = jest.fn<() => Promise<boolean>>().mockResolvedValueOnce(true);
            const transport = createTransport({ 
                baseUrl: "http://localhost", 
                onUnauthorized, 
                fetch: fetchMock as any 
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
                fetch: fetchMock as any 
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
    });
});
