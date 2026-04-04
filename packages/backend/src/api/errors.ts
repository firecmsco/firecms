import { ErrorHandler } from "hono";

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
 * Hono error-handling middleware (`app.onError`).
 * Converts any error into the canonical `{ error: { message, code } }` shape.
 */
export const errorHandler: ErrorHandler = (err, c) => {
    // Typecast custom error properties
    const error = err as Error & { statusCode?: number; code?: string; details?: unknown };

    if (error instanceof ApiError) {
        // Operational errors — log at warn level
        console.warn(
            `⚠️ [API] ${c.req.method} ${c.req.path} → ${error.statusCode} ${error.code}: ${error.message}`
        );
        return c.json({
            error: {
                message: error.message,
                code: error.code,
                ...(error.details !== undefined && { details: error.details })
            }
        } satisfies ErrorResponse, (error.statusCode || 500) as any);
    }

    const statusCode = error.statusCode || codeToStatus(error.code) || 500;
    const code = error.code || "INTERNAL_ERROR";

    // Unexpected errors — log at error level with full stack
    console.error(
        `❌ [API] ${c.req.method} ${c.req.path} → ${statusCode} ${code}: ${error.message}`
    );
    console.error(error.stack || error);

    return c.json({
        error: {
            message: error.message || "An unexpected error occurred",
            code,
            ...(error.details !== undefined && { details: error.details })
        }
    } satisfies ErrorResponse, statusCode as any);
};

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


