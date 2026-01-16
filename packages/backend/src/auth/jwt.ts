import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";

export interface JwtConfig {
    secret: string;
    accessExpiresIn?: string;
    refreshExpiresIn?: string;
}

export interface AccessTokenPayload {
    userId: string;
    roles: string[];
}

let jwtConfig: JwtConfig = {
    secret: "",
    accessExpiresIn: "1h",
    refreshExpiresIn: "30d"
};

/**
 * Configure JWT settings - call this during initialization
 */
export function configureJwt(config: JwtConfig): void {
    jwtConfig = {
        ...jwtConfig,
        ...config
    };
}

/**
 * Generate an access token (short-lived, 1 hour by default)
 */
export function generateAccessToken(userId: string, roles: string[]): string {
    if (!jwtConfig.secret) {
        throw new Error("JWT secret not configured. Call configureJwt() first.");
    }

    const payload: AccessTokenPayload = { userId, roles };

    return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.accessExpiresIn as jwt.SignOptions["expiresIn"]
    });
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
    if (!jwtConfig.secret) {
        throw new Error("JWT secret not configured. Call configureJwt() first.");
    }

    try {
        const decoded = jwt.verify(token, jwtConfig.secret) as jwt.JwtPayload & AccessTokenPayload;
        return {
            userId: decoded.userId,
            roles: decoded.roles
        };
    } catch (error) {
        return null;
    }
}

/**
 * Generate a random refresh token (long-lived, 30 days by default)
 */
export function generateRefreshToken(): string {
    return randomBytes(40).toString("hex");
}

/**
 * Hash a refresh token for database storage (don't store raw tokens)
 */
export function hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

/**
 * Calculate refresh token expiration date
 */
export function getRefreshTokenExpiry(): Date {
    const duration = jwtConfig.refreshExpiresIn || "30d";
    const match = duration.match(/^(\d+)([dhms])$/);

    if (!match) {
        // Default to 30 days
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    let ms: number;
    switch (unit) {
        case "d": ms = value * 24 * 60 * 60 * 1000; break;
        case "h": ms = value * 60 * 60 * 1000; break;
        case "m": ms = value * 60 * 1000; break;
        case "s": ms = value * 1000; break;
        default: ms = 30 * 24 * 60 * 60 * 1000;
    }

    return new Date(Date.now() + ms);
}
