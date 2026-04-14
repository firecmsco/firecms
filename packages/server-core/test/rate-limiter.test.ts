import { createRateLimiter } from "../src/auth/rate-limiter";
import { Hono } from "hono";
import { HonoEnv } from "../src/api/types";

describe("Rate Limiter", () => {

    function createTestApp(options: { windowMs?: number; limit?: number } = {}) {
        const app = new Hono<HonoEnv>();
        const limiter = createRateLimiter({
            windowMs: options.windowMs ?? 60 * 1000, // 1 minute
            limit: options.limit ?? 3,
            keyGenerator: (c) => c.req.header("x-forwarded-for") || "test-ip",
        });
        app.use("/api/*", limiter);
        app.get("/api/test", (c) => c.json({ ok: true }));
        return app;
    }

    it("allows requests under the limit", async () => {
        const app = createTestApp({ limit: 5 });

        const res = await app.request("/api/test", {
            headers: { "x-forwarded-for": "1.2.3.4" },
        });

        expect(res.status).toBe(200);
        expect(res.headers.get("X-RateLimit-Limit")).toBe("5");
        expect(res.headers.get("X-RateLimit-Remaining")).toBe("4");
    });

    it("returns 429 when limit is exceeded", async () => {
        const app = createTestApp({ limit: 2 });

        // First two should pass
        await app.request("/api/test", { headers: { "x-forwarded-for": "10.0.0.1" } });
        await app.request("/api/test", { headers: { "x-forwarded-for": "10.0.0.1" } });

        // Third should be rate limited
        const res = await app.request("/api/test", {
            headers: { "x-forwarded-for": "10.0.0.1" },
        });

        expect(res.status).toBe(429);
        const body = await res.json() as any;
        expect(body.error.code).toBe("RATE_LIMITED");
    });

    it("includes Retry-After header when rate limited", async () => {
        const app = createTestApp({ limit: 1 });

        await app.request("/api/test", { headers: { "x-forwarded-for": "10.0.0.2" } });
        const res = await app.request("/api/test", {
            headers: { "x-forwarded-for": "10.0.0.2" },
        });

        expect(res.headers.get("Retry-After")).toBeDefined();
        expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    });

    it("tracks different IPs separately", async () => {
        const app = createTestApp({ limit: 1 });

        const res1 = await app.request("/api/test", {
            headers: { "x-forwarded-for": "ip-a" },
        });
        const res2 = await app.request("/api/test", {
            headers: { "x-forwarded-for": "ip-b" },
        });

        expect(res1.status).toBe(200);
        expect(res2.status).toBe(200);
    });

    it("decrements remaining count with each request", async () => {
        const app = createTestApp({ limit: 3 });
        const ip = "counter-ip";

        const r1 = await app.request("/api/test", { headers: { "x-forwarded-for": ip } });
        expect(r1.headers.get("X-RateLimit-Remaining")).toBe("2");

        const r2 = await app.request("/api/test", { headers: { "x-forwarded-for": ip } });
        expect(r2.headers.get("X-RateLimit-Remaining")).toBe("1");

        const r3 = await app.request("/api/test", { headers: { "x-forwarded-for": ip } });
        expect(r3.headers.get("X-RateLimit-Remaining")).toBe("0");
    });

    it("uses custom message", async () => {
        const app = new Hono<HonoEnv>();
        const limiter = createRateLimiter({
            limit: 0,
            message: "Slow down!",
            keyGenerator: () => "always-same",
        });
        app.use("/api/*", limiter);
        app.get("/api/test", (c) => c.json({ ok: true }));

        const res = await app.request("/api/test");
        const body = await res.json() as any;
        expect(body.error.message).toBe("Slow down!");
    });
});
