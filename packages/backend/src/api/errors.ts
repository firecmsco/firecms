import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Standardized API error class.
 * Throw this from any route handler — the errorHandler middleware
 * will format it into `{ error: { message, code, details? } }`.
 */
export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: unknown;

    constructor(statusCode: number, code: string, message: string, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }

    // ── Factory methods ──────────────────────────────────────────────

    static badRequest(message: string, code = "BAD_REQUEST", details?: unknown): ApiError {
        return new ApiError(400, code, message, details);
    }

    static unauthorized(message: string, code = "UNAUTHORIZED"): ApiError {
        return new ApiError(401, code, message);
    }

    static forbidden(message: string, code = "FORBIDDEN"): ApiError {
        return new ApiError(403, code, message);
    }

    static notFound(message: string, code = "NOT_FOUND"): ApiError {
        return new ApiError(404, code, message);
    }

    static conflict(message: string, code = "CONFLICT"): ApiError {
        return new ApiError(409, code, message);
    }

    static internal(message: string, code = "INTERNAL_ERROR"): ApiError {
        return new ApiError(500, code, message);
    }

    static serviceUnavailable(message: string, code = "SERVICE_UNAVAILABLE"): ApiError {
        return new ApiError(503, code, message);
    }
}

/**
 * Canonical error response shape:
 * `{ error: { message: string, code: string, details?: unknown } }`
 */
export interface ErrorResponse {
    error: {
        message: string;
        code: string;
        details?: unknown;
    };
}

/**
 * Express error-handling middleware.
 * Converts any error into the canonical `{ error: { message, code } }` shape.
 *
 * - `ApiError` instances use their own statusCode/code.
 * - Plain `Error` with a `code` property maps known codes to HTTP statuses.
 * - Everything else becomes a 500.
 */
export function errorHandler(
    err: Error & { statusCode?: number; code?: string; details?: unknown },
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            error: {
                message: err.message,
                code: err.code,
                ...(err.details !== undefined && { details: err.details })
            }
        } satisfies ErrorResponse);
        return;
    }

    // Handle plain Errors with a code property (e.g. from REST api-generator)
    const statusCode = err.statusCode || codeToStatus(err.code) || 500;
    const code = err.code || "INTERNAL_ERROR";

    res.status(statusCode).json({
        error: {
            message: err.message || "An unexpected error occurred",
            code,
            ...(err.details !== undefined && { details: err.details })
        }
    } satisfies ErrorResponse);
}

/**
 * Map known error codes to HTTP status codes.
 */
function codeToStatus(code?: string): number | undefined {
    if (!code) return undefined;
    const map: Record<string, number> = {
        BAD_REQUEST: 400,
        INVALID_INPUT: 400,
        WEAK_PASSWORD: 400,
        UNAUTHORIZED: 401,
        INVALID_CREDENTIALS: 401,
        INVALID_TOKEN: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        EMAIL_EXISTS: 409,
        ROLE_EXISTS: 409,
        INTERNAL_ERROR: 500,
        NOT_CONFIGURED: 503,
        SERVICE_UNAVAILABLE: 503,
    };
    return map[code];
}

/**
 * Wrap an async route handler so thrown errors are passed to `next()`.
 * Eliminates try/catch boilerplate in every route.
 *
 * Usage:
 * ```ts
 * router.get("/path", asyncHandler(async (req, res) => {
 *     const data = await fetchData();
 *     if (!data) throw ApiError.notFound("Not found");
 *     res.json(data);
 * }));
 * ```
 */
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
}
