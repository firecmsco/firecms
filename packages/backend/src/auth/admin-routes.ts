import { Hono } from "hono";
import { ApiError } from "../api/errors";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { UserService, RoleService } from "./services";
import { NewUser } from "../db/auth-schema";
import { requireAuth, requireAdmin } from "./middleware";
import { hashPassword, validatePasswordStrength } from "./password";
import { AuthModuleConfig } from "./routes";
import { HonoEnv } from "../api/types";

/**
 * Create admin routes for user and role management
 */
export function createAdminRoutes(config: AuthModuleConfig): Hono<HonoEnv> {
    const router = new Hono<HonoEnv>();
    const userService = new UserService(config.db);
    const roleService = new RoleService(config.db);

    // Apply auth middleware to all routes
    router.use("/*", requireAuth);

    router.post("/bootstrap", async (c) => {
        const user = c.get("user");
        if (!user || typeof user !== "object") {
            throw ApiError.unauthorized("Not authenticated");
        }

        const users = await userService.listUsers();
        let hasAdmin = false;

        for (const u of users) {
            const roles = await userService.getUserRoleIds(u.id);
            if (roles.includes("admin")) {
                hasAdmin = true;
                break;
            }
        }

        if (hasAdmin) {
            throw ApiError.forbidden("Admin users already exist. Bootstrap not allowed.");
        }

        const userId = "userId" in user ? user.userId : undefined;
        if (!userId) {
            throw ApiError.unauthorized("User ID not found in auth context");
        }
        await userService.setUserRoles(userId, ["admin"]);

        return c.json({
            success: true,
            message: "You are now an admin",
            user: {
                uid: userId,
                roles: ["admin"]
            }
        });
    });

    router.get("/users", async (c) => {
        const users = await userService.listUsers();
        const usersWithRoles = await Promise.all(
            users.map(async (u) => {
                const roles = await userService.getUserRoleIds(u.id);
                return {
                    uid: u.id,
                    email: u.email,
                    displayName: u.displayName,
                    photoURL: u.photoUrl,
                    provider: u.provider,
                    roles,
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt
                };
            })
        );
        return c.json({ users: usersWithRoles });
    });

    router.get("/users/:userId", async (c) => {
        const userId = c.req.param("userId");
        const result = await userService.getUserWithRoles(userId);

        if (!result) {
            throw ApiError.notFound("User not found");
        }

        return c.json({
            user: {
                uid: result.user.id,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoUrl,
                provider: result.user.provider,
                roles: result.roles.map(r => r.id),
                createdAt: result.user.createdAt,
                updatedAt: result.user.updatedAt
            }
        });
    });

    router.post("/users", requireAdmin, async (c) => {
        const body = await c.req.json();
        const { email, displayName, password, roles } = body;

        if (!email) {
            throw ApiError.badRequest("Email is required", "INVALID_INPUT");
        }

        const existing = await userService.getUserByEmail(email);
        if (existing) {
            throw ApiError.conflict("Email already exists", "EMAIL_EXISTS");
        }

        let passwordHash: string | undefined;
        if (password) {
            const validation = validatePasswordStrength(password);
            if (!validation.valid) {
                throw ApiError.badRequest(validation.errors.join(". "), "WEAK_PASSWORD");
            }
            passwordHash = await hashPassword(password);
        }

        const user = await userService.createUser({
            email: email.toLowerCase(),
            displayName: displayName || null,
            passwordHash,
            provider: password ? "email" : "admin_created"
        });

        if (roles && Array.isArray(roles) && roles.length > 0) {
            await userService.setUserRoles(user.id, roles);
        } else {
            await userService.assignDefaultRole(user.id, "editor");
        }

        const userRoles = await userService.getUserRoleIds(user.id);

        return c.json({
            user: {
                uid: user.id,
                email: user.email,
                displayName: user.displayName,
                roles: userRoles
            }
        }, 201);
    });

    router.put("/users/:userId", requireAdmin, async (c) => {
        const userId = c.req.param("userId");
        const body = await c.req.json();
        const { email, displayName, password, roles } = body;

        const existing = await userService.getUserById(userId);
        if (!existing) {
            throw ApiError.notFound("User not found");
        }

        const updates: Partial<NewUser> = {};
        if (email !== undefined) updates.email = email.toLowerCase();
        if (displayName !== undefined) updates.displayName = displayName;

        if (password) {
            const validation = validatePasswordStrength(password);
            if (!validation.valid) {
                throw ApiError.badRequest(validation.errors.join(". "), "WEAK_PASSWORD");
            }
            updates.passwordHash = await hashPassword(password);
        }

        if (Object.keys(updates).length > 0) {
            await userService.updateUser(userId, updates);
        }

        if (roles !== undefined && Array.isArray(roles)) {
            await userService.setUserRoles(userId, roles);
        }

        const result = await userService.getUserWithRoles(userId);

        return c.json({
            user: {
                uid: result!.user.id,
                email: result!.user.email,
                displayName: result!.user.displayName,
                roles: result!.roles.map(r => r.id)
            }
        });
    });

    router.delete("/users/:userId", requireAdmin, async (c) => {
        const userId = c.req.param("userId");
        const user = c.get("user");

        const currentUserId = user && typeof user === "object" && "userId" in user ? user.userId : undefined;
        if (currentUserId === userId) {
            throw ApiError.badRequest("Cannot delete your own account", "SELF_DELETE");
        }

        const existing = await userService.getUserById(userId);
        if (!existing) {
            throw ApiError.notFound("User not found");
        }

        await userService.deleteUser(userId);

        return c.json({ success: true });
    });

    router.get("/roles", async (c) => {
        const roles = await roleService.listRoles();

        return c.json({
            roles: roles.map(r => ({
                id: r.id,
                name: r.name,
                isAdmin: r.isAdmin,
                defaultPermissions: r.defaultPermissions,
                config: r.config
            }))
        });
    });

    router.get("/roles/:roleId", async (c) => {
        const roleId = c.req.param("roleId");
        const role = await roleService.getRoleById(roleId);

        if (!role) {
            throw ApiError.notFound("Role not found");
        }

        return c.json({ role });
    });

    router.post("/roles", requireAdmin, async (c) => {
        const body = await c.req.json();
        const { id, name, isAdmin, defaultPermissions, config } = body;

        if (!id || !name) {
            throw ApiError.badRequest("Role ID and name are required", "INVALID_INPUT");
        }

        const existing = await roleService.getRoleById(id);
        if (existing) {
            throw ApiError.conflict("Role already exists", "ROLE_EXISTS");
        }

        const role = await roleService.createRole({
            id,
            name,
            isAdmin: isAdmin ?? false,
            defaultPermissions: defaultPermissions ?? null,
            config: config ?? null
        });

        return c.json({ role }, 201);
    });

    router.put("/roles/:roleId", requireAdmin, async (c) => {
        const roleId = c.req.param("roleId");
        const body = await c.req.json();
        const { name, isAdmin, defaultPermissions, config } = body;

        const existing = await roleService.getRoleById(roleId);
        if (!existing) {
            throw ApiError.notFound("Role not found");
        }

        const role = await roleService.updateRole(roleId, {
            name,
            isAdmin,
            defaultPermissions,
            config
        });

        return c.json({ role });
    });

    router.delete("/roles/:roleId", requireAdmin, async (c) => {
        const roleId = c.req.param("roleId");

        if (["admin", "editor", "viewer"].includes(roleId)) {
            throw ApiError.badRequest("Cannot delete built-in roles", "BUILTIN_ROLE");
        }

        const existing = await roleService.getRoleById(roleId);
        if (!existing) {
            throw ApiError.notFound("Role not found");
        }

        await roleService.deleteRole(roleId);

        return c.json({ success: true });
    });

    return router;
}
