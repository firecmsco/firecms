import { Request, Response, NextFunction } from "express";
import { ApiError, errorHandler, asyncHandler } from "../src/api/errors";

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

describe("errorHandler", () => {
    let mockReq: Request;
    let mockRes: Response;
    let mockNext: NextFunction;
    let statusFn: jest.Mock;
    let jsonFn: jest.Mock;

    beforeEach(() => {
        mockReq = {} as Request;
        jsonFn = jest.fn();
        statusFn = jest.fn().mockReturnValue({ json: jsonFn });
        mockRes = { status: statusFn } as unknown as Response;
        mockNext = jest.fn();
    });

    it("should format ApiError with statusCode, code, message", () => {
        const err = ApiError.notFound("User not found");
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(statusFn).toHaveBeenCalledWith(404);
        expect(jsonFn).toHaveBeenCalledWith({
            error: { message: "User not found", code: "NOT_FOUND" }
        });
    });

    it("should include details when present", () => {
        const err = ApiError.badRequest("Validation failed", "VALIDATION", { fields: ["email"] });
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(jsonFn).toHaveBeenCalledWith({
            error: {
                message: "Validation failed",
                code: "VALIDATION",
                details: { fields: ["email"] }
            }
        });
    });

    it("should handle plain Error with code property", () => {
        const err = Object.assign(new Error("Not found"), { code: "NOT_FOUND" });
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(statusFn).toHaveBeenCalledWith(404);
        expect(jsonFn).toHaveBeenCalledWith({
            error: { message: "Not found", code: "NOT_FOUND" }
        });
    });

    it("should default to 500 for unknown errors", () => {
        const err = new Error("Something broke");
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(statusFn).toHaveBeenCalledWith(500);
        expect(jsonFn).toHaveBeenCalledWith({
            error: { message: "Something broke", code: "INTERNAL_ERROR" }
        });
    });

    it("should use statusCode from error if present", () => {
        const err = Object.assign(new Error("Rate limited"), { statusCode: 429, code: "RATE_LIMITED" });
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(statusFn).toHaveBeenCalledWith(429);
    });
});

describe("asyncHandler", () => {
    it("should call next with error when async function throws", async () => {
        const next = jest.fn();
        const handler = asyncHandler(async () => {
            throw new ApiError(400, "BAD", "test error");
        });

        await handler({} as Request, {} as Response, next);

        // Give the microtask a tick
        await new Promise(resolve => setImmediate(resolve));

        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it("should not call next when function succeeds", async () => {
        const next = jest.fn();
        const jsonFn = jest.fn();
        const res = { json: jsonFn } as unknown as Response;

        const handler = asyncHandler(async (_req, res) => {
            (res as any).json({ ok: true });
        });

        await handler({} as Request, res, next);
        await new Promise(resolve => setImmediate(resolve));

        expect(next).not.toHaveBeenCalled();
        expect(jsonFn).toHaveBeenCalledWith({ ok: true });
    });
});
