import { Router, Response } from "express";
import { ApiError, asyncHandler } from "../api/errors";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { UserService, RoleService, Role } from "./services";
import { NewUser } from "../db/auth-schema";
import { requireAuth, requireAdmin, AuthenticatedRequest } from "./middleware";
import { hashPassword, validatePasswordStrength } from "./password";
import { AuthModuleConfig } from "./routes";

/**
 * Create admin routes for user and role management
 * Read operations require authentication only
 * Write operations (create, update, delete) require admin role
 */
export function createAdminRoutes(config: AuthModuleConfig): Router {
    const router = Router();
    const userService = new UserService(config.db);
    const roleService = new RoleService(config.db);

    // Apply auth middleware to all routes (but NOT requireAdmin for reads)
    router.use(requireAuth);

    // ============================================
    // BOOTSTRAP ENDPOINT - Make yourself admin when no admins exist
    // ============================================

    /**
     * POST /admin/bootstrap
     * Allows current user to make themselves admin if no admin users exist
     * This is for initial setup only
     */
    router.post("/bootstrap", asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user) {
            throw ApiError.unauthorized("Not authenticated");
        }

        // Check if any admin users exist
        const users = await userService.listUsers();
        let hasAdmin = false;

        for (const user of users) {
            const roles = await userService.getUserRoleIds(user.id);
            if (roles.includes("admin")) {
                hasAdmin = true;
                break;
            }
        }

        if (hasAdmin) {
            throw ApiError.forbidden("Admin users already exist. Bootstrap not allowed.");
        }

        // Make current user admin
        await userService.setUserRoles(req.user.userId, ["admin"]);

        console.log(`Bootstrap: User ${req.user.userId} promoted to admin`);

        res.json({
            success: true,
            message: "You are now an admin",
            user: {
                uid: req.user.userId,
                roles: ["admin"]
            }
        });
    }));

    // ============================================
    // USER MANAGEMENT ROUTES
    // ============================================

    /**
     * GET /admin/users
     * List all users with their roles
     * Any authenticated user can view
     */
    router.get("/users", asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const users = await userService.listUsers();

        // Get roles for each user
        const usersWithRoles = await Promise.all(
            users.map(async (user) => {
                const roles = await userService.getUserRoleIds(user.id);
                return {
                    uid: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoUrl,
                    provider: user.provider,
                    roles,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            })
        );

        res.json({ users: usersWithRoles });
    }));

    /**
     * GET /admin/users/:userId
     * Get a single user by ID
     */
    router.get("/users/:userId", asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.params.userId as string;
        const result = await userService.getUserWithRoles(userId);

        if (!result) {
            throw ApiError.notFound("User not found");
        }

        res.json({
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
    }));

    /**
     * POST /admin/users
     * Create a new user (admin-created, no password required initially)
     * Requires admin role
     */
    router.post("/users", requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { email, displayName, password, roles } = req.body;

        if (!email) {
            throw ApiError.badRequest("Email is required", "INVALID_INPUT");
        }

        // Check if email exists
        const existing = await userService.getUserByEmail(email);
        if (existing) {
            throw ApiError.conflict("Email already exists", "EMAIL_EXISTS");
        }

        // Hash password if provided
        let passwordHash: string | undefined;
        if (password) {
            const validation = validatePasswordStrength(password);
            if (!validation.valid) {
                throw ApiError.badRequest(validation.errors.join(". "), "WEAK_PASSWORD");
            }
            passwordHash = await hashPassword(password);
        }

        // Create user
        const user = await userService.createUser({
            email: email.toLowerCase(),
            displayName: displayName || null,
            passwordHash,
            provider: password ? "email" : "admin_created"
        });

        // Assign roles
        if (roles && Array.isArray(roles) && roles.length > 0) {
            await userService.setUserRoles(user.id, roles);
        } else {
            await userService.assignDefaultRole(user.id, "editor");
        }

        const userRoles = await userService.getUserRoleIds(user.id);

        res.status(201).json({
            user: {
                uid: user.id,
                email: user.email,
                displayName: user.displayName,
                roles: userRoles
            }
        });
    }));

    /**
     * PUT /admin/users/:userId
     * Update a user - requires admin role
     */
    router.put("/users/:userId", requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.params.userId as string;
        const { email, displayName, password, roles } = req.body;

        const existing = await userService.getUserById(userId);
        if (!existing) {
            throw ApiError.notFound("User not found");
        }

        // Build update object
        const updates: Partial<NewUser> = {};
        if (email !== undefined) updates.email = email.toLowerCase();
        if (displayName !== undefined) updates.displayName = displayName;

        // Update password if provided
        if (password) {
            const validation = validatePasswordStrength(password);
            if (!validation.valid) {
                throw ApiError.badRequest(validation.errors.join(". "), "WEAK_PASSWORD");
            }
            updates.passwordHash = await hashPassword(password);
        }

        // Update user
        if (Object.keys(updates).length > 0) {
            await userService.updateUser(userId, updates);
        }

        // Update roles if provided
        if (roles !== undefined && Array.isArray(roles)) {
            await userService.setUserRoles(userId, roles);
        }

        const result = await userService.getUserWithRoles(userId);

        res.json({
            user: {
                uid: result!.user.id,
                email: result!.user.email,
                displayName: result!.user.displayName,
                roles: result!.roles.map(r => r.id)
            }
        });
    }));

    /**
     * DELETE /admin/users/:userId
     * Delete a user - requires admin role
     */
    router.delete("/users/:userId", requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.params.userId as string;

        // Prevent self-deletion
        if (req.user?.userId === userId) {
            throw ApiError.badRequest("Cannot delete your own account", "SELF_DELETE");
        }

        const existing = await userService.getUserById(userId);
        if (!existing) {
            throw ApiError.notFound("User not found");
        }

        await userService.deleteUser(userId);

        res.json({ success: true });
    }));

    // ============================================
    // ROLE MANAGEMENT ROUTES
    // ============================================

    /**
     * GET /admin/roles
     * List all roles
     */
    router.get("/roles", asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const roles = await roleService.listRoles();

        res.json({
            roles: roles.map(r => ({
                id: r.id,
                name: r.name,
                isAdmin: r.isAdmin,
                defaultPermissions: r.defaultPermissions,
                config: r.config
            }))
        });
    }));

    /**
     * GET /admin/roles/:roleId
     * Get a single role
     */
    router.get("/roles/:roleId", asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const roleId = req.params.roleId as string;
        const role = await roleService.getRoleById(roleId);

        if (!role) {
            throw ApiError.notFound("Role not found");
        }

        res.json({ role });
    }));

    /**
     * POST /admin/roles
     * Create a new role - requires admin role
     */
    router.post("/roles", requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { id, name, isAdmin, defaultPermissions, config } = req.body;

        if (!id || !name) {
            throw ApiError.badRequest("Role ID and name are required", "INVALID_INPUT");
        }

        // Check if role exists
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

        res.status(201).json({ role });
    }));

    /**
     * PUT /admin/roles/:roleId
     * Update a role - requires admin role
     */
    router.put("/roles/:roleId", requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const roleId = req.params.roleId as string;
        const { name, isAdmin, defaultPermissions, config } = req.body;

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

        res.json({ role });
    }));

    /**
     * DELETE /admin/roles/:roleId
     * Delete a role - requires admin role
     */
    router.delete("/roles/:roleId", requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const roleId = req.params.roleId as string;

        // Prevent deletion of built-in roles
        if (["admin", "editor", "viewer"].includes(roleId)) {
            throw ApiError.badRequest("Cannot delete built-in roles", "BUILTIN_ROLE");
        }

        const existing = await roleService.getRoleById(roleId);
        if (!existing) {
            throw ApiError.notFound("Role not found");
        }

        await roleService.deleteRole(roleId);

        res.json({ success: true });
    }));

    return router;
}
