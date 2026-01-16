import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

/**
 * Default roles to seed on first run
 */
const DEFAULT_ROLES = [
    {
        id: "admin",
        name: "Admin",
        is_admin: true,
        default_permissions: { read: true, create: true, edit: true, delete: true },
        config: { createCollections: true, editCollections: "all", deleteCollections: "all" }
    },
    {
        id: "editor",
        name: "Editor",
        is_admin: false,
        default_permissions: { read: true, create: true, edit: true, delete: true },
        config: { createCollections: true, editCollections: "own", deleteCollections: "own" }
    },
    {
        id: "viewer",
        name: "Viewer",
        is_admin: false,
        default_permissions: { read: true, create: false, edit: false, delete: false },
        config: null
    }
];

/**
 * Auto-create auth tables if they don't exist
 * This runs on startup to ensure the database is ready for auth
 */
export async function ensureAuthTablesExist(db: NodePgDatabase): Promise<void> {
    console.log("🔍 Checking auth tables...");

    try {
        // Create users table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS firecms_users (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT,
                display_name TEXT,
                photo_url TEXT,
                provider TEXT DEFAULT 'email',
                google_id TEXT UNIQUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // Create index on email for faster lookups
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_firecms_users_email 
            ON firecms_users(email)
        `);

        // Create index on google_id for OAuth lookups
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_firecms_users_google_id 
            ON firecms_users(google_id)
        `);

        // Create roles table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS firecms_roles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                is_admin BOOLEAN DEFAULT FALSE,
                default_permissions JSONB,
                collection_permissions JSONB,
                config JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // Migration: Add collection_permissions column if it doesn't exist (for existing databases)
        await db.execute(sql`
            ALTER TABLE firecms_roles 
            ADD COLUMN IF NOT EXISTS collection_permissions JSONB
        `);

        // Create user_roles junction table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS firecms_user_roles (
                user_id TEXT NOT NULL REFERENCES firecms_users(id) ON DELETE CASCADE,
                role_id TEXT NOT NULL REFERENCES firecms_roles(id) ON DELETE CASCADE,
                PRIMARY KEY (user_id, role_id)
            )
        `);

        // Create index on user_id for faster lookups
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_firecms_user_roles_user 
            ON firecms_user_roles(user_id)
        `);

        // Create refresh tokens table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS firecms_refresh_tokens (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES firecms_users(id) ON DELETE CASCADE,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // Create index on token_hash for faster lookups
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_firecms_refresh_tokens_hash 
            ON firecms_refresh_tokens(token_hash)
        `);

        // Create index on user_id for cleanup operations
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_firecms_refresh_tokens_user 
            ON firecms_refresh_tokens(user_id)
        `);

        // Create password reset tokens table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS firecms_password_reset_tokens (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES firecms_users(id) ON DELETE CASCADE,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                used_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // Create index on token_hash for password reset lookups
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_firecms_password_reset_tokens_hash 
            ON firecms_password_reset_tokens(token_hash)
        `);

        // Create index on user_id for password reset cleanup
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_firecms_password_reset_tokens_user 
            ON firecms_password_reset_tokens(user_id)
        `);

        // Migration: Add email verification columns to users if they don't exist
        await db.execute(sql`
            ALTER TABLE firecms_users 
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE
        `);

        await db.execute(sql`
            ALTER TABLE firecms_users 
            ADD COLUMN IF NOT EXISTS email_verification_token TEXT
        `);

        await db.execute(sql`
            ALTER TABLE firecms_users 
            ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE
        `);

        // Seed default roles if none exist
        await seedDefaultRoles(db);

        console.log("✅ Auth tables ready");
    } catch (error) {
        console.error("❌ Failed to create auth tables:", error);
        throw error;
    }
}

/**
 * Seed default roles if the roles table is empty
 */
async function seedDefaultRoles(db: NodePgDatabase): Promise<void> {
    // Check if any roles exist
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM firecms_roles`);
    const count = parseInt((result.rows[0] as any)?.count || "0", 10);

    if (count > 0) {
        console.log(`📋 Found ${count} existing roles`);
        return;
    }

    console.log("🌱 Seeding default roles...");

    for (const role of DEFAULT_ROLES) {
        await db.execute(sql`
            INSERT INTO firecms_roles (id, name, is_admin, default_permissions, config)
            VALUES (
                ${role.id}, 
                ${role.name}, 
                ${role.is_admin}, 
                ${JSON.stringify(role.default_permissions)}::jsonb, 
                ${role.config ? JSON.stringify(role.config) : null}::jsonb
            )
            ON CONFLICT (id) DO NOTHING
        `);
    }

    console.log("✅ Default roles created: admin, editor, viewer");
}
