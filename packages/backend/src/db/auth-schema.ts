import { pgTable, varchar, uuid, timestamp, boolean, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Users table - stores both email/password and OAuth users
 */
export const users = pgTable("firecms_users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }), // NULL for OAuth-only users
    displayName: varchar("display_name", { length: 255 }),
    photoUrl: varchar("photo_url", { length: 500 }),
    provider: varchar("provider", { length: 50 }).notNull().default("email"), // 'email' | 'google'
    googleId: varchar("google_id", { length: 255 }).unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    emailVerificationToken: varchar("email_verification_token", { length: 255 }),
    emailVerificationSentAt: timestamp("email_verification_sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

/**
 * Roles table - defines permission sets
 */
export const roles = pgTable("firecms_roles", {
    id: varchar("id", { length: 50 }).primaryKey(), // 'admin', 'editor', 'viewer'
    name: varchar("name", { length: 100 }).notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
    defaultPermissions: jsonb("default_permissions").$type<{
        read?: boolean;
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
    }>(),
    collectionPermissions: jsonb("collection_permissions").$type<
        Record<string, {
            read?: boolean;
            create?: boolean;
            edit?: boolean;
            delete?: boolean;
        }>
    >(),
    config: jsonb("config").$type<{
        createCollections?: boolean;
        editCollections?: "own" | "all" | boolean;
        deleteCollections?: "own" | "all" | boolean;
    }>()
});

/**
 * User-Role junction table
 */
export const userRoles = pgTable("firecms_user_roles", {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: varchar("role_id", { length: 50 }).notNull().references(() => roles.id, { onDelete: "cascade" })
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] })
}));

/**
 * Refresh tokens for long-lived sessions
 */
export const refreshTokens = pgTable("firecms_refresh_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

/**
 * Password reset tokens for forgot password flow
 */
export const passwordResetTokens = pgTable("firecms_password_reset_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

/**
 * App config - key/value store for custom settings
 */
export const appConfig = pgTable("firecms_app_config", {
    key: varchar("key", { length: 100 }).primaryKey(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    userRoles: many(userRoles),
    refreshTokens: many(refreshTokens),
    passwordResetTokens: many(passwordResetTokens)
}));

export const rolesRelations = relations(roles, ({ many }) => ({
    userRoles: many(userRoles)
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, {
        fields: [userRoles.userId],
        references: [users.id]
    }),
    role: one(roles, {
        fields: [userRoles.roleId],
        references: [roles.id]
    })
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, {
        fields: [refreshTokens.userId],
        references: [users.id]
    })
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
    user: one(users, {
        fields: [passwordResetTokens.userId],
        references: [users.id]
    })
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type AppConfig = typeof appConfig.$inferSelect;
