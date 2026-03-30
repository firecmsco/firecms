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
            CREATE TABLE IF NOT EXISTS rebase_users (
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
            CREATE INDEX IF NOT EXISTS idx_rebase_users_email 
            ON rebase_users(email)
        `);

        // Create index on google_id for OAuth lookups
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_rebase_users_google_id 
            ON rebase_users(google_id)
        `);

        // Create roles table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS rebase_roles (
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
            ALTER TABLE rebase_roles 
            ADD COLUMN IF NOT EXISTS collection_permissions JSONB
        `);

        // Create user_roles junction table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS rebase_user_roles (
                user_id TEXT NOT NULL REFERENCES rebase_users(id) ON DELETE CASCADE,
                role_id TEXT NOT NULL REFERENCES rebase_roles(id) ON DELETE CASCADE,
                PRIMARY KEY (user_id, role_id)
            )
        `);

        // Create index on user_id for faster lookups
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_rebase_user_roles_user 
            ON rebase_user_roles(user_id)
        `);

        // Create refresh tokens table (includes user_agent, ip_address, and unique constraint)
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS rebase_refresh_tokens (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES rebase_users(id) ON DELETE CASCADE,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                user_agent TEXT,
                ip_address TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT unique_device_session UNIQUE (user_id, user_agent, ip_address)
            )
        `);

        // Create index on token_hash for faster lookups
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_rebase_refresh_tokens_hash 
            ON rebase_refresh_tokens(token_hash)
        `);

        // Create index on user_id for cleanup operations
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_rebase_refresh_tokens_user 
            ON rebase_refresh_tokens(user_id)
        `);

        // Migration: Add user_agent and ip_address to refresh tokens (for tables created before these columns existed)
        await db.execute(sql`
            ALTER TABLE rebase_refresh_tokens 
            ADD COLUMN IF NOT EXISTS user_agent TEXT
        `);

        await db.execute(sql`
            ALTER TABLE rebase_refresh_tokens 
            ADD COLUMN IF NOT EXISTS ip_address TEXT
        `);

        // Migration: Ensure unique_device_session constraint exists (for tables created before it was in CREATE TABLE)
        // Check if constraint already exists before attempting to add it
        const constraintCheck = await db.execute(sql`
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'unique_device_session' 
            AND table_name = 'rebase_refresh_tokens'
        `);
        if (constraintCheck.rows.length === 0) {
            try {
                await db.execute(sql`
                    ALTER TABLE rebase_refresh_tokens
                    ADD CONSTRAINT unique_device_session UNIQUE (user_id, user_agent, ip_address)
                `);
                console.log("✅ Added unique_device_session constraint");
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                // If there's duplicate data preventing the constraint, clean up first
                if (errorMessage.includes('could not create unique index')) {
                    console.warn("⚠️ Duplicate sessions found, cleaning up before adding constraint...");
                    // Keep only the most recent token per user/device combo
                    await db.execute(sql`
                        DELETE FROM rebase_refresh_tokens a
                        USING rebase_refresh_tokens b
                        WHERE a.user_id = b.user_id 
                        AND COALESCE(a.user_agent, '') = COALESCE(b.user_agent, '')
                        AND COALESCE(a.ip_address, '') = COALESCE(b.ip_address, '')
                        AND a.created_at < b.created_at
                    `);
                    // Retry constraint creation
                    await db.execute(sql`
                        ALTER TABLE rebase_refresh_tokens
                        ADD CONSTRAINT unique_device_session UNIQUE (user_id, user_agent, ip_address)
                    `).catch((retryErr: unknown) => {
                        const retryMessage = retryErr instanceof Error ? retryErr.message : String(retryErr);
                        console.error("Failed to add unique_device_session constraint after cleanup:", retryMessage);
                    });
                } else {
                    console.error("Constraint migration issue:", errorMessage);
                }
            }
        }

        // Create password reset tokens table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS rebase_password_reset_tokens (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES rebase_users(id) ON DELETE CASCADE,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                used_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // Create index on token_hash for password reset lookups
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_rebase_password_reset_tokens_hash 
            ON rebase_password_reset_tokens(token_hash)
        `);

        // Create index on user_id for password reset cleanup
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS idx_rebase_password_reset_tokens_user 
            ON rebase_password_reset_tokens(user_id)
        `);

        // Migration: Add email verification columns to users if they don't exist
        await db.execute(sql`
            ALTER TABLE rebase_users 
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE
        `);

        await db.execute(sql`
            ALTER TABLE rebase_users 
            ADD COLUMN IF NOT EXISTS email_verification_token TEXT
        `);

        await db.execute(sql`
            ALTER TABLE rebase_users 
            ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE
        `);

        // Create the `auth` schema with Supabase-style helper functions for RLS.
        //   auth.uid()   → returns the current user's ID (reads app.user_id)
        //   auth.jwt()   → returns the full JWT claims as JSONB (reads app.jwt)
        //   auth.roles() → returns comma-separated role IDs (reads app.user_roles)
        // These read from session-local config vars set per-transaction by withAuth().
        await db.execute(sql`CREATE SCHEMA IF NOT EXISTS auth`);

        // Use an advisory transaction lock to serialize function recreation during HMR
        // This prevents the "tuple concurrently updated" race condition when multiple Node 
        // workers or rapid restarts attempt to CREATE OR REPLACE FUNCTION simultaneously.
        await db.transaction(async (tx) => {
            await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('rebase_auth_functions_init'))`);

            await tx.execute(sql`
                CREATE OR REPLACE FUNCTION auth.uid() RETURNS text AS $$
                    SELECT NULLIF(current_setting('app.user_id', true), '');
                $$ LANGUAGE sql STABLE
            `);

            await tx.execute(sql`
                CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb AS $$
                    SELECT COALESCE(
                        NULLIF(current_setting('app.jwt', true), ''),
                        '{}'
                    )::jsonb;
                $$ LANGUAGE sql STABLE
            `);

            await tx.execute(sql`
                CREATE OR REPLACE FUNCTION auth.roles() RETURNS text AS $$
                    SELECT COALESCE(NULLIF(current_setting('app.user_roles', true), ''), '');
                $$ LANGUAGE sql STABLE
            `);
        });

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
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM rebase_roles`);
    const count = parseInt((result.rows[0] as unknown as Record<string, string | number>)?.count as string || "0", 10);

    if (count > 0) {
        console.log(`📋 Found ${count} existing roles`);
        return;
    }

    console.log("🌱 Seeding default roles...");

    for (const role of DEFAULT_ROLES) {
        await db.execute(sql`
            INSERT INTO rebase_roles (id, name, is_admin, default_permissions, config)
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
