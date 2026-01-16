import { Router, Response } from "express";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { UserService, RoleService, Role } from "./services";
import { requireAuth, AuthenticatedRequest } from "./middleware";
import { hashPassword, validatePasswordStrength } from "./password";

export interface AdminRoutesConfig {
    db: NodePgDatabase;
}

/**
 * Middleware to check if user has admin role
 */
function requireAdmin(req: AuthenticatedRequest, res: Response, next: () => void): void {
    if (!req.user) {
        res.status(401).json({ error: { message: "Not authenticated", code: "UNAUTHORIZED" } });
        return;
    }

    const isAdmin = req.user.roles?.includes("admin");
    if (!isAdmin) {
        res.status(403).json({ error: { message: "Admin access required", code: "FORBIDDEN" } });
        return;
    }

    next();
}

/**
 * Create admin routes for user and role management
 * Read operations require authentication only
 * Write operations (create, update, delete) require admin role
 */
export function createAdminRoutes(config: AdminRoutesConfig): Router {
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
    router.post("/bootstrap", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: { message: "Not authenticated", code: "UNAUTHORIZED" } });
                return;
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
                res.status(403).json({ error: { message: "Admin users already exist. Bootstrap not allowed.", code: "FORBIDDEN" } });
                return;
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
        } catch (error: any) {
            console.error("Bootstrap error:", error);
            res.status(500).json({ error: { message: "Failed to bootstrap admin", code: "INTERNAL_ERROR" } });
        }
    });

    // ============================================
    // USER MANAGEMENT ROUTES
    // ============================================

    /**
     * GET /admin/users
     * List all users with their roles
     * Any authenticated user can view
     */
    router.get("/users", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
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
        } catch (error: any) {
            console.error("List users error:", error);
            res.status(500).json({ error: { message: "Failed to list users", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * GET /admin/users/:userId
     * Get a single user by ID
     */
    router.get("/users/:userId", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId as string;
            const result = await userService.getUserWithRoles(userId);

            if (!result) {
                res.status(404).json({ error: { message: "User not found", code: "NOT_FOUND" } });
                return;
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
        } catch (error: any) {
            console.error("Get user error:", error);
            res.status(500).json({ error: { message: "Failed to get user", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * POST /admin/users
     * Create a new user (admin-created, no password required initially)
     * Requires admin role
     */
    router.post("/users", requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { email, displayName, password, roles } = req.body;

            if (!email) {
                res.status(400).json({ error: { message: "Email is required", code: "INVALID_INPUT" } });
                return;
            }

            // Check if email exists
            const existing = await userService.getUserByEmail(email);
            if (existing) {
                res.status(409).json({ error: { message: "Email already exists", code: "EMAIL_EXISTS" } });
                return;
            }

            // Hash password if provided
            let passwordHash: string | undefined;
            if (password) {
                const validation = validatePasswordStrength(password);
                if (!validation.valid) {
                    res.status(400).json({ error: { message: validation.errors.join(". "), code: "WEAK_PASSWORD" } });
                    return;
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
        } catch (error: any) {
            console.error("Create user error:", error);
            res.status(500).json({ error: { message: "Failed to create user", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * PUT /admin/users/:userId
     * Update a user - requires admin role
     */
    router.put("/users/:userId", requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId as string;
            const { email, displayName, password, roles } = req.body;

            const existing = await userService.getUserById(userId);
            if (!existing) {
                res.status(404).json({ error: { message: "User not found", code: "NOT_FOUND" } });
                return;
            }

            // Build update object
            const updates: any = {};
            if (email !== undefined) updates.email = email.toLowerCase();
            if (displayName !== undefined) updates.displayName = displayName;

            // Update password if provided
            if (password) {
                const validation = validatePasswordStrength(password);
                if (!validation.valid) {
                    res.status(400).json({ error: { message: validation.errors.join(". "), code: "WEAK_PASSWORD" } });
                    return;
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
        } catch (error: any) {
            console.error("Update user error:", error);
            res.status(500).json({ error: { message: "Failed to update user", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * DELETE /admin/users/:userId
     * Delete a user - requires admin role
     */
    router.delete("/users/:userId", requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId as string;

            // Prevent self-deletion
            if (req.user?.userId === userId) {
                res.status(400).json({ error: { message: "Cannot delete your own account", code: "SELF_DELETE" } });
                return;
            }

            const existing = await userService.getUserById(userId);
            if (!existing) {
                res.status(404).json({ error: { message: "User not found", code: "NOT_FOUND" } });
                return;
            }

            await userService.deleteUser(userId);

            res.json({ success: true });
        } catch (error: any) {
            console.error("Delete user error:", error);
            res.status(500).json({ error: { message: "Failed to delete user", code: "INTERNAL_ERROR" } });
        }
    });

    // ============================================
    // ROLE MANAGEMENT ROUTES
    // ============================================

    /**
     * GET /admin/roles
     * List all roles
     */
    router.get("/roles", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
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
        } catch (error: any) {
            console.error("List roles error:", error);
            res.status(500).json({ error: { message: "Failed to list roles", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * GET /admin/roles/:roleId
     * Get a single role
     */
    router.get("/roles/:roleId", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const roleId = req.params.roleId as string;
            const role = await roleService.getRoleById(roleId);

            if (!role) {
                res.status(404).json({ error: { message: "Role not found", code: "NOT_FOUND" } });
                return;
            }

            res.json({ role });
        } catch (error: any) {
            console.error("Get role error:", error);
            res.status(500).json({ error: { message: "Failed to get role", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * POST /admin/roles
     * Create a new role - requires admin role
     */
    router.post("/roles", requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { id, name, isAdmin, defaultPermissions, config } = req.body;

            if (!id || !name) {
                res.status(400).json({ error: { message: "Role ID and name are required", code: "INVALID_INPUT" } });
                return;
            }

            // Check if role exists
            const existing = await roleService.getRoleById(id);
            if (existing) {
                res.status(409).json({ error: { message: "Role already exists", code: "ROLE_EXISTS" } });
                return;
            }

            const role = await roleService.createRole({
                id,
                name,
                isAdmin: isAdmin ?? false,
                defaultPermissions: defaultPermissions ?? null,
                config: config ?? null
            });

            res.status(201).json({ role });
        } catch (error: any) {
            console.error("Create role error:", error);
            res.status(500).json({ error: { message: "Failed to create role", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * PUT /admin/roles/:roleId
     * Update a role - requires admin role
     */
    router.put("/roles/:roleId", requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const roleId = req.params.roleId as string;
            const { name, isAdmin, defaultPermissions, config } = req.body;

            const existing = await roleService.getRoleById(roleId);
            if (!existing) {
                res.status(404).json({ error: { message: "Role not found", code: "NOT_FOUND" } });
                return;
            }

            const role = await roleService.updateRole(roleId, {
                name,
                isAdmin,
                defaultPermissions,
                config
            });

            res.json({ role });
        } catch (error: any) {
            console.error("Update role error:", error);
            res.status(500).json({ error: { message: "Failed to update role", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * DELETE /admin/roles/:roleId
     * Delete a role - requires admin role
     */
    router.delete("/roles/:roleId", requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const roleId = req.params.roleId as string;

            // Prevent deletion of built-in roles
            if (["admin", "editor", "viewer"].includes(roleId)) {
                res.status(400).json({ error: { message: "Cannot delete built-in roles", code: "BUILTIN_ROLE" } });
                return;
            }

            const existing = await roleService.getRoleById(roleId);
            if (!existing) {
                res.status(404).json({ error: { message: "Role not found", code: "NOT_FOUND" } });
                return;
            }

            await roleService.deleteRole(roleId);

            res.json({ success: true });
        } catch (error: any) {
            console.error("Delete role error:", error);
            res.status(500).json({ error: { message: "Failed to delete role", code: "INTERNAL_ERROR" } });
        }
    });

    return router;
}
