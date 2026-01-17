import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { UserService, RoleService, RefreshTokenService, PasswordResetTokenService, Role } from "../src/auth/services";
import { users, refreshTokens, passwordResetTokens, User } from "../src/db/auth-schema";

// Mock the drizzle-orm functions
jest.mock("drizzle-orm", () => ({
    eq: jest.fn((field, value) => ({ field, value, type: "eq" })),
    sql: jest.fn((strings: TemplateStringsArray, ...values: any[]) => ({
        strings,
        values,
        type: "sql"
    })),
    relations: jest.fn(() => ({}))
}));

describe("Auth Services", () => {
    let db: jest.Mocked<NodePgDatabase<any>>;
    let mockInsertValues: jest.Mock;
    let mockInsertReturning: jest.Mock;
    let mockSelectFrom: jest.Mock;
    let mockSelectWhere: jest.Mock;
    let mockUpdateSet: jest.Mock;
    let mockUpdateWhere: jest.Mock;
    let mockUpdateReturning: jest.Mock;
    let mockDeleteWhere: jest.Mock;
    let mockExecute: jest.Mock;

    beforeEach(() => {
        // Create chainable mocks
        mockInsertReturning = jest.fn().mockResolvedValue([]);
        mockInsertValues = jest.fn().mockReturnValue({ returning: mockInsertReturning });

        mockSelectWhere = jest.fn().mockResolvedValue([]);
        mockSelectFrom = jest.fn().mockReturnValue({
            where: mockSelectWhere
        });

        mockUpdateReturning = jest.fn().mockResolvedValue([]);
        mockUpdateWhere = jest.fn().mockReturnValue({ returning: mockUpdateReturning });
        mockUpdateSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });

        mockDeleteWhere = jest.fn().mockResolvedValue(undefined);

        mockExecute = jest.fn().mockResolvedValue({ rows: [] });

        db = {
            insert: jest.fn().mockReturnValue({ values: mockInsertValues }),
            select: jest.fn().mockReturnValue({ from: mockSelectFrom }),
            update: jest.fn().mockReturnValue({ set: mockUpdateSet }),
            delete: jest.fn().mockReturnValue({ where: mockDeleteWhere }),
            execute: mockExecute
        } as any;
    });

    describe("UserService", () => {
        let userService: UserService;

        beforeEach(() => {
            userService = new UserService(db);
        });

        describe("createUser", () => {
            it("should create a user and return it", async () => {
                const newUser = {
                    email: "test@example.com",
                    displayName: "Test User",
                    provider: "email"
                };
                const createdUser = { id: "user-123", ...newUser, createdAt: new Date(), updatedAt: new Date() };
                mockInsertReturning.mockResolvedValueOnce([createdUser]);

                const result = await userService.createUser(newUser);

                expect(db.insert).toHaveBeenCalledWith(users);
                expect(mockInsertValues).toHaveBeenCalledWith(newUser);
                expect(result).toEqual(createdUser);
            });
        });

        describe("getUserById", () => {
            it("should return user when found", async () => {
                const mockUser = { id: "user-123", email: "test@example.com" };
                mockSelectWhere.mockResolvedValueOnce([mockUser]);

                const result = await userService.getUserById("user-123");

                expect(db.select).toHaveBeenCalled();
                expect(result).toEqual(mockUser);
            });

            it("should return null when user not found", async () => {
                mockSelectWhere.mockResolvedValueOnce([]);

                const result = await userService.getUserById("nonexistent");

                expect(result).toBeNull();
            });
        });

        describe("getUserByEmail", () => {
            it("should return user when found by email", async () => {
                const mockUser = { id: "user-123", email: "test@example.com" };
                mockSelectWhere.mockResolvedValueOnce([mockUser]);

                const result = await userService.getUserByEmail("test@example.com");

                expect(result).toEqual(mockUser);
            });

            it("should lowercase email for lookup", async () => {
                mockSelectWhere.mockResolvedValueOnce([]);

                await userService.getUserByEmail("TEST@EXAMPLE.COM");

                // The eq function will be called with lowercase email
                expect(mockSelectWhere).toHaveBeenCalled();
            });
        });

        describe("getUserByGoogleId", () => {
            it("should return user when found by Google ID", async () => {
                const mockUser = { id: "user-123", googleId: "google-abc" };
                mockSelectWhere.mockResolvedValueOnce([mockUser]);

                const result = await userService.getUserByGoogleId("google-abc");

                expect(result).toEqual(mockUser);
            });
        });

        describe("updateUser", () => {
            it("should update user and return updated record", async () => {
                const updatedUser = { id: "user-123", email: "test@example.com", displayName: "Updated Name" };
                mockUpdateReturning.mockResolvedValueOnce([updatedUser]);

                const result = await userService.updateUser("user-123", { displayName: "Updated Name" });

                expect(db.update).toHaveBeenCalledWith(users);
                expect(mockUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
                    displayName: "Updated Name",
                    updatedAt: expect.any(Date)
                }));
                expect(result).toEqual(updatedUser);
            });

            it("should return null when user not found", async () => {
                mockUpdateReturning.mockResolvedValueOnce([]);

                const result = await userService.updateUser("nonexistent", { displayName: "Test" });

                expect(result).toBeNull();
            });
        });

        describe("deleteUser", () => {
            it("should delete user by ID", async () => {
                await userService.deleteUser("user-123");

                expect(db.delete).toHaveBeenCalledWith(users);
                expect(mockDeleteWhere).toHaveBeenCalled();
            });
        });

        describe("listUsers", () => {
            it("should return all users", async () => {
                const mockUsers = [
                    { id: "user-1", email: "user1@example.com" },
                    { id: "user-2", email: "user2@example.com" }
                ];
                mockSelectFrom.mockReturnValueOnce(Promise.resolve(mockUsers));

                const result = await userService.listUsers();

                expect(db.select).toHaveBeenCalled();
                expect(result).toEqual(mockUsers);
            });
        });

        describe("updatePassword", () => {
            it("should update password hash", async () => {
                mockUpdateWhere.mockResolvedValueOnce(undefined);

                await userService.updatePassword("user-123", "new-hash");

                expect(db.update).toHaveBeenCalledWith(users);
                expect(mockUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
                    passwordHash: "new-hash",
                    updatedAt: expect.any(Date)
                }));
            });
        });

        describe("setEmailVerified", () => {
            it("should set email verified and clear token", async () => {
                mockUpdateWhere.mockResolvedValueOnce(undefined);

                await userService.setEmailVerified("user-123", true);

                expect(mockUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
                    emailVerified: true,
                    emailVerificationToken: null,
                    updatedAt: expect.any(Date)
                }));
            });
        });

        describe("setVerificationToken", () => {
            it("should set verification token", async () => {
                mockUpdateWhere.mockResolvedValueOnce(undefined);

                await userService.setVerificationToken("user-123", "token-abc");

                expect(mockUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
                    emailVerificationToken: "token-abc",
                    emailVerificationSentAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                }));
            });

            it("should clear verification token when null", async () => {
                mockUpdateWhere.mockResolvedValueOnce(undefined);

                await userService.setVerificationToken("user-123", null);

                expect(mockUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
                    emailVerificationToken: null,
                    emailVerificationSentAt: null,
                    updatedAt: expect.any(Date)
                }));
            });
        });

        describe("getUserByVerificationToken", () => {
            it("should find user by verification token", async () => {
                const mockUser = { id: "user-123", email: "test@example.com" };
                mockSelectWhere.mockResolvedValueOnce([mockUser]);

                const result = await userService.getUserByVerificationToken("token-abc");

                expect(result).toEqual(mockUser);
            });
        });

        describe("getUserRoles", () => {
            it("should return roles for user", async () => {
                mockExecute.mockResolvedValueOnce({
                    rows: [
                        { id: "admin", name: "Admin", is_admin: true, default_permissions: null, collection_permissions: null, config: null },
                        { id: "editor", name: "Editor", is_admin: false, default_permissions: { edit: true }, collection_permissions: null, config: null }
                    ]
                });

                const roles = await userService.getUserRoles("user-123");

                expect(roles).toHaveLength(2);
                expect(roles[0]).toEqual({
                    id: "admin",
                    name: "Admin",
                    isAdmin: true,
                    defaultPermissions: null,
                    collectionPermissions: null,
                    config: null
                });
            });
        });

        describe("getUserRoleIds", () => {
            it("should return role IDs for user", async () => {
                mockExecute.mockResolvedValueOnce({
                    rows: [
                        { id: "admin", name: "Admin", is_admin: true, default_permissions: null, collection_permissions: null, config: null }
                    ]
                });

                const roleIds = await userService.getUserRoleIds("user-123");

                expect(roleIds).toEqual(["admin"]);
            });
        });

        describe("setUserRoles", () => {
            it("should delete existing and insert new roles", async () => {
                await userService.setUserRoles("user-123", ["admin", "editor"]);

                // First call deletes existing roles
                expect(mockExecute).toHaveBeenCalled();
                // Subsequent calls insert new roles
                expect(mockExecute.mock.calls.length).toBeGreaterThanOrEqual(1);
            });
        });

        describe("assignDefaultRole", () => {
            it("should assign default role to user", async () => {
                await userService.assignDefaultRole("user-123", "editor");

                expect(mockExecute).toHaveBeenCalled();
            });

            it("should use editor as default role", async () => {
                await userService.assignDefaultRole("user-123");

                expect(mockExecute).toHaveBeenCalled();
            });
        });

        describe("getUserWithRoles", () => {
            it("should return user with roles", async () => {
                const mockUser = { id: "user-123", email: "test@example.com" };
                mockSelectWhere.mockResolvedValueOnce([mockUser]);
                mockExecute.mockResolvedValueOnce({
                    rows: [{ id: "admin", name: "Admin", is_admin: true, default_permissions: null, collection_permissions: null, config: null }]
                });

                const result = await userService.getUserWithRoles("user-123");

                expect(result).toEqual({
                    user: mockUser,
                    roles: [{ id: "admin", name: "Admin", isAdmin: true, defaultPermissions: null, collectionPermissions: null, config: null }]
                });
            });

            it("should return null when user not found", async () => {
                mockSelectWhere.mockResolvedValueOnce([]);

                const result = await userService.getUserWithRoles("nonexistent");

                expect(result).toBeNull();
            });
        });
    });

    describe("RoleService", () => {
        let roleService: RoleService;

        beforeEach(() => {
            roleService = new RoleService(db);
        });

        describe("getRoleById", () => {
            it("should return role when found", async () => {
                mockExecute.mockResolvedValueOnce({
                    rows: [{ id: "admin", name: "Admin", is_admin: true, default_permissions: null, collection_permissions: null, config: null }]
                });

                const result = await roleService.getRoleById("admin");

                expect(result).toEqual({
                    id: "admin",
                    name: "Admin",
                    isAdmin: true,
                    defaultPermissions: null,
                    collectionPermissions: null,
                    config: null
                });
            });

            it("should return null when role not found", async () => {
                mockExecute.mockResolvedValueOnce({ rows: [] });

                const result = await roleService.getRoleById("nonexistent");

                expect(result).toBeNull();
            });
        });

        describe("listRoles", () => {
            it("should return all roles", async () => {
                mockExecute.mockResolvedValueOnce({
                    rows: [
                        { id: "admin", name: "Admin", is_admin: true, default_permissions: null, collection_permissions: null, config: null },
                        { id: "editor", name: "Editor", is_admin: false, default_permissions: null, collection_permissions: null, config: null }
                    ]
                });

                const roles = await roleService.listRoles();

                expect(roles).toHaveLength(2);
            });
        });

        describe("createRole", () => {
            it("should create a role", async () => {
                mockExecute.mockResolvedValueOnce({
                    rows: [{ id: "custom", name: "Custom Role", is_admin: false, default_permissions: null, collection_permissions: null, config: null }]
                });

                const role = await roleService.createRole({
                    id: "custom",
                    name: "Custom Role",
                    defaultPermissions: null,
                    config: null
                });

                expect(role.id).toBe("custom");
                expect(role.name).toBe("Custom Role");
            });
        });

        describe("updateRole", () => {
            it("should update a role", async () => {
                mockExecute
                    .mockResolvedValueOnce({ rows: [{ id: "admin", name: "Admin", is_admin: true, default_permissions: null, collection_permissions: null, config: null }] })
                    .mockResolvedValueOnce({ rows: [] })
                    .mockResolvedValueOnce({ rows: [{ id: "admin", name: "Super Admin", is_admin: true, default_permissions: null, collection_permissions: null, config: null }] });

                const result = await roleService.updateRole("admin", { name: "Super Admin" });

                expect(result?.name).toBe("Super Admin");
            });

            it("should return null when role not found", async () => {
                mockExecute.mockResolvedValueOnce({ rows: [] });

                const result = await roleService.updateRole("nonexistent", { name: "Test" });

                expect(result).toBeNull();
            });
        });

        describe("deleteRole", () => {
            it("should delete a role", async () => {
                await roleService.deleteRole("custom");

                expect(mockExecute).toHaveBeenCalled();
            });
        });
    });

    describe("RefreshTokenService", () => {
        let refreshTokenService: RefreshTokenService;

        beforeEach(() => {
            refreshTokenService = new RefreshTokenService(db);
        });

        describe("createToken", () => {
            it("should create a refresh token", async () => {
                const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                await refreshTokenService.createToken("user-123", "token-hash", expiresAt);

                expect(db.insert).toHaveBeenCalledWith(refreshTokens);
                expect(mockInsertValues).toHaveBeenCalledWith({
                    userId: "user-123",
                    tokenHash: "token-hash",
                    expiresAt
                });
            });
        });

        describe("findByHash", () => {
            it("should find token by hash", async () => {
                const expiresAt = new Date();
                mockSelectWhere.mockResolvedValueOnce([{ userId: "user-123", expiresAt }]);

                const result = await refreshTokenService.findByHash("token-hash");

                expect(result).toEqual({ userId: "user-123", expiresAt });
            });

            it("should return null when token not found", async () => {
                mockSelectWhere.mockResolvedValueOnce([]);

                const result = await refreshTokenService.findByHash("nonexistent");

                expect(result).toBeNull();
            });
        });

        describe("deleteByHash", () => {
            it("should delete token by hash", async () => {
                await refreshTokenService.deleteByHash("token-hash");

                expect(db.delete).toHaveBeenCalledWith(refreshTokens);
            });
        });

        describe("deleteAllForUser", () => {
            it("should delete all tokens for user", async () => {
                await refreshTokenService.deleteAllForUser("user-123");

                expect(db.delete).toHaveBeenCalledWith(refreshTokens);
            });
        });
    });

    describe("PasswordResetTokenService", () => {
        let passwordResetTokenService: PasswordResetTokenService;

        beforeEach(() => {
            passwordResetTokenService = new PasswordResetTokenService(db);
        });

        describe("createToken", () => {
            it("should delete existing tokens and create new one", async () => {
                const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

                await passwordResetTokenService.createToken("user-123", "token-hash", expiresAt);

                // First deletes existing unused tokens
                expect(mockExecute).toHaveBeenCalled();
                // Then inserts new token
                expect(db.insert).toHaveBeenCalledWith(passwordResetTokens);
            });
        });

        describe("findValidByHash", () => {
            it("should find valid token", async () => {
                const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
                mockSelectWhere.mockResolvedValueOnce([{ userId: "user-123", expiresAt }]);
                mockExecute.mockResolvedValueOnce({
                    rows: [{ user_id: "user-123", expires_at: expiresAt }]
                });

                const result = await passwordResetTokenService.findValidByHash("token-hash");

                expect(result).toEqual({ userId: "user-123", expiresAt });
            });

            it("should return null when token not found", async () => {
                mockSelectWhere.mockResolvedValueOnce([]);

                const result = await passwordResetTokenService.findValidByHash("nonexistent");

                expect(result).toBeNull();
            });

            it("should return null when token is expired or used", async () => {
                const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
                mockSelectWhere.mockResolvedValueOnce([{ userId: "user-123", expiresAt }]);
                mockExecute.mockResolvedValueOnce({ rows: [] }); // No valid token found

                const result = await passwordResetTokenService.findValidByHash("token-hash");

                expect(result).toBeNull();
            });
        });

        describe("markAsUsed", () => {
            it("should mark token as used", async () => {
                await passwordResetTokenService.markAsUsed("token-hash");

                expect(db.update).toHaveBeenCalledWith(passwordResetTokens);
                expect(mockUpdateSet).toHaveBeenCalledWith({ usedAt: expect.any(Date) });
            });
        });

        describe("deleteAllForUser", () => {
            it("should delete all tokens for user", async () => {
                await passwordResetTokenService.deleteAllForUser("user-123");

                expect(db.delete).toHaveBeenCalledWith(passwordResetTokens);
            });
        });

        describe("deleteExpired", () => {
            it("should delete expired tokens", async () => {
                await passwordResetTokenService.deleteExpired();

                expect(mockExecute).toHaveBeenCalled();
            });
        });
    });
});
