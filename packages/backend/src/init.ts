import { DataSourceDelegate, EntityCollection } from "@firecms/types";
import { PgEnum, PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "./collections/registry";
import { getTableName, isTable, Relations } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PostgresDataSourceDelegate } from "./services/dataSourceDelegate";
import { RealtimeService } from "./services/realtimeService";
import { DatasourceRegistry, DefaultDatasourceRegistry, DEFAULT_DATASOURCE_ID } from "./services/datasource-registry";
import { Server } from "http";
import { createPostgresWebSocket } from "./websocket";
import { ApiConfig, FireCMSApiServer } from "./api";
import { Express } from "express";
import { configureLogLevel } from "./utils/logging";
import { configureJwt, configureGoogleOAuth, createAuthRoutes, createAdminRoutes, RoleService, UserService, RefreshTokenService, ensureAuthTablesExist } from "./auth";
import { EmailConfig, EmailService, createEmailService } from "./email";
import { StorageConfig, StorageController, createStorageController, createStorageRoutes, StorageRegistry, DefaultStorageRegistry, DEFAULT_STORAGE_ID } from "./storage";

/**
 * Authentication configuration for FireCMS backend
 */
export interface AuthConfig {
    /** JWT secret key - required for auth */
    jwtSecret: string;
    /** Access token expiration (e.g., '1h', '30m') */
    accessExpiresIn?: string;
    /** Refresh token expiration (e.g., '30d', '7d') */
    refreshExpiresIn?: string;
    /** Google OAuth configuration (optional) */
    google?: {
        clientId: string;
    };
    /** Email configuration for password reset and email verification (optional) */
    email?: EmailConfig;
    /** Whether auth is required for all API requests (default: true) */
    requireAuth?: boolean;
    /** Seed default roles on startup (default: true on first run) */
    seedDefaultRoles?: boolean;
    /** Allow new user registration (default: false). First user can always register for bootstrap. */
    allowRegistration?: boolean;
}

/**
 * Configuration for a PostgreSQL datasource.
 * Use with `createPostgresDelegate()` to create a DataSourceDelegate.
 */
export interface PostgresDatasourceConfig {
    /** Drizzle database connection */
    connection: NodePgDatabase;
    /** Database schema */
    schema: {
        /** Database tables (Drizzle schema) */
        tables: Record<string, PgTable>;
        /** Database enums (optional) */
        enums?: Record<string, PgEnum<any>>;
        /** Database relations (optional) */
        relations?: Record<string, Relations>;
    };
}

/**
 * Configuration for a single datasource.
 * 
 * You can provide either:
 * - A `DataSourceDelegate` directly (for any database type)
 * - A `PostgresDatasourceConfig` (convenience for PostgreSQL)
 * 
 * @example
 * // PostgreSQL (using config object)
 * { connection: db, schema: { tables, enums, relations } }
 * 
 * // Any database (using delegate directly)
 * myFirestoreDelegate
 */
export type DatasourceConfig = DataSourceDelegate | PostgresDatasourceConfig;

export interface FireCMSBackendConfig {
    collections: EntityCollection[];
    server: Server;

    /**
     * Database configuration. Supports two formats:
     *
     * **Single database (most common):**
     * ```typescript
     * database: {
     *     connection: db,
     *     schema: { tables, enums, relations }
     * }
     * ```
     *
     * **Multiple databases:**
     * ```typescript
     * databases: {
     *     "(default)": { connection: db, schema: { tables } },
     *     "analytics": { connection: analyticsDb, schema: { analyticsTables } }
     * }
     * ```
     * 
     * **Using delegates directly (for non-PostgreSQL):**
     * ```typescript
     * databases: {
     *     "(default)": postgresDelegate,
     *     "firestore": firestoreDelegate
     * }
     * ```
     *
     * Collections use `datasource` property to specify which to use.
     * Collections without `datasource` use "(default)".
     */
    database?: DatasourceConfig;
    databases?: Record<string, DatasourceConfig>;

    logging?: {
        level?: "error" | "warn" | "info" | "debug";
    };
    /** Authentication configuration */
    auth?: AuthConfig;

    /**
     * Storage configuration. Supports two formats:
     *
     * 1. Single storage (maps to "(default)"):
     *    ```
     *    storage: { type: 'local', basePath: './uploads' }
     *    ```
     *
     * 2. Multiple storages (keyed by storageId):
     *    ```
     *    storage: {
     *        "(default)": { type: 'local', basePath: './uploads' },
     *        "media": { type: 's3', bucket: 'my-media-bucket', ... }
     *    }
     *    ```
     *
     * String properties use `storageId` in their config to specify which storage.
     * Properties without `storageId` use "(default)".
     */
    storage?: StorageConfig | Record<string, StorageConfig>;
}

export interface FireCMSBackendInstance {
    /**
     * Registry for accessing multiple datasources by ID.
     * Use `datasourceRegistry.getOrDefault(databaseId)` to get a datasource.
     */
    datasourceRegistry: DatasourceRegistry;

    /**
     * Default datasource delegate (convenience accessor).
     * Equivalent to `datasourceRegistry.getDefault()`.
     */
    dataSourceDelegate: DataSourceDelegate;

    /**
     * Realtime services keyed by datasource ID.
     * Use `realtimeServices[databaseId]` to get the realtime service for a datasource.
     */
    realtimeServices: Record<string, RealtimeService>;

    /**
     * Default realtime service (convenience accessor for "(default)" datasource).
     */
    realtimeService: RealtimeService;

    userService?: UserService;
    roleService?: RoleService;
    emailService?: EmailService;

    /**
     * Registry for accessing multiple storage controllers by ID.
     * Use `storageRegistry.getOrDefault(storageId)` to get a storage controller.
     */
    storageRegistry?: StorageRegistry;

    /**
     * Default storage controller (convenience accessor).
     * Equivalent to `storageRegistry?.getDefault()`.
     */
    storageController?: StorageController;
}

export async function initializeFireCMSBackend(config: FireCMSBackendConfig): Promise<FireCMSBackendInstance> {
    // Configure logging level automatically
    if (config.logging?.level) {
        configureLogLevel(config.logging.level);
    } else {
        // Use environment variable by default
        configureLogLevel();
    }

    console.log("🔥 Initializing FireCMS Backend");

    // ============ Parse datasources configuration ============

    let rawDatasourceConfigs: Record<string, DatasourceConfig>;

    if (config.databases) {
        // Multiple databases
        rawDatasourceConfigs = config.databases;
    } else if (config.database) {
        // Single database (most common)
        rawDatasourceConfigs = { [DEFAULT_DATASOURCE_ID]: config.database };
    } else {
        throw new Error(
            "FireCMSBackendConfig requires `database` (single) or `databases` (multiple)."
        );
    }

    // ============ Initialize datasources ============

    const realtimeServices: Record<string, RealtimeService> = {};
    const delegates: Record<string, DataSourceDelegate> = {};

    for (const [datasourceId, dsConfig] of Object.entries(rawDatasourceConfigs)) {
        console.log(`📦 Initializing datasource: "${datasourceId}"`);

        // Resolve the DataSourceDelegate from the config
        const { delegate, db, schema } = resolveDatasourceConfig(dsConfig);

        if (delegate) {
            // Direct delegate - just use it
            delegates[datasourceId] = delegate;

            // For non-Postgres delegates, we don't have a RealtimeService
            // They handle their own real-time (e.g., Firestore)
        } else if (db && schema) {
            // PostgreSQL config - create delegate

            // Register tables for this datasource
            Object.values(schema.tables).forEach((table) => {
                if (isTable(table)) {
                    const tableName = getTableName(table);
                    const matchingCollection = config.collections.find(
                        c => c.dbPath === tableName && (
                            c.datasource === datasourceId ||
                            (!c.datasource && datasourceId === DEFAULT_DATASOURCE_ID)
                        )
                    );
                    collectionRegistry.registerTable(table, matchingCollection?.dbPath ?? tableName);
                }
            });

            if (schema.enums) collectionRegistry.registerEnums(schema.enums);
            if (schema.relations) collectionRegistry.registerRelations(schema.relations);

            // Create realtime service and datasource delegate
            const realtimeService = new RealtimeService(db);
            const dataSourceDelegate = new PostgresDataSourceDelegate(db, realtimeService);

            realtimeServices[datasourceId] = realtimeService;
            delegates[datasourceId] = dataSourceDelegate;
        } else {
            console.warn(`⚠️ Skipping datasource "${datasourceId}" - invalid configuration`);
        }
    }

    // Create the registry
    const datasourceRegistry = DefaultDatasourceRegistry.create(delegates);

    console.log(`✅ Initialized ${Object.keys(delegates).length} datasource(s): ${Object.keys(delegates).join(", ")}`);

    // Register collections
    config.collections.forEach(collection => collectionRegistry.register(collection));

    // ============ Get default datasource for auth ============
    // Auth requires PostgreSQL, so we need to find the default db connection
    let defaultDb: NodePgDatabase | undefined;
    const defaultConfig = rawDatasourceConfigs[DEFAULT_DATASOURCE_ID];
    if (defaultConfig) {
        const resolved = resolveDatasourceConfig(defaultConfig);
        defaultDb = resolved.db;
    }

    // ============ Initialize auth if configured ============
    let userService: UserService | undefined;
    let roleService: RoleService | undefined;
    let emailService: EmailService | undefined;

    if (config.auth) {
        if (!defaultDb) {
            console.warn(
                "⚠️ Auth requires a PostgreSQL database. No default PostgreSQL datasource found. " +
                "Auth will not be initialized. Make sure your default datasource uses PostgresDatasourceConfig."
            );
        } else {
            console.log("🔐 Configuring authentication...");

            // Ensure auth tables exist (auto-create if needed)
            await ensureAuthTablesExist(defaultDb);

            // Configure JWT
            configureJwt({
                secret: config.auth.jwtSecret,
                accessExpiresIn: config.auth.accessExpiresIn || "1h",
                refreshExpiresIn: config.auth.refreshExpiresIn || "30d"
            });

            // Configure Google OAuth if provided
            if (config.auth.google?.clientId) {
                configureGoogleOAuth(config.auth.google.clientId);
                console.log("✅ Google OAuth configured");
            }

            // Configure email service if provided
            if (config.auth.email) {
                emailService = createEmailService(config.auth.email);
                if (emailService.isConfigured()) {
                    console.log("✅ Email service configured");
                } else {
                    console.warn("⚠️ Email config provided but service not fully configured (missing SMTP or sendEmail)");
                }
            }

            // Create services using default database
            userService = new UserService(defaultDb);
            roleService = new RoleService(defaultDb);

            console.log("✅ Authentication configured");
        }
    }

    // ============ Initialize storage if configured ============
    let storageRegistry: StorageRegistry | undefined;
    let storageController: StorageController | undefined;

    if (config.storage) {
        console.log("📁 Configuring storage...");

        const controllers: Record<string, StorageController> = {};

        if (isStorageConfig(config.storage)) {
            // Single storage config → maps to "(default)"
            const controller = createStorageController(config.storage);
            controllers[DEFAULT_STORAGE_ID] = controller;
            console.log(`✅ Storage configured (${config.storage.type})`);
        } else {
            // Map of storage configs
            for (const [storageId, storageConfig] of Object.entries(config.storage)) {
                if (isStorageConfig(storageConfig)) {
                    const controller = createStorageController(storageConfig);
                    controllers[storageId] = controller;
                    console.log(`✅ Storage "${storageId}" configured (${storageConfig.type})`);
                }
            }
        }

        if (Object.keys(controllers).length > 0) {
            storageRegistry = DefaultStorageRegistry.create(controllers);
            storageController = storageRegistry.getDefault();
            console.log(`✅ Initialized ${Object.keys(controllers).length} storage backend(s)`);
        }
    }

    // ============ Create WebSocket with auth support ============
    // Use the default realtime service and datasource delegate
    const defaultRealtimeService = realtimeServices[DEFAULT_DATASOURCE_ID];
    const defaultDataSourceDelegate = datasourceRegistry.getDefault();

    createPostgresWebSocket(
        config.server,
        defaultRealtimeService,
        defaultDataSourceDelegate as PostgresDataSourceDelegate,
        config.auth
    );

    console.log("✅ FireCMS Backend Initialized");

    return {
        datasourceRegistry,
        dataSourceDelegate: defaultDataSourceDelegate,
        realtimeServices,
        realtimeService: defaultRealtimeService,
        userService,
        roleService,
        emailService,
        storageRegistry,
        storageController
    };
}

/**
 * Type guard to check if an object is a DataSourceDelegate
 */
function isDataSourceDelegate(obj: unknown): obj is DataSourceDelegate {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const delegate = obj as DataSourceDelegate;
    return (
        typeof delegate.key === "string" &&
        typeof delegate.fetchCollection === "function" &&
        typeof delegate.fetchEntity === "function" &&
        typeof delegate.saveEntity === "function" &&
        typeof delegate.deleteEntity === "function"
    );
}

/**
 * Type guard to check if an object is a PostgresDatasourceConfig (new format)
 */
function isPostgresDatasourceConfig(obj: unknown): obj is PostgresDatasourceConfig {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const config = obj as PostgresDatasourceConfig;
    return (
        config.connection !== undefined &&
        typeof config.schema === "object" &&
        config.schema !== null &&
        typeof config.schema.tables === "object"
    );
}

/**
 * Resolve a DatasourceConfig into its components
 */
function resolveDatasourceConfig(config: DatasourceConfig): {
    delegate?: DataSourceDelegate;
    db?: NodePgDatabase;
    schema?: PostgresDatasourceConfig["schema"];
} {
    // If it's a DataSourceDelegate directly
    if (isDataSourceDelegate(config)) {
        return { delegate: config };
    }

    // If it's a PostgresDatasourceConfig
    if (isPostgresDatasourceConfig(config)) {
        return {
            db: config.connection,
            schema: config.schema
        };
    }

    return {};
}

/**
 * Type guard to check if an object is a StorageConfig (single storage)
 * vs a Record<string, StorageConfig> (multiple storages)
 */
function isStorageConfig(obj: unknown): obj is StorageConfig {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const config = obj as StorageConfig;
    // A StorageConfig has a `type` property that is 'local' or 's3'
    return (
        config.type === 'local' || config.type === 's3'
    );
}

/**
 * Initialize FireCMS API endpoints on an Express app
 * @param app Express application instance
 * @param backend FireCMS backend instance from initializeFireCMSBackend
 * @param config API configuration options
 * @param db Database connection for auth routes
 * @returns API server instance
 */
export function initializeFireCMSAPI(
    app: Express,
    backend: FireCMSBackendInstance,
    config: Partial<ApiConfig> & { db?: NodePgDatabase; emailConfig?: EmailConfig; allowRegistration?: boolean } = {}
): FireCMSApiServer {
    console.log("🚀 Initializing FireCMS API endpoints");

    // Get collections from the registry using the correct method
    const collections = collectionRegistry.getCollections();

    const apiServer = new FireCMSApiServer({
        collections,
        dataSource: backend.dataSourceDelegate,
        basePath: config.basePath || "/api",
        enableGraphQL: config.enableGraphQL ?? true,
        enableREST: config.enableREST ?? true,
        cors: config.cors,
        auth: config.auth,
        pagination: config.pagination
    });

    // Mount API router on the provided Express app
    const apiRouter = apiServer.getRouter();
    app.use(apiRouter);

    // Mount auth routes if db is provided
    if (config.db) {
        const authRoutes = createAuthRoutes({
            db: config.db,
            emailService: backend.emailService,
            emailConfig: config.emailConfig,
            allowRegistration: config.allowRegistration ?? false
        });
        const basePath = config.basePath || "/api";
        app.use(`${basePath}/auth`, authRoutes);
        console.log(`✅ Auth endpoints: ${basePath}/auth/*`);

        // Mount admin routes (for user/role management)
        const adminRoutes = createAdminRoutes({ db: config.db });
        app.use(`${basePath}/admin`, adminRoutes);
        console.log(`✅ Admin endpoints: ${basePath}/admin/*`);
    }

    // Mount storage routes if storage controller is available
    if (backend.storageController) {
        const basePath = config.basePath || "/api";
        const storageRoutes = createStorageRoutes({
            controller: backend.storageController,
            requireAuth: config.auth?.enabled ?? true
        });
        app.use(`${basePath}/storage`, storageRoutes);
        console.log(`✅ Storage endpoints: ${basePath}/storage/*`);
    }

    const basePath = config.basePath || "/api";
    console.log(`✅ GraphQL endpoint: ${basePath}/graphql`);
    console.log(`✅ REST API: ${basePath}/`);
    console.log(`✅ API docs: ${basePath}/swagger`);

    return apiServer;
}
