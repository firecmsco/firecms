/**
 * PostgresBootstrapper
 *
 * Implements the `BackendBootstrapper` interface for PostgreSQL.
 * Encapsulates all Postgres-specific initialization logic that was previously
 * hardcoded inside `initializeRebaseBackend()`.
 *
 * Third-party drivers (MongoDB, MySQL, etc.) can implement their own
 * bootstrapper following this pattern and pass it to the coordinator.
 */

import { getTableName, isTable, Relations, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgEnum, PgTable } from "drizzle-orm/pg-core";
import {
    BackendBootstrapper,
    InitializedDriver,
    BootstrappedAuth,
    DatabaseAdmin,
    RealtimeProvider,
    type DataDriver
} from "@rebasepro/types";
import { PostgresDataDriver } from "../services/postgresDataDriver";
import { RealtimeService } from "../services/realtimeService";
import { DatabasePoolManager } from "../services/databasePoolManager";
import { BackendCollectionRegistry } from "../collections/BackendCollectionRegistry";
import {
    configureGoogleOAuth,
    configureJwt,
    createAuthRoutes,
    createAdminRoutes,
    ensureAuthTablesExist,
    RoleService,
    UserService,
    requireAuth,
    requireAdmin
} from "../auth";
import { createEmailService, type EmailConfig, type EmailService } from "../email";
import { HistoryService, ensureHistoryTableExists, createHistoryRoutes } from "../history";
import type { AuthConfig, PostgresDriverConfig, HistoryConfig } from "../init";
import type { Hono } from "hono";
import type { HonoEnv } from "../api/types";

/**
 * Opaque internals bag that PostgresBootstrapper stores during `initializeDriver()`
 * and re-uses in subsequent lifecycle hooks.
 */
export interface PostgresDriverInternals {
    db: NodePgDatabase<any>;
    registry: BackendCollectionRegistry;
    realtimeService: RealtimeService;
    driver: PostgresDataDriver;
    poolManager?: DatabasePoolManager;
}

/**
 * Default PostgreSQL bootstrapper.
 *
 * Use it to register Postgres with `initializeRebaseBackend()`:
 * ```typescript
 * initializeRebaseBackend({
 *   ...config,
 *   bootstrappers: [postgresBootstrapper()]
 * });
 * ```
 */
export function createPostgresBootstrapper(): BackendBootstrapper {
    return {
        type: "postgres",

        async initializeDriver(config: unknown): Promise<InitializedDriver> {
            const pgConfig = config as PostgresDriverConfig;

            // Create a fresh registry for this driver
            const registry = new BackendCollectionRegistry();

            // Register tables
            if (pgConfig.schema?.tables) {
                Object.values(pgConfig.schema.tables).forEach((table) => {
                    if (isTable(table as any)) {
                        const tableName = getTableName(table as any);
                        registry.registerTable(table as PgTable, tableName);
                    }
                });
            }

            if (pgConfig.schema?.enums) registry.registerEnums(pgConfig.schema.enums as Record<string, PgEnum<any>>);
            if (pgConfig.schema?.relations) registry.registerRelations(pgConfig.schema.relations as Record<string, Relations>);

            // Build schema-aware Drizzle connection
            const mergedSchema: Record<string, unknown> = {
                ...pgConfig.schema?.tables,
                ...(pgConfig.schema?.relations || {})
            };
            const { drizzle: createDrizzle } = await import("drizzle-orm/node-postgres");
            const rawClient = ("$client" in pgConfig.connection
                ? (pgConfig.connection as Record<string, unknown>).$client
                : pgConfig.connection) as import("pg").Pool;
            const schemaAwareDb = createDrizzle(rawClient, { schema: mergedSchema });

            // Verify connection
            try {
                await schemaAwareDb.execute(sql`SELECT 1`);
            } catch (err) {
                console.error("❌ Failed to connect to PostgreSQL:", err);
                throw err;
            }

            // Create services
            const realtimeService = new RealtimeService(schemaAwareDb, registry);
            const poolManager = pgConfig.adminConnectionString
                ? new DatabasePoolManager(pgConfig.adminConnectionString)
                : undefined;
            const driver = new PostgresDataDriver(schemaAwareDb, realtimeService, registry, undefined, poolManager);
            realtimeService.setDataDriver(driver);

            // Enable cross-instance realtime (opt-in)
            if (pgConfig.connectionString) {
                try {
                    await realtimeService.startListening(pgConfig.connectionString);
                } catch (err) {
                    console.warn("⚠️ Cross-instance realtime could not be started:", err);
                }
            }

            const internals: PostgresDriverInternals = {
                db: schemaAwareDb,
                registry,
                realtimeService,
                driver,
                poolManager
            };

            return {
                driver,
                realtimeProvider: realtimeService,
                collectionRegistry: registry,
                internals,
            };
        },

        async initializeAuth(config: unknown, driverResult: InitializedDriver): Promise<BootstrappedAuth | undefined> {
            const authConfig = config as AuthConfig | undefined;
            if (!authConfig) return undefined;

            const internals = driverResult.internals as PostgresDriverInternals;
            const db = internals.db;

            await ensureAuthTablesExist(db);

            configureJwt({
                secret: authConfig.jwtSecret,
                accessExpiresIn: authConfig.accessExpiresIn || "1h",
                refreshExpiresIn: authConfig.refreshExpiresIn || "30d"
            });

            if (authConfig.google?.clientId) {
                configureGoogleOAuth(authConfig.google.clientId);
            }

            let emailService: EmailService | undefined;
            if (authConfig.email) {
                emailService = createEmailService(authConfig.email);
            }

            const userService = new UserService(db);
            const roleService = new RoleService(db);

            return { userService, roleService, emailService };
        },

        async initializeRealtime(_config: unknown, driverResult: InitializedDriver): Promise<RealtimeProvider | undefined> {
            const internals = driverResult.internals as PostgresDriverInternals;
            return internals.realtimeService;
        },

        getAdmin(driverResult: InitializedDriver): DatabaseAdmin | undefined {
            const internals = driverResult.internals as PostgresDriverInternals;
            return internals.driver.admin;
        },

        mountRoutes(app: unknown, basePath: string, driverResult: InitializedDriver): void {
            // The coordinator handles auth/storage/data routes.
            // This hook is for driver-specific extensions only.
            // Currently Postgres doesn't need additional routes beyond what the coordinator mounts.
        }
    };
}
