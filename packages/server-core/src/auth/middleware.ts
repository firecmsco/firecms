import { MiddlewareHandler, Context } from "hono";
import { DataDriver } from "@rebasepro/types";
import { verifyAccessToken, AccessTokenPayload } from "./jwt";
import { HonoEnv } from "../api/types";

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
    validator?: (c: Context<HonoEnv>) => Promise<AuthResult>;
}

/**
 * Express middleware that requires a valid JWT token
 * Returns 401 if token is missing or invalid
 */
export const requireAuth: MiddlewareHandler<HonoEnv> = async (
    c,
    next
) => {
    const authHeader = c.req.header("authorization");
    const queryToken = c.req.query("token");
    const hasBearer = authHeader && authHeader.startsWith("Bearer ");

    if (!hasBearer && !queryToken) {
        return c.json({
            error: {
                message: "Authorization header or token query parameter missing or invalid",
                code: "UNAUTHORIZED"
            }
        }, 401);
    }

    const token = hasBearer ? authHeader!.substring(7) : queryToken!;
    const payload = verifyAccessToken(token);

    if (!payload) {
        return c.json({
            error: {
                message: "Invalid or expired token",
                code: "UNAUTHORIZED"
            }
        }, 401);
    }

    c.set("user", payload);
    return next();
};

/**
 * Middleware that requires the user to have an admin or schema-admin role.
 * Must be used AFTER requireAuth or on a route where user is guaranteed.
 */
export const requireAdmin: MiddlewareHandler<HonoEnv> = async (
    c,
    next
) => {
    const user = c.get("user");
    if (!user) {
        return c.json({
            error: {
                message: "User not authenticated. requireAuth middleware is missing?",
                code: "UNAUTHORIZED"
            }
        }, 401);
    }

    const roles = (typeof user === "object" && user !== null && "roles" in user) ? (user.roles || []) : [];
    const isAdmin = roles.some((role: string) => {
        return role === "admin" || role === "schema-admin";
    });

    if (!isAdmin) {
        return c.json({
            error: {
                message: "Admin privileges required for this operation",
                code: "FORBIDDEN"
            }
        }, 403);
    }

    return next();
};


/**
 * Middleware that optionally extracts user from JWT
 * Does not return 401 if token is missing - allows anonymous access
 */
export const optionalAuth: MiddlewareHandler<HonoEnv> = async (
    c,
    next
) => {
    const authHeader = c.req.header("authorization");
    const queryToken = c.req.query("token");
    const hasBearer = authHeader && authHeader.startsWith("Bearer ");

    if (hasBearer || queryToken) {
        const token = hasBearer ? authHeader!.substring(7) : queryToken!;
        const payload = verifyAccessToken(token);
        if (payload) {
            c.set("user", payload);
        }
    }

    return next();
};

/**
 * Extract user from token - for WebSocket authentication
 */
export function extractUserFromToken(token: string): AccessTokenPayload | null {
    return verifyAccessToken(token);
}

/**
 * Helper to scope a DataDriver via withAuth() for RLS.
 * SECURITY: If withAuth() is available but fails, the error is re-thrown
 * so the request is denied rather than proceeding with unscoped access.
 */
async function scopeDataDriver(
    driver: DataDriver,
    user: { uid: string; roles?: string[] }
): Promise<DataDriver> {
    if ("withAuth" in driver && typeof (driver as Record<string, unknown>).withAuth === "function") {
        // Fail closed — do NOT catch and swallow errors here.
        // If RLS scoping fails the request must be rejected.
        return await (driver as unknown as { withAuth: (user: Record<string, unknown>) => Promise<DataDriver> }).withAuth(user);
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
export function createAuthMiddleware(options: AuthMiddlewareOptions): MiddlewareHandler<HonoEnv> {
    const { driver, requireAuth: enforceAuth = false, validator } = options;

    return async (c, next) => {
        if (validator) {
            // Custom validator path (e.g., Firebase Auth, API keys)
            try {
                const authResult = await validator(c);
                if (authResult && typeof authResult === "object") {
                    const id = ("userId" in authResult ? authResult.userId : undefined)
                        || ("uid" in authResult ? authResult.uid : undefined);
                    if (id) {
                        const roles = authResult.roles || [];
                        c.set("user", { userId: id, roles });
                        const user = { uid: id, roles, ...authResult };
                        c.set("driver", await scopeDataDriver(driver, user));
                    } else {
                        c.set("driver", driver);
                    }
                } else if (authResult === true) {
                    c.set("user", { userId: "default", roles: [] });
                    c.set("driver", driver);
                } else {
                    // Not authenticated - driver stays unscoped
                    c.set("driver", driver);
                }
            } catch (error) {
                return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
            }
        } else {
            // Default JWT path
            try {
                const authHeader = c.req.header("authorization");
                const queryToken = c.req.query("token");
                const hasBearer = authHeader && authHeader.startsWith("Bearer ");
                
                if (hasBearer || queryToken) {
                    const token = hasBearer ? authHeader!.substring(7) : queryToken!;
                    const payload = extractUserFromToken(token);

                    if (payload) {
                        c.set("user", payload);
                        const user = { uid: payload.userId, roles: payload.roles };
                        c.set("driver", await scopeDataDriver(driver, user));
                    } else {
                        console.error("[AUTH] Token payload empty or invalid (length: " + token.length + ")");
                        c.set("driver", driver);
                    }
                } else {
                    console.error("[AUTH] No token found! Auth header:", authHeader, "Query:", queryToken, "Path:", c.req.path);
                    c.set("driver", driver);
                }
            } catch (error) {
                console.error("Default auth validation error", error);
                c.set("driver", driver);
            }
        }

        if (enforceAuth && !c.get("user")) {
            console.error("[AUTH] Rejecting with 401. Path:", c.req.path);
            return c.json({ error: { message: "Unauthorized: Invalid or missing token", code: "UNAUTHORIZED" } }, 401);
        }

        return next();
    };
}
