import { MiddlewareHandler } from "hono";
import { HonoEnv } from "../api/types";

/**
 * In-memory sliding-window rate limiter for Hono.
 *
 * Suitable for single-instance and moderate-scale deployments.
 * For multi-instance setups, consider a shared store
 * (e.g. PostgreSQL-backed counters or an external rate-limit service).
 */

interface RateLimitEntry {
    timestamps: number[];
}

interface RateLimiterOptions {
    /** Time window in milliseconds (default: 15 minutes) */
    windowMs?: number;
    /** Maximum requests per window (default: 100) */
    limit?: number;
    /** Key generator function. Defaults to IP-based keying. */
    keyGenerator?: (c: Parameters<MiddlewareHandler<HonoEnv>>[0]) => string;
    /** Custom message for rate limit responses */
    message?: string;
}

/**
 * Create a rate-limiting middleware.
 *
 * Uses a sliding window algorithm: only timestamps within the last
 * `windowMs` milliseconds are counted. Old entries are garbage-collected
 * every `windowMs` to prevent unbounded memory growth.
 */
export function createRateLimiter(options: RateLimiterOptions = {}): MiddlewareHandler<HonoEnv> {
    const {
        windowMs = 15 * 60 * 1000,
        limit = 100,
        keyGenerator = defaultKeyGenerator,
        message = "Too many requests, please try again later."
    } = options;

    const store = new Map<string, RateLimitEntry>();

    // Periodic cleanup to prevent memory leak from expired entries
    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);
            if (entry.timestamps.length === 0) {
                store.delete(key);
            }
        }
    }, windowMs);

    // Allow the Node.js process to exit even if the interval is still running
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }

    return async (c, next) => {
        const key = keyGenerator(c);
        const now = Date.now();

        let entry = store.get(key);
        if (!entry) {
            entry = { timestamps: [] };
            store.set(key, entry);
        }

        // Remove timestamps outside the current window
        entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

        if (entry.timestamps.length >= limit) {
            const retryAfterMs = entry.timestamps[0] + windowMs - now;
            const retryAfterSec = Math.ceil(retryAfterMs / 1000);

            c.header("Retry-After", String(retryAfterSec));
            c.header("X-RateLimit-Limit", String(limit));
            c.header("X-RateLimit-Remaining", "0");
            c.header("X-RateLimit-Reset", String(Math.ceil((now + retryAfterMs) / 1000)));

            return c.json({
                error: {
                    message,
                    code: "RATE_LIMITED"
                }
            }, 429);
        }

        entry.timestamps.push(now);

        // Set rate limit headers
        c.header("X-RateLimit-Limit", String(limit));
        c.header("X-RateLimit-Remaining", String(limit - entry.timestamps.length));

        return next();
    };
}

/**
 * Default key generator: extract client IP from standard headers.
 */
function defaultKeyGenerator(c: Parameters<MiddlewareHandler<HonoEnv>>[0]): string {
    return (
        c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
        c.req.header("x-real-ip") ||
        "unknown"
    );
}

/**
 * Pre-configured rate limiter for general auth endpoints (login, register).
 * 20 requests per 15 minutes per IP.
 */
export const defaultAuthLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: "Too many authentication attempts, please try again later."
});

/**
 * Pre-configured strict rate limiter for sensitive endpoints (password reset, verification).
 * 5 requests per 15 minutes per IP.
 */
export const strictAuthLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: "Too many requests to this sensitive endpoint, please try again later."
});
