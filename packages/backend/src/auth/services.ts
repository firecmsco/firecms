import { eq, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { users, refreshTokens, passwordResetTokens, User, NewUser } from "../db/auth-schema";
import {
    UserRepository,
    RoleRepository,
    TokenRepository,
    AuthRepository,
    UserData,
    CreateUserData,
    RoleData,
    CreateRoleData,
    RefreshTokenInfo,
    PasswordResetTokenInfo
} from "./interfaces";

/**
 * Role type from database
 */
export interface Role {
    id: string;
    name: string;
    isAdmin: boolean;
    defaultPermissions: {
        read?: boolean;
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
    } | null;
    collectionPermissions: Record<string, {
        read?: boolean;
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
    }> | null;
    config: Record<string, any> | null;
}

/**
 * PostgreSQL implementation of UserRepository.
 * Handles all user-related database operations using Drizzle ORM.
 */
export class UserService implements UserRepository {
    constructor(private db: NodePgDatabase) { }

    async createUser(data: NewUser): Promise<User> {
        const [user] = await this.db.insert(users).values(data).returning();
        return user;
    }

    async getUserById(id: string): Promise<User | null> {
        const [user] = await this.db.select().from(users).where(eq(users.id, id));
        return user || null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const [user] = await this.db.select().from(users).where(eq(users.email, email.toLowerCase()));
        return user || null;
    }

    async getUserByGoogleId(googleId: string): Promise<User | null> {
        const [user] = await this.db.select().from(users).where(eq(users.googleId, googleId));
        return user || null;
    }

    async updateUser(id: string, data: Partial<Omit<NewUser, "id">>): Promise<User | null> {
        const [user] = await this.db
            .update(users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user || null;
    }

    async deleteUser(id: string): Promise<void> {
        await this.db.delete(users).where(eq(users.id, id));
    }

    async listUsers(): Promise<User[]> {
        return this.db.select().from(users);
    }

    /**
     * Update user's password hash
     */
    async updatePassword(id: string, passwordHash: string): Promise<void> {
        await this.db
            .update(users)
            .set({ passwordHash, updatedAt: new Date() })
            .where(eq(users.id, id));
    }

    /**
     * Set email verification status
     */
    async setEmailVerified(id: string, verified: boolean): Promise<void> {
        await this.db
            .update(users)
            .set({
                emailVerified: verified,
                emailVerificationToken: null,
                updatedAt: new Date()
            })
            .where(eq(users.id, id));
    }

    /**
     * Set email verification token
     */
    async setVerificationToken(id: string, token: string | null): Promise<void> {
        await this.db
            .update(users)
            .set({
                emailVerificationToken: token,
                emailVerificationSentAt: token ? new Date() : null,
                updatedAt: new Date()
            })
            .where(eq(users.id, id));
    }

    /**
     * Find user by email verification token
     */
    async getUserByVerificationToken(token: string): Promise<User | null> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.emailVerificationToken, token));
        return user || null;
    }

    /**
     * Get roles for a user from database
     */
    async getUserRoles(userId: string): Promise<Role[]> {
        const result = await this.db.execute(sql`
            SELECT r.id, r.name, r.is_admin, r.default_permissions, r.collection_permissions, r.config
            FROM firecms_roles r
            INNER JOIN firecms_user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = ${userId}
        `);

        return (result.rows as Array<{ id: string; name: string; is_admin: boolean; default_permissions: Record<string, boolean> | null; collection_permissions: Record<string, Record<string, boolean>> | null; config: Record<string, unknown> | null }>).map(row => ({
            id: row.id,
            name: row.name,
            isAdmin: row.is_admin,
            defaultPermissions: row.default_permissions,
            collectionPermissions: row.collection_permissions,
            config: row.config
        }));
    }

    /**
     * Get role IDs for a user
     */
    async getUserRoleIds(userId: string): Promise<string[]> {
        const roles = await this.getUserRoles(userId);
        return roles.map(r => r.id);
    }

    /**
     * Set roles for a user
     */
    async setUserRoles(userId: string, roleIds: string[]): Promise<void> {
        // Delete existing roles
        await this.db.execute(sql`DELETE FROM firecms_user_roles WHERE user_id = ${userId}`);

        // Insert new roles
        for (const roleId of roleIds) {
            await this.db.execute(sql`
                INSERT INTO firecms_user_roles (user_id, role_id)
                VALUES (${userId}, ${roleId})
                ON CONFLICT DO NOTHING
            `);
        }
    }

    /**
     * Assign default role to new user (editor by default)
     */
    async assignDefaultRole(userId: string, roleId: string = "editor"): Promise<void> {
        await this.db.execute(sql`
            INSERT INTO firecms_user_roles (user_id, role_id)
            VALUES (${userId}, ${roleId})
            ON CONFLICT DO NOTHING
        `);
    }

    /**
     * Get user with their roles
     */
    async getUserWithRoles(userId: string): Promise<{ user: User; roles: Role[] } | null> {
        const user = await this.getUserById(userId);
        if (!user) return null;

        const roles = await this.getUserRoles(userId);
        return { user, roles };
    }
}

/**
 * PostgreSQL implementation of RoleRepository.
 * Handles all role-related database operations using Drizzle ORM.
 */
export class RoleService implements RoleRepository {
    constructor(private db: NodePgDatabase) { }

    async getRoleById(id: string): Promise<Role | null> {
        const result = await this.db.execute(sql`
            SELECT id, name, is_admin, default_permissions, collection_permissions, config
            FROM firecms_roles
            WHERE id = ${id}
        `);

        if (result.rows.length === 0) return null;

        const row = result.rows[0] as { id: string; name: string; is_admin: boolean; default_permissions: Record<string, boolean> | null; collection_permissions: Record<string, Record<string, boolean>> | null; config: Record<string, unknown> | null };
        return {
            id: row.id,
            name: row.name,
            isAdmin: row.is_admin,
            defaultPermissions: row.default_permissions,
            collectionPermissions: row.collection_permissions,
            config: row.config
        };
    }

    async listRoles(): Promise<Role[]> {
        const result = await this.db.execute(sql`
            SELECT id, name, is_admin, default_permissions, collection_permissions, config
            FROM firecms_roles
            ORDER BY name
        `);

        return (result.rows as Array<{ id: string; name: string; is_admin: boolean; default_permissions: Record<string, boolean> | null; collection_permissions: Record<string, Record<string, boolean>> | null; config: Record<string, unknown> | null }>).map(row => ({
            id: row.id,
            name: row.name,
            isAdmin: row.is_admin,
            defaultPermissions: row.default_permissions,
            collectionPermissions: row.collection_permissions,
            config: row.config
        }));
    }

    async createRole(data: Omit<Role, "isAdmin" | "collectionPermissions"> & { isAdmin?: boolean; collectionPermissions?: Role["collectionPermissions"] }): Promise<Role> {
        const result = await this.db.execute(sql`
            INSERT INTO firecms_roles (id, name, is_admin, default_permissions, collection_permissions, config)
            VALUES (
                ${data.id},
                ${data.name},
                ${data.isAdmin ?? false},
                ${data.defaultPermissions ? JSON.stringify(data.defaultPermissions) : null}::jsonb,
                ${data.collectionPermissions ? JSON.stringify(data.collectionPermissions) : null}::jsonb,
                ${data.config ? JSON.stringify(data.config) : null}::jsonb
            )
            RETURNING id, name, is_admin, default_permissions, collection_permissions, config
        `);

        const row = result.rows[0] as { id: string; name: string; is_admin: boolean; default_permissions: Record<string, boolean> | null; collection_permissions: Record<string, Record<string, boolean>> | null; config: Record<string, unknown> | null };
        return {
            id: row.id,
            name: row.name,
            isAdmin: row.is_admin,
            defaultPermissions: row.default_permissions,
            collectionPermissions: row.collection_permissions,
            config: row.config
        };
    }

    async updateRole(id: string, data: Partial<Omit<Role, "id">>): Promise<Role | null> {
        // For now, use simpler approach
        const existing = await this.getRoleById(id);
        if (!existing) return null;

        await this.db.execute(sql`
            UPDATE firecms_roles 
            SET 
                name = ${data.name ?? existing.name},
                is_admin = ${data.isAdmin ?? existing.isAdmin},
                default_permissions = ${data.defaultPermissions ? JSON.stringify(data.defaultPermissions) : JSON.stringify(existing.defaultPermissions)}::jsonb,
                collection_permissions = ${data.collectionPermissions !== undefined ? (data.collectionPermissions ? JSON.stringify(data.collectionPermissions) : null) : (existing.collectionPermissions ? JSON.stringify(existing.collectionPermissions) : null)}::jsonb,
                config = ${data.config ? JSON.stringify(data.config) : (existing.config ? JSON.stringify(existing.config) : null)}::jsonb
            WHERE id = ${id}
        `);

        return this.getRoleById(id);
    }

    async deleteRole(id: string): Promise<void> {
        await this.db.execute(sql`DELETE FROM firecms_roles WHERE id = ${id}`);
    }
}

export class RefreshTokenService {
    constructor(private db: NodePgDatabase) { }

    async createToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        await this.db.insert(refreshTokens).values({
            userId,
            tokenHash,
            expiresAt
        });
    }

    async findByHash(tokenHash: string): Promise<{ userId: string; expiresAt: Date } | null> {
        const [token] = await this.db
            .select({ userId: refreshTokens.userId, expiresAt: refreshTokens.expiresAt })
            .from(refreshTokens)
            .where(eq(refreshTokens.tokenHash, tokenHash));

        return token || null;
    }

    async deleteByHash(tokenHash: string): Promise<void> {
        await this.db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
    }

    async deleteAllForUser(userId: string): Promise<void> {
        await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
    }
}

/**
 * Password reset token service
 */
export class PasswordResetTokenService {
    constructor(private db: NodePgDatabase) { }

    /**
     * Create a password reset token
     */
    async createToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        // Delete any existing unused tokens for this user
        await this.db.execute(sql`
            DELETE FROM firecms_password_reset_tokens 
            WHERE user_id = ${userId} AND used_at IS NULL
        `);

        await this.db.insert(passwordResetTokens).values({
            userId,
            tokenHash,
            expiresAt
        });
    }

    /**
     * Find a valid (not expired, not used) token by hash
     */
    async findValidByHash(tokenHash: string): Promise<{ userId: string; expiresAt: Date } | null> {
        const [token] = await this.db
            .select({
                userId: passwordResetTokens.userId,
                expiresAt: passwordResetTokens.expiresAt
            })
            .from(passwordResetTokens)
            .where(eq(passwordResetTokens.tokenHash, tokenHash));

        if (!token) return null;

        // Check if expired or used
        const result = await this.db.execute(sql`
            SELECT user_id, expires_at 
            FROM firecms_password_reset_tokens 
            WHERE token_hash = ${tokenHash} 
              AND used_at IS NULL 
              AND expires_at > NOW()
        `);

        if (result.rows.length === 0) return null;

        const row = result.rows[0] as { user_id: string; expires_at: string | number | Date };
        return {
            userId: row.user_id,
            expiresAt: new Date(row.expires_at)
        };
    }

    /**
     * Mark token as used
     */
    async markAsUsed(tokenHash: string): Promise<void> {
        await this.db
            .update(passwordResetTokens)
            .set({ usedAt: new Date() })
            .where(eq(passwordResetTokens.tokenHash, tokenHash));
    }

    /**
     * Delete all tokens for a user
     */
    async deleteAllForUser(userId: string): Promise<void> {
        await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    }

    /**
     * Clean up expired tokens
     */
    async deleteExpired(): Promise<void> {
        await this.db.execute(sql`
            DELETE FROM firecms_password_reset_tokens 
            WHERE expires_at < NOW()
        `);
    }
}

/**
 * PostgreSQL implementation of TokenRepository.
 * Combines refresh token and password reset token operations.
 */
export class PostgresTokenRepository implements TokenRepository {
    private refreshTokenService: RefreshTokenService;
    private passwordResetTokenService: PasswordResetTokenService;

    constructor(private db: NodePgDatabase) {
        this.refreshTokenService = new RefreshTokenService(db);
        this.passwordResetTokenService = new PasswordResetTokenService(db);
    }

    // Refresh token operations

    async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        await this.refreshTokenService.createToken(userId, tokenHash, expiresAt);
    }

    async findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenInfo | null> {
        return this.refreshTokenService.findByHash(tokenHash);
    }

    async deleteRefreshToken(tokenHash: string): Promise<void> {
        await this.refreshTokenService.deleteByHash(tokenHash);
    }

    async deleteAllRefreshTokensForUser(userId: string): Promise<void> {
        await this.refreshTokenService.deleteAllForUser(userId);
    }

    // Password reset token operations

    async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        await this.passwordResetTokenService.createToken(userId, tokenHash, expiresAt);
    }

    async findValidPasswordResetToken(tokenHash: string): Promise<PasswordResetTokenInfo | null> {
        return this.passwordResetTokenService.findValidByHash(tokenHash);
    }

    async markPasswordResetTokenUsed(tokenHash: string): Promise<void> {
        await this.passwordResetTokenService.markAsUsed(tokenHash);
    }

    async deleteAllPasswordResetTokensForUser(userId: string): Promise<void> {
        await this.passwordResetTokenService.deleteAllForUser(userId);
    }

    async deleteExpiredTokens(): Promise<void> {
        await this.passwordResetTokenService.deleteExpired();
    }
}

/**
 * PostgreSQL implementation of AuthRepository.
 * Combines user, role, and token repository operations.
 * This provides a convenient single-class interface for all auth operations.
 */
export class PostgresAuthRepository implements AuthRepository {
    private userService: UserService;
    private roleService: RoleService;
    private tokenRepository: PostgresTokenRepository;

    constructor(private db: NodePgDatabase) {
        this.userService = new UserService(db);
        this.roleService = new RoleService(db);
        this.tokenRepository = new PostgresTokenRepository(db);
    }

    // User operations (delegate to UserService)

    async createUser(data: CreateUserData): Promise<UserData> {
        return this.userService.createUser(data as NewUser) as Promise<UserData>;
    }

    async getUserById(id: string): Promise<UserData | null> {
        return this.userService.getUserById(id) as Promise<UserData | null>;
    }

    async getUserByEmail(email: string): Promise<UserData | null> {
        return this.userService.getUserByEmail(email) as Promise<UserData | null>;
    }

    async getUserByGoogleId(googleId: string): Promise<UserData | null> {
        return this.userService.getUserByGoogleId(googleId) as Promise<UserData | null>;
    }

    async updateUser(id: string, data: Partial<Omit<CreateUserData, "id">>): Promise<UserData | null> {
        return this.userService.updateUser(id, data) as Promise<UserData | null>;
    }

    async deleteUser(id: string): Promise<void> {
        await this.userService.deleteUser(id);
    }

    async listUsers(): Promise<UserData[]> {
        return this.userService.listUsers() as Promise<UserData[]>;
    }

    async updatePassword(id: string, passwordHash: string): Promise<void> {
        await this.userService.updatePassword(id, passwordHash);
    }

    async setEmailVerified(id: string, verified: boolean): Promise<void> {
        await this.userService.setEmailVerified(id, verified);
    }

    async setVerificationToken(id: string, token: string | null): Promise<void> {
        await this.userService.setVerificationToken(id, token);
    }

    async getUserByVerificationToken(token: string): Promise<UserData | null> {
        return this.userService.getUserByVerificationToken(token) as Promise<UserData | null>;
    }

    async getUserRoles(userId: string): Promise<RoleData[]> {
        return this.userService.getUserRoles(userId);
    }

    async getUserRoleIds(userId: string): Promise<string[]> {
        return this.userService.getUserRoleIds(userId);
    }

    async setUserRoles(userId: string, roleIds: string[]): Promise<void> {
        await this.userService.setUserRoles(userId, roleIds);
    }

    async assignDefaultRole(userId: string, roleId?: string): Promise<void> {
        await this.userService.assignDefaultRole(userId, roleId);
    }

    async getUserWithRoles(userId: string): Promise<{ user: UserData; roles: RoleData[] } | null> {
        const result = await this.userService.getUserWithRoles(userId);
        return result as { user: UserData; roles: RoleData[] } | null;
    }

    // Role operations (delegate to RoleService)

    async getRoleById(id: string): Promise<RoleData | null> {
        return this.roleService.getRoleById(id);
    }

    async listRoles(): Promise<RoleData[]> {
        return this.roleService.listRoles();
    }

    async createRole(data: CreateRoleData): Promise<RoleData> {
        return this.roleService.createRole({
            ...data,
            defaultPermissions: data.defaultPermissions ?? null,
            collectionPermissions: data.collectionPermissions ?? null,
            config: data.config ?? null
        });
    }

    async updateRole(id: string, data: Partial<Omit<RoleData, "id">>): Promise<RoleData | null> {
        return this.roleService.updateRole(id, data);
    }

    async deleteRole(id: string): Promise<void> {
        await this.roleService.deleteRole(id);
    }

    // Token operations (delegate to PostgresTokenRepository)

    async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        await this.tokenRepository.createRefreshToken(userId, tokenHash, expiresAt);
    }

    async findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenInfo | null> {
        return this.tokenRepository.findRefreshTokenByHash(tokenHash);
    }

    async deleteRefreshToken(tokenHash: string): Promise<void> {
        await this.tokenRepository.deleteRefreshToken(tokenHash);
    }

    async deleteAllRefreshTokensForUser(userId: string): Promise<void> {
        await this.tokenRepository.deleteAllRefreshTokensForUser(userId);
    }

    async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        await this.tokenRepository.createPasswordResetToken(userId, tokenHash, expiresAt);
    }

    async findValidPasswordResetToken(tokenHash: string): Promise<PasswordResetTokenInfo | null> {
        return this.tokenRepository.findValidPasswordResetToken(tokenHash);
    }

    async markPasswordResetTokenUsed(tokenHash: string): Promise<void> {
        await this.tokenRepository.markPasswordResetTokenUsed(tokenHash);
    }

    async deleteAllPasswordResetTokensForUser(userId: string): Promise<void> {
        await this.tokenRepository.deleteAllPasswordResetTokensForUser(userId);
    }

    async deleteExpiredTokens(): Promise<void> {
        await this.tokenRepository.deleteExpiredTokens();
    }
}

// =============================================================================
// PostgreSQL Type Aliases (for consistent naming with other implementations)
// =============================================================================

/** PostgreSQL user repository implementation */
export type PostgresUserRepository = UserService;

/** PostgreSQL role repository implementation */
export type PostgresRoleRepository = RoleService;

