import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyAccessToken, AccessTokenPayload } from "./jwt";

/**
 * Extended Request type with authenticated user info
 */
export interface AuthenticatedRequest extends Request {
    user?: AccessTokenPayload;
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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            error: {
                message: "Authorization header missing or invalid",
                code: "UNAUTHORIZED"
            }
        });
        return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
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
 * Express middleware that optionally extracts user from JWT
 * Does not return 401 if token is missing - allows anonymous access
 */
export const optionalAuth: RequestHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
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
