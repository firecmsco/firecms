import { Hono, Context } from "hono";
import { configureJwt, generateAccessToken } from "../src/auth/jwt.js";
import { requireAuth, optionalAuth, requireAdmin, createAuthMiddleware } from "../src/auth/middleware.js";
import type { HonoEnv } from "../src/api/types.js";
import type { DataDriver } from "../../types/src/controllers/data_driver.js";

const TEST_SECRET = "test-secret-key-for-hono-middleware-testing-1234567890";

describe("Auth Middleware (Hono)", () => {

    beforeAll(() => {
        configureJwt({ secret: TEST_SECRET, accessExpiresIn: "1h" });
    });

    // ── requireAuth ─────────────────────────────────────────
    describe("requireAuth", () => {
        function createApp() {
            const app = new Hono<HonoEnv>();
            app.use("/protected/*", requireAuth);
            app.get("/protected/resource", (c: Context<HonoEnv>) => {
                const user = c.get("user");
                return c.json({ user });
            });
            return app;
        }

        it("passes with valid Bearer token", async () => {
            const app = createApp();
            const token = generateAccessToken("user-1", ["admin"]);
            const res = await app.request("/protected/resource", {
                headers: { Authorization: `Bearer ${token}` },
            });
            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.user.userId).toBe("user-1");
            expect(body.user.roles).toEqual(["admin"]);
        });

        it("returns 401 for missing Authorization header", async () => {
            const app = createApp();
            const res = await app.request("/protected/resource");
            expect(res.status).toBe(401);
            const body = await res.json() as any;
            expect(body.error.code).toBe("UNAUTHORIZED");
        });

        it("returns 401 for non-Bearer prefix", async () => {
            const app = createApp();
            const res = await app.request("/protected/resource", {
                headers: { Authorization: "Basic abc123" },
            });
            expect(res.status).toBe(401);
        });

        it("returns 401 for invalid/expired token", async () => {
            const app = createApp();
            const res = await app.request("/protected/resource", {
                headers: { Authorization: "Bearer invalid.token.here" },
            });
            expect(res.status).toBe(401);
            const body = await res.json() as any;
            expect(body.error.code).toBe("UNAUTHORIZED");
        });

        it("accepts token via query parameter", async () => {
            const app = createApp();
            const token = generateAccessToken("user-2", ["editor"]);
            const res = await app.request(`/protected/resource?token=${token}`);
            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.user.userId).toBe("user-2");
        });

        it("prefers Bearer token over query parameter", async () => {
            const app = createApp();
            const bearerToken = generateAccessToken("bearer-user", ["admin"]);
            const queryToken = generateAccessToken("query-user", ["viewer"]);
            const res = await app.request(`/protected/resource?token=${queryToken}`, {
                headers: { Authorization: `Bearer ${bearerToken}` },
            });
            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.user.userId).toBe("bearer-user");
        });
    });

    // ── requireAdmin ────────────────────────────────────────
    describe("requireAdmin", () => {
        function createApp() {
            const app = new Hono<HonoEnv>();
            app.use("/admin/*", requireAuth, requireAdmin);
            app.get("/admin/dashboard", (c: Context<HonoEnv>) => c.json({ ok: true }));
            return app;
        }

        it("allows admin users", async () => {
            const app = createApp();
            const token = generateAccessToken("admin-1", ["admin"]);
            const res = await app.request("/admin/dashboard", {
                headers: { Authorization: `Bearer ${token}` },
            });
            expect(res.status).toBe(200);
        });

        it("allows schema-admin users", async () => {
            const app = createApp();
            const token = generateAccessToken("schema-admin-1", ["schema-admin"]);
            const res = await app.request("/admin/dashboard", {
                headers: { Authorization: `Bearer ${token}` },
            });
            expect(res.status).toBe(200);
        });

        it("returns 403 for non-admin users", async () => {
            const app = createApp();
            const token = generateAccessToken("user-1", ["editor"]);
            const res = await app.request("/admin/dashboard", {
                headers: { Authorization: `Bearer ${token}` },
            });
            expect(res.status).toBe(403);
            const body = await res.json() as any;
            expect(body.error.code).toBe("FORBIDDEN");
        });

        it("returns 401 when requireAdmin is used without requireAuth", async () => {
            const app = new Hono<HonoEnv>();
            app.use("/admin/*", requireAdmin);
            app.get("/admin/dashboard", (c: Context<HonoEnv>) => c.json({ ok: true }));

            const res = await app.request("/admin/dashboard");
            expect(res.status).toBe(401);
        });
    });

    // ── optionalAuth ────────────────────────────────────────
    describe("optionalAuth", () => {
        function createApp() {
            const app = new Hono<HonoEnv>();
            app.use("/public/*", optionalAuth);
            app.get("/public/feed", (c: Context<HonoEnv>) => {
                const user = c.get("user");
                return c.json({ authenticated: !!user, user: user ?? null });
            });
            return app;
        }

        it("sets user when valid token is present", async () => {
            const app = createApp();
            const token = generateAccessToken("opt-user", ["viewer"]);
            const res = await app.request("/public/feed", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const body = await res.json() as any;
            expect(res.status).toBe(200);
            expect(body.authenticated).toBe(true);
            expect(body.user.userId).toBe("opt-user");
        });

        it("proceeds without user when no token", async () => {
            const app = createApp();
            const res = await app.request("/public/feed");
            const body = await res.json() as any;
            expect(res.status).toBe(200);
            expect(body.authenticated).toBe(false);
            expect(body.user).toBeNull();
        });

        it("proceeds without user when token is invalid", async () => {
            const app = createApp();
            const res = await app.request("/public/feed", {
                headers: { Authorization: "Bearer garbage.token.value" },
            });
            const body = await res.json() as any;
            expect(res.status).toBe(200);
            expect(body.authenticated).toBe(false);
        });
    });

    // ── createAuthMiddleware ────────────────────────────────
    describe("createAuthMiddleware", () => {
        const mockDriver: DataDriver = {
            fetchCollection: jest.fn() as any,
            fetchEntity: jest.fn() as any,
            saveEntity: jest.fn() as any,
            deleteEntity: jest.fn() as any,
        };

        it("sets driver in context", async () => {
            const app = new Hono<HonoEnv>();
            app.use("/*", createAuthMiddleware({ driver: mockDriver }));
            app.get("/test", (c) => {
                const driver = c.get("driver");
                return c.json({ hasDriver: !!driver });
            });

            const res = await app.request("/test");
            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.hasDriver).toBe(true);
        });

        it("enforces auth when requireAuth is true", async () => {
            const app = new Hono<HonoEnv>();
            app.use("/*", createAuthMiddleware({ driver: mockDriver, requireAuth: true }));
            app.get("/test", (c) => c.json({ ok: true }));

            const res = await app.request("/test");
            expect(res.status).toBe(401);
        });

        it("allows anonymous when requireAuth is false", async () => {
            const app = new Hono<HonoEnv>();
            app.use("/*", createAuthMiddleware({ driver: mockDriver, requireAuth: false }));
            app.get("/test", (c) => c.json({ ok: true }));

            const res = await app.request("/test");
            expect(res.status).toBe(200);
        });

        it("extracts JWT and sets user in context", async () => {
            const app = new Hono<HonoEnv>();
            app.use("/*", createAuthMiddleware({ driver: mockDriver }));
            app.get("/test", (c) => {
                const user = c.get("user");
                return c.json({ user });
            });

            const token = generateAccessToken("jwt-user", ["admin"]);
            const res = await app.request("/test", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const body = await res.json() as any;
            expect(body.user.userId).toBe("jwt-user");
            expect(body.user.roles).toEqual(["admin"]);
        });

        it("uses custom validator when provided", async () => {
            const app = new Hono<HonoEnv>();
            app.use("/*", createAuthMiddleware({
                driver: mockDriver,
                validator: async (c: Context<HonoEnv>) => {
                    const apiKey = c.req.header("x-api-key");
                    if (apiKey === "valid-key") {
                        return { userId: "api-user", roles: ["api"] };
                    }
                    return false;
                },
            }));
            app.get("/test", (c) => {
                const user = c.get("user");
                return c.json({ user: user ?? null });
            });

            // Valid API key
            const res = await app.request("/test", {
                headers: { "x-api-key": "valid-key" },
            });
            const body = await res.json() as any;
            expect(body.user.userId).toBe("api-user");

            // Invalid API key
            const res2 = await app.request("/test", {
                headers: { "x-api-key": "bad-key" },
            });
            expect(res2.status).toBe(200); // Not enforcing auth
        });

        it("returns 401 when custom validator throws", async () => {
            const app = new Hono<HonoEnv>();
            app.use("/*", createAuthMiddleware({
                driver: mockDriver,
                validator: async () => { throw new Error("auth failed"); },
            }));
            app.get("/test", (c) => c.json({ ok: true }));

            const res = await app.request("/test");
            expect(res.status).toBe(401);
        });

        it("calls withAuth on driver when available", async () => {
            const scopedDriver = { ...mockDriver, isScopedDriver: true };
            const driverWithAuth = {
                ...mockDriver,
                withAuth: jest.fn().mockResolvedValue(scopedDriver),
            };

            const app = new Hono<HonoEnv>();
            app.use("/*", createAuthMiddleware({ driver: driverWithAuth as any }));
            app.get("/test", (c) => {
                const driver = c.get("driver") as any;
                return c.json({ scoped: !!driver?.isScopedDriver });
            });

            const token = generateAccessToken("rls-user", ["editor"]);
            const res = await app.request("/test", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const body = await res.json() as any;
            expect(body.scoped).toBe(true);
            expect(driverWithAuth.withAuth).toHaveBeenCalledWith(
                expect.objectContaining({ uid: "rls-user", roles: ["editor"] })
            );
        });

        it("handles validator returning true (default user)", async () => {
            const app = new Hono<HonoEnv>();
            app.use("/*", createAuthMiddleware({
                driver: mockDriver,
                validator: async () => true,
            }));
            app.get("/test", (c) => {
                const user = c.get("user");
                return c.json({ user });
            });

            const res = await app.request("/test");
            const body = await res.json() as any;
            expect(body.user.userId).toBe("default");
        });
    });
});
