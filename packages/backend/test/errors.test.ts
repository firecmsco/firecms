import { ApiError, errorHandler } from "../src/api/errors";

// ── Minimal Hono-context mock ────────────────────────────────────────────
function createMockContext(method = "GET", path = "/test") {
    let capturedStatus: number | undefined;
    let capturedBody: any;

    const c = {
        req: { method, path },
        json: (body: any, status?: number) => {
            capturedBody = body;
            capturedStatus = status ?? 200;
            return new Response(JSON.stringify(body), { status: capturedStatus });
        },
    } as any;

    return {
        c,
        getStatus: () => capturedStatus,
        getBody: () => capturedBody,
    };
}

// ── ApiError class ────────────────────────────────────────────────────────
describe("ApiError", () => {
    describe("constructor", () => {
        it("should create an error with statusCode, code, message, and details", () => {
            const err = new ApiError(422, "VALIDATION_ERROR", "Invalid field", { field: "email" });
            expect(err).toBeInstanceOf(Error);
            expect(err).toBeInstanceOf(ApiError);
            expect(err.statusCode).toBe(422);
            expect(err.code).toBe("VALIDATION_ERROR");
            expect(err.message).toBe("Invalid field");
            expect(err.details).toEqual({ field: "email" });
            expect(err.name).toBe("ApiError");
        });

        it("should default details to undefined", () => {
            const err = new ApiError(400, "BAD_REQUEST", "Bad");
            expect(err.details).toBeUndefined();
        });
    });

    describe("factory methods", () => {
        it("badRequest → 400", () => {
            const err = ApiError.badRequest("Missing field", "MISSING_FIELD");
            expect(err.statusCode).toBe(400);
            expect(err.code).toBe("MISSING_FIELD");
        });

        it("badRequest uses default code", () => {
            const err = ApiError.badRequest("Oops");
            expect(err.code).toBe("BAD_REQUEST");
        });

        it("unauthorized → 401", () => {
            const err = ApiError.unauthorized("Bad token");
            expect(err.statusCode).toBe(401);
            expect(err.code).toBe("UNAUTHORIZED");
        });

        it("forbidden → 403", () => {
            const err = ApiError.forbidden("No access");
            expect(err.statusCode).toBe(403);
            expect(err.code).toBe("FORBIDDEN");
        });

        it("notFound → 404", () => {
            const err = ApiError.notFound("Entity not found");
            expect(err.statusCode).toBe(404);
            expect(err.code).toBe("NOT_FOUND");
        });

        it("conflict → 409", () => {
            const err = ApiError.conflict("Already exists", "EMAIL_EXISTS");
            expect(err.statusCode).toBe(409);
            expect(err.code).toBe("EMAIL_EXISTS");
        });

        it("internal → 500", () => {
            const err = ApiError.internal("Boom");
            expect(err.statusCode).toBe(500);
            expect(err.code).toBe("INTERNAL_ERROR");
        });

        it("serviceUnavailable → 503", () => {
            const err = ApiError.serviceUnavailable("Down");
            expect(err.statusCode).toBe(503);
            expect(err.code).toBe("SERVICE_UNAVAILABLE");
        });
    });
});

// ── errorHandler (Hono ErrorHandler) ──────────────────────────────────────
describe("errorHandler", () => {
    it("should format ApiError with statusCode, code, message", () => {
        const { c, getStatus, getBody } = createMockContext();
        const err = ApiError.notFound("User not found");
        errorHandler(err, c);

        expect(getStatus()).toBe(404);
        expect(getBody()).toEqual({
            error: { message: "User not found", code: "NOT_FOUND" }
        });
    });

    it("should include details when present", () => {
        const { c, getBody } = createMockContext();
        const err = ApiError.badRequest("Validation failed", "VALIDATION", { fields: ["email"] });
        errorHandler(err, c);

        expect(getBody()).toEqual({
            error: {
                message: "Validation failed",
                code: "VALIDATION",
                details: { fields: ["email"] }
            }
        });
    });

    it("should handle plain Error with code property", () => {
        const { c, getStatus, getBody } = createMockContext();
        const err = Object.assign(new Error("Not found"), { code: "NOT_FOUND" });
        errorHandler(err, c);

        expect(getStatus()).toBe(404);
        expect(getBody()).toEqual({
            error: { message: "Not found", code: "NOT_FOUND" }
        });
    });

    it("should default to 500 for unknown errors", () => {
        const { c, getStatus, getBody } = createMockContext();
        const err = new Error("Something broke");
        errorHandler(err, c);

        expect(getStatus()).toBe(500);
        expect(getBody()).toEqual({
            error: { message: "Something broke", code: "INTERNAL_ERROR" }
        });
    });

    it("should use statusCode from error if present", () => {
        const { c, getStatus } = createMockContext();
        const err = Object.assign(new Error("Rate limited"), { statusCode: 429, code: "RATE_LIMITED" });
        errorHandler(err, c);

        expect(getStatus()).toBe(429);
    });
});
