/**
 * Authentication Abstraction Interfaces
 * 
 * These interfaces define the contracts for authentication-related operations.
 * Implementations can use different databases (PostgreSQL, MongoDB, etc.) to
 * store user, role, and token data.
 */

/**
 * User data structure
 */
export interface UserData {
    id: string;
    email: string;
    passwordHash?: string | null;
    displayName?: string | null;
    photoUrl?: string | null;
    provider: string;
    googleId?: string | null;
    emailVerified: boolean;
    emailVerificationToken?: string | null;
    emailVerificationSentAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Data for creating a new user
 */
export interface CreateUserData {
    email: string;
    passwordHash?: string;
    displayName?: string;
    photoUrl?: string;
    provider?: string;
    googleId?: string;
    emailVerified?: boolean;
}

/**
 * Role data structure
 */
export interface RoleData {
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
 * Data for creating a new role
 */
export interface CreateRoleData {
    id: string;
    name: string;
    isAdmin?: boolean;
    defaultPermissions?: RoleData["defaultPermissions"];
    collectionPermissions?: RoleData["collectionPermissions"];
    config?: RoleData["config"];
}

/**
 * Refresh token info
 */
export interface RefreshTokenInfo {
    userId: string;
    expiresAt: Date;
}

/**
 * Password reset token info
 */
export interface PasswordResetTokenInfo {
    userId: string;
    expiresAt: Date;
}

// =============================================================================
// AUTH REPOSITORY INTERFACES
// =============================================================================

/**
 * Abstract user repository interface.
 * Handles all user-related database operations.
 */
export interface UserRepository {
    /**
     * Create a new user
     */
    createUser(data: CreateUserData): Promise<UserData>;

    /**
     * Get a user by ID
     */
    getUserById(id: string): Promise<UserData | null>;

    /**
     * Get a user by email
     */
    getUserByEmail(email: string): Promise<UserData | null>;

    /**
     * Get a user by Google ID
     */
    getUserByGoogleId(googleId: string): Promise<UserData | null>;

    /**
     * Update a user
     */
    updateUser(id: string, data: Partial<Omit<CreateUserData, "id">>): Promise<UserData | null>;

    /**
     * Delete a user
     */
    deleteUser(id: string): Promise<void>;

    /**
     * List all users
     */
    listUsers(): Promise<UserData[]>;

    /**
     * Update user's password hash
     */
    updatePassword(id: string, passwordHash: string): Promise<void>;

    /**
     * Set email verification status
     */
    setEmailVerified(id: string, verified: boolean): Promise<void>;

    /**
     * Set email verification token
     */
    setVerificationToken(id: string, token: string | null): Promise<void>;

    /**
     * Find user by email verification token
     */
    getUserByVerificationToken(token: string): Promise<UserData | null>;

    /**
     * Get roles for a user
     */
    getUserRoles(userId: string): Promise<RoleData[]>;

    /**
     * Get role IDs for a user
     */
    getUserRoleIds(userId: string): Promise<string[]>;

    /**
     * Set roles for a user (replaces existing roles)
     */
    setUserRoles(userId: string, roleIds: string[]): Promise<void>;

    /**
     * Assign default role to a new user
     */
    assignDefaultRole(userId: string, roleId?: string): Promise<void>;

    /**
     * Get user with their roles
     */
    getUserWithRoles(userId: string): Promise<{ user: UserData; roles: RoleData[] } | null>;
}

/**
 * Abstract role repository interface.
 * Handles all role-related database operations.
 */
export interface RoleRepository {
    /**
     * Get a role by ID
     */
    getRoleById(id: string): Promise<RoleData | null>;

    /**
     * List all roles
     */
    listRoles(): Promise<RoleData[]>;

    /**
     * Create a new role
     */
    createRole(data: CreateRoleData): Promise<RoleData>;

    /**
     * Update a role
     */
    updateRole(id: string, data: Partial<Omit<RoleData, "id">>): Promise<RoleData | null>;

    /**
     * Delete a role
     */
    deleteRole(id: string): Promise<void>;
}

/**
 * Abstract token repository interface.
 * Handles refresh tokens and password reset tokens.
 */
export interface TokenRepository {
    // Refresh tokens

    /**
     * Create a new refresh token
     */
    createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;

    /**
     * Find a refresh token by hash
     */
    findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenInfo | null>;

    /**
     * Delete a refresh token by hash
     */
    deleteRefreshToken(tokenHash: string): Promise<void>;

    /**
     * Delete all refresh tokens for a user
     */
    deleteAllRefreshTokensForUser(userId: string): Promise<void>;

    // Password reset tokens

    /**
     * Create a password reset token
     */
    createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;

    /**
     * Find a valid (not expired, not used) password reset token by hash
     */
    findValidPasswordResetToken(tokenHash: string): Promise<PasswordResetTokenInfo | null>;

    /**
     * Mark a password reset token as used
     */
    markPasswordResetTokenUsed(tokenHash: string): Promise<void>;

    /**
     * Delete all password reset tokens for a user
     */
    deleteAllPasswordResetTokensForUser(userId: string): Promise<void>;

    /**
     * Clean up expired tokens
     */
    deleteExpiredTokens(): Promise<void>;
}

/**
 * Combined auth repository interface for convenience
 */
export interface AuthRepository extends UserRepository, RoleRepository, TokenRepository { }
