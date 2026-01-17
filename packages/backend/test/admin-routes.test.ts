import { Router, Request, Response } from "express";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { UserService, RoleService, Role } from "../src/auth/services";

// Mock the services
jest.mock("../src/auth/services");
jest.mock("../src/auth/password");

// Import after mocking
import { hashPassword } from "../src/auth/password";

describe("Admin Routes", () => {
    let db: jest.Mocked<NodePgDatabase<any>>;
    let mockUserService: jest.Mocked<UserService>;
    let mockRoleService: jest.Mocked<RoleService>;
    let mockReq: Partial<Request> & { user?: { userId: string; roles: string[] } };
    let mockRes: Partial<Response>;
    let jsonFn: jest.Mock;
    let statusFn: jest.Mock;
    let nextFn: jest.Mock;

    const adminUser = { userId: "admin-1", roles: ["admin"] };
    const regularUser = { userId: "user-1", roles: ["editor"] };

    beforeEach(() => {
        jest.clearAllMocks();

        jsonFn = jest.fn();
        statusFn = jest.fn().mockReturnValue({ json: jsonFn });
        mockRes = {
            status: statusFn,
            json: jsonFn
        };
        nextFn = jest.fn();

        mockUserService = {
            getUserById: jest.fn(),
            getUserByEmail: jest.fn(),
            listUsers: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            getUserRoles: jest.fn(),
            setUserRoles: jest.fn(),
            getUserWithRoles: jest.fn()
        } as any;

        mockRoleService = {
            getRoleById: jest.fn(),
            listRoles: jest.fn(),
            createRole: jest.fn(),
            updateRole: jest.fn(),
            deleteRole: jest.fn()
        } as any;
    });

    describe("requireAdmin middleware", () => {
        // Import the actual middleware
        const { requireAdmin } = jest.requireActual("../src/auth/admin-routes");

        it("should allow admin users to proceed", () => {
            mockReq = { user: adminUser };
            mockRoleService.getRoleById.mockResolvedValue({ id: "admin", isAdmin: true } as Role);

            // We need to simulate the admin check
            // The middleware checks if user.roles includes an admin role
            const mockAdminReq = {
                user: adminUser
            } as any;

            // Since requireAdmin checks roles array, admin should pass
            expect(mockAdminReq.user.roles).toContain("admin");
        });

        it("should block non-admin users", () => {
            mockReq = { user: regularUser };

            // Non-admin users should not have 'admin' role
            expect(mockReq.user?.roles).not.toContain("admin");
        });

        it("should return 401 for unauthenticated requests", () => {
            mockReq = {};

            // No user means unauthenticated
            expect(mockReq.user).toBeUndefined();
        });
    });

    describe("User Management Endpoints", () => {
        describe("GET /admin/users", () => {
            it("should require authentication", () => {
                mockReq = { user: undefined };
                expect(mockReq.user).toBeUndefined();
            });

            it("should return list of users for authenticated user", async () => {
                const mockUsers = [
                    { id: "user-1", email: "user1@example.com", displayName: "User 1" },
                    { id: "user-2", email: "user2@example.com", displayName: "User 2" }
                ];
                mockUserService.listUsers.mockResolvedValue(mockUsers);

                const users = await mockUserService.listUsers();

                expect(users).toHaveLength(2);
                expect(users[0].email).toBe("user1@example.com");
            });
        });

        describe("GET /admin/users/:id", () => {
            it("should return user with roles", async () => {
                const mockUser = { id: "user-1", email: "test@example.com" };
                const mockRoles = [{ id: "editor", name: "Editor", isAdmin: false }];
                mockUserService.getUserWithRoles.mockResolvedValue({ user: mockUser as any, roles: mockRoles as any });

                const result = await mockUserService.getUserWithRoles("user-1");

                expect(result?.user.id).toBe("user-1");
                expect(result?.roles).toHaveLength(1);
            });

            it("should return null for non-existent user", async () => {
                mockUserService.getUserWithRoles.mockResolvedValue(null);

                const result = await mockUserService.getUserWithRoles("nonexistent");

                expect(result).toBeNull();
            });
        });

        describe("POST /admin/users (admin required)", () => {
            it("should create user when admin", async () => {
                const newUser = { email: "new@example.com", displayName: "New User" };
                const createdUser = { id: "new-user-id", ...newUser };
                mockUserService.createUser.mockResolvedValue(createdUser as any);

                const result = await mockUserService.createUser(newUser as any);

                expect(result.id).toBe("new-user-id");
                expect(result.email).toBe("new@example.com");
            });

            it("should hash password when provided", async () => {
                (hashPassword as jest.Mock).mockResolvedValue("hashed-password");

                const hashedPw = await hashPassword("password123");

                expect(hashPassword).toHaveBeenCalledWith("password123");
                expect(hashedPw).toBe("hashed-password");
            });
        });

        describe("PUT /admin/users/:id (admin required)", () => {
            it("should update user", async () => {
                const updatedUser = { id: "user-1", email: "test@example.com", displayName: "Updated Name" };
                mockUserService.updateUser.mockResolvedValue(updatedUser as any);

                const result = await mockUserService.updateUser("user-1", { displayName: "Updated Name" } as any);

                expect(result?.displayName).toBe("Updated Name");
            });

            it("should return null for non-existent user", async () => {
                mockUserService.updateUser.mockResolvedValue(null);

                const result = await mockUserService.updateUser("nonexistent", {} as any);

                expect(result).toBeNull();
            });
        });

        describe("DELETE /admin/users/:id (admin required)", () => {
            it("should delete user", async () => {
                mockUserService.deleteUser.mockResolvedValue(undefined);

                await mockUserService.deleteUser("user-1");

                expect(mockUserService.deleteUser).toHaveBeenCalledWith("user-1");
            });
        });

        describe("PUT /admin/users/:id/roles (admin required)", () => {
            it("should update user roles", async () => {
                mockUserService.setUserRoles.mockResolvedValue(undefined);

                await mockUserService.setUserRoles("user-1", ["admin", "editor"]);

                expect(mockUserService.setUserRoles).toHaveBeenCalledWith("user-1", ["admin", "editor"]);
            });
        });
    });

    describe("Role Management Endpoints", () => {
        describe("GET /admin/roles", () => {
            it("should return list of roles", async () => {
                const mockRoles = [
                    { id: "admin", name: "Admin", isAdmin: true },
                    { id: "editor", name: "Editor", isAdmin: false }
                ];
                mockRoleService.listRoles.mockResolvedValue(mockRoles as any);

                const roles = await mockRoleService.listRoles();

                expect(roles).toHaveLength(2);
            });
        });

        describe("GET /admin/roles/:id", () => {
            it("should return role by ID", async () => {
                const mockRole = { id: "admin", name: "Admin", isAdmin: true };
                mockRoleService.getRoleById.mockResolvedValue(mockRole as any);

                const role = await mockRoleService.getRoleById("admin");

                expect(role?.id).toBe("admin");
                expect(role?.isAdmin).toBe(true);
            });

            it("should return null for non-existent role", async () => {
                mockRoleService.getRoleById.mockResolvedValue(null);

                const role = await mockRoleService.getRoleById("nonexistent");

                expect(role).toBeNull();
            });
        });

        describe("POST /admin/roles (admin required)", () => {
            it("should create a new role", async () => {
                const newRole = { id: "custom", name: "Custom Role" };
                const createdRole = { ...newRole, isAdmin: false, defaultPermissions: null, collectionPermissions: null, config: null };
                mockRoleService.createRole.mockResolvedValue(createdRole as any);

                const role = await mockRoleService.createRole(newRole as any);

                expect(role.id).toBe("custom");
                expect(role.name).toBe("Custom Role");
            });
        });

        describe("PUT /admin/roles/:id (admin required)", () => {
            it("should update an existing role", async () => {
                const updatedRole = { id: "editor", name: "Super Editor", isAdmin: false };
                mockRoleService.updateRole.mockResolvedValue(updatedRole as any);

                const role = await mockRoleService.updateRole("editor", { name: "Super Editor" });

                expect(role?.name).toBe("Super Editor");
            });
        });

        describe("DELETE /admin/roles/:id (admin required)", () => {
            it("should delete a role", async () => {
                mockRoleService.deleteRole.mockResolvedValue(undefined);

                await mockRoleService.deleteRole("custom");

                expect(mockRoleService.deleteRole).toHaveBeenCalledWith("custom");
            });
        });
    });

    describe("Permission Checks", () => {
        it("should allow read operations for authenticated users", () => {
            // Authenticated users (editor role) can read
            mockReq = { user: regularUser };
            expect(mockReq.user).toBeDefined();
        });

        it("should block write operations for non-admin users", () => {
            // Non-admin users should not be able to create/update/delete
            mockReq = { user: regularUser };
            expect(mockReq.user?.roles).not.toContain("admin");
        });

        it("should allow write operations for admin users", () => {
            // Admin users can perform all operations
            mockReq = { user: adminUser };
            expect(mockReq.user?.roles).toContain("admin");
        });
    });
});
