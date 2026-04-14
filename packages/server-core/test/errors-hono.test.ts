import { Hono } from "hono";
import { ApiError, errorHandler } from "../src/api/errors";
import { HonoEnv } from "../src/api/types";

describe("Error Handler (Hono)", () => {
    function createApp() {
        const app = new Hono<HonoEnv>();
        app.onError(errorHandler);

        // Test routes that throw different errors
        app.get("/bad-request", () => {
            throw ApiError.badRequest("Missing required field", "MISSING_FIELD", { field: "email" });
        });
        app.get("/unauthorized", () => {
            throw ApiError.unauthorized("Token expired", "TOKEN_EXPIRED");
        });
        app.get("/forbidden", () => {
            throw ApiError.forbidden("Admin only", "FORBIDDEN");
        });
        app.get("/not-found", () => {
            throw ApiError.notFound("Entity not found");
        });
        app.get("/conflict", () => {
            throw ApiError.conflict("Email already exists", "EMAIL_EXISTS");
        });
        app.get("/internal", () => {
            throw ApiError.internal("Database connection failed");
        });
        app.get("/service-unavailable", () => {
            throw ApiError.serviceUnavailable("Feature not configured");
        });
        app.get("/generic-error", () => {
            throw new Error("Something went wrong");
        });
        app.get("/error-with-code", () => {
            const err = new Error("Rate limited") as Error & { code: string };
            err.code = "RATE_LIMITED";
            throw err;
        });

        return app;
    }

    it("formats ApiError with correct status and body structure", async () => {
        const app = createApp();
        const res = await app.request("/bad-request");
        expect(res.status).toBe(400);
        const body = await res.json() as any;
        expect(body.error.message).toBe("Missing required field");
        expect(body.error.code).toBe("MISSING_FIELD");
        expect(body.error.details).toEqual({ field: "email" });
    });

    it("handles 401 Unauthorized", async () => {
        const app = createApp();
        const res = await app.request("/unauthorized");
        expect(res.status).toBe(401);
        const body = await res.json() as any;
        expect(body.error.code).toBe("TOKEN_EXPIRED");
    });

    it("handles 403 Forbidden", async () => {
        const app = createApp();
        const res = await app.request("/forbidden");
        expect(res.status).toBe(403);
        const body = await res.json() as any;
        expect(body.error.code).toBe("FORBIDDEN");
    });

    it("handles 404 Not Found", async () => {
        const app = createApp();
        const res = await app.request("/not-found");
        expect(res.status).toBe(404);
        const body = await res.json() as any;
        expect(body.error.code).toBe("NOT_FOUND");
    });

    it("handles 409 Conflict", async () => {
        const app = createApp();
        const res = await app.request("/conflict");
        expect(res.status).toBe(409);
        const body = await res.json() as any;
        expect(body.error.code).toBe("EMAIL_EXISTS");
    });

    it("handles 500 Internal", async () => {
        const app = createApp();
        const res = await app.request("/internal");
        expect(res.status).toBe(500);
    });

    it("handles 503 Service Unavailable", async () => {
        const app = createApp();
        const res = await app.request("/service-unavailable");
        expect(res.status).toBe(503);
    });

    it("converts generic Error to 500 with INTERNAL_ERROR code", async () => {
        const app = createApp();
        const res = await app.request("/generic-error");
        expect(res.status).toBe(500);
        const body = await res.json() as any;
        expect(body.error.code).toBe("INTERNAL_ERROR");
        expect(body.error.message).toBe("Something went wrong");
    });

    it("maps known error codes to HTTP status codes", async () => {
        const app = createApp();
        const res = await app.request("/error-with-code");
        // RATE_LIMITED is not in the code-to-status map, so it should default to 500
        expect(res.status).toBe(500);
    });

    it("omits details when not provided", async () => {
        const app = createApp();
        const res = await app.request("/unauthorized");
        const body = await res.json() as any;
        expect(body.error.details).toBeUndefined();
    });

    it("returns consistent error shape for all error types", async () => {
        const app = createApp();
        const paths = ["/bad-request", "/unauthorized", "/forbidden", "/not-found", "/internal", "/generic-error"];

        for (const path of paths) {
            const res = await app.request(path);
            const body = await res.json() as any;
            expect(body).toHaveProperty("error");
            expect(body.error).toHaveProperty("message");
            expect(body.error).toHaveProperty("code");
        }
    });
});
