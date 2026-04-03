import { Request, Response, NextFunction, RequestHandler } from "express";
import { DataDriver } from "@rebasepro/types";
import { verifyAccessToken, AccessTokenPayload } from "./jwt";

/**
 * Extended Request type with authenticated user info
 */
export interface AuthenticatedRequest extends Request {
    user?: AccessTokenPayload;
    /** RLS-scoped DataDriver when withAuth() is available */
    driver?: DataDriver;
}

/**
 * Result from a custom auth validator.
 * - `false`/`null`/`undefined` = not authenticated
 * - `true` = authenticated as default user
 * - object with `userId` or `uid` = authenticated with user info
 */
export type AuthResult = boolean | null | undefined | { userId?: string; uid?: string; roles?: string[]; [key: string]: unknown };

/**
 * Options for creating an auth middleware via createAuthMiddleware()
 */
export interface AuthMiddlewareOptions {
    /** DataDriver to scope via withAuth() for RLS */
    driver: DataDriver;
    /** If true, return 401 when no valid token is present (default: false) */
    requireAuth?: boolean;
    /** Optional custom validator (for non-JWT auth, e.g. Firebase Auth) */
    validator?: (req: Request) => Promise<AuthResult>;
}

/**
 * Express middleware that requires a valid JWT token
 * Returns 401 if token is missing or invalid
 */
export const requireAuth: RequestHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token as string | undefined;
    const hasBearer = authHeader && authHeader.startsWith("Bearer ");

    if (!hasBearer && !queryToken) {
        res.status(401).json({
            error: {
                message: "Authorization header or token query parameter missing or invalid",
                code: "UNAUTHORIZED"
            }
        });
        return;
    }

    const token = hasBearer ? authHeader!.substring(7) : queryToken!;
    const payload = verifyAccessToken(token);

    if (!payload) {
        res.status(401).json({
            error: {
                message: "Invalid or expired token",
                code: "UNAUTHORIZED"
            }
        });
        return;
    }

    req.user = payload;
    next();
};

/**
 * Express middleware that requires the user to have an admin or schema-admin role.
 * Must be used AFTER requireAuth or on a route where req.user is guaranteed.
 */
export const requireAdmin: RequestHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            error: {
                message: "User not authenticated. requireAuth middleware is missing?",
                code: "UNAUTHORIZED"
            }
        });
        return;
    }

    const roles = req.user.roles || [];
    const isAdmin = roles.some(role => {
        const roleId = typeof role === "string" ? role : (role as { id: string }).id;
        return roleId === "admin" || roleId === "schema-admin";
    });

    if (!isAdmin) {
        res.status(403).json({
            error: {
                message: "Admin privileges required for this operation",
                code: "FORBIDDEN"
            }
        });
        return;
    }

    next();
};


/**
 * Express middleware that optionally extracts user from JWT
 * Does not return 401 if token is missing - allows anonymous access
 */
export const optionalAuth: RequestHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token as string | undefined;
    const hasBearer = authHeader && authHeader.startsWith("Bearer ");

    if (hasBearer || queryToken) {
        const token = hasBearer ? authHeader!.substring(7) : queryToken!;
        const payload = verifyAccessToken(token);
        if (payload) {
            req.user = payload;
        }
    }

    next();
};

/**
 * Extract user from token - for WebSocket authentication
 */
export function extractUserFromToken(token: string): AccessTokenPayload | null {
    return verifyAccessToken(token);
}

/**
 * Helper to scope a DataDriver via withAuth() for RLS.
 * Returns the scoped driver, or falls back to the original on error.
 */
async function scopeDataDriver(
    driver: DataDriver,
    user: { uid: string; roles?: string[] }
): Promise<DataDriver> {
    if ("withAuth" in driver && typeof (driver as Record<string, unknown>).withAuth === "function") {
        try {
            return await (driver as unknown as { withAuth: (user: Record<string, unknown>) => Promise<DataDriver> }).withAuth(user);
        } catch (e) {
            console.error("Failed to initialize scoped data source", e);
            return driver;
        }
    }
    return driver;
}

/**
 * Create a configurable auth middleware that handles:
 * 1. Token extraction (via custom validator or JWT Bearer token)
 * 2. RLS-scoped DataDriver via withAuth()
 * 3. Optional enforcement (401 when requireAuth is true and no user)
 *
 * This is the single source of truth for HTTP auth in Rebase.
 * Use this instead of manually parsing tokens in route handlers.
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions): RequestHandler {
    const { driver, requireAuth: enforceAuth = false, validator } = options;

    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        if (validator) {
            // Custom validator path (e.g., Firebase Auth, API keys)
            try {
                const authResult = await validator(req);
                if (authResult && typeof authResult === "object") {
                    const id = ("userId" in authResult ? authResult.userId : undefined)
                        || ("uid" in authResult ? authResult.uid : undefined);
                    if (id) {
                        const roles = authResult.roles || [];
                        req.user = { userId: id, roles };
                        const user = { uid: id, roles, ...authResult };
                        req.driver = await scopeDataDriver(driver, user);
                    } else {
                        req.driver = driver;
                    }
                } else if (authResult === true) {
                    req.user = { userId: "default", roles: [] };
                    req.driver = driver;
                } else {
                    // Not authenticated - driver stays unscoped
                    req.driver = driver;
                }
            } catch (error) {
                res.status(401).json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } });
                return;
            }
        } else {
            // Default JWT path
            try {
                const authHeader = req.headers.authorization;
                const queryToken = req.query.token as string | undefined;
                const hasBearer = authHeader && authHeader.startsWith("Bearer ");
                
                if (hasBearer || queryToken) {
                    const token = hasBearer ? authHeader.substring(7) : queryToken!;
                    const payload = extractUserFromToken(token);

                    if (payload) {
                        req.user = payload;
                        const user = { uid: payload.userId, roles: payload.roles };
                        req.driver = await scopeDataDriver(driver, user);
                    } else {
                        req.driver = driver;
                    }
                } else {
                    req.driver = driver;
                }
            } catch (error) {
                console.error("Default auth validation error", error);
                req.driver = driver;
            }
        }

        if (enforceAuth && !req.user) {
            res.status(401).json({ error: { message: "Unauthorized: Invalid or missing token", code: "UNAUTHORIZED" } });
            return;
        }

        next();
    };
}
