import { DataDriver, EntityCollection } from "@rebasepro/types";
import { PgEnum, PgTable } from "drizzle-orm/pg-core";
import { BackendCollectionRegistry } from "./collections/BackendCollectionRegistry";
import { loadCollectionsFromDirectory } from "./collections/loader";
import { getTableName, isTable, Relations } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PostgresDataDriver } from "./services/postgresDataDriver";
import { RealtimeService } from "./services/realtimeService";
import { DriverRegistry, DEFAULT_DRIVER_ID, DefaultDriverRegistry } from "./services/driver-registry";
import { DatabasePoolManager } from "./services/databasePoolManager";
import { Server } from "http";
import { createPostgresWebSocket } from "./websocket";
import { ApiConfig, RebaseApiServer } from "./api";
import { Hono } from "hono";
import { HonoEnv } from "./api/types";
import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";
import { configureLogLevel } from "./utils/logging";
import {
    configureGoogleOAuth,
    configureJwt,
    createAdminRoutes,
    createAuthRoutes,
    ensureAuthTablesExist,
    RoleService,
    UserService
} from "./auth";
import { createEmailService, EmailConfig, EmailService } from "./email";
import {
    createStorageController,
    createStorageRoutes,
    DEFAULT_STORAGE_ID,
    DefaultStorageRegistry,
    BackendStorageConfig,
    StorageController,
    StorageRegistry
} from "./storage";

/**
 * Authentication configuration for Rebase backend
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
 * Configuration for a PostgreSQL driver.
 * Use with `createPostgresDelegate()` to create a DataDriver.
 */
export interface PostgresDriverConfig {
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
    /** Explicit cluster connection string to enable cross-database queries 
        and administrative pool generation. */
    adminConnectionString?: string;
    /**
     * Raw Postgres connection string for the LISTEN/NOTIFY client.
     * When provided, enables **cross-instance realtime**: multiple backend
     * instances (e.g. Cloud Run replicas) will broadcast entity changes to
     * each other via Postgres LISTEN/NOTIFY so all connected WebSocket
     * clients receive updates regardless of which instance handled the write.
     *
     * This creates one dedicated Postgres connection (outside the pool) for
     * the LISTEN channel.
     *
     * Omit to run in single-instance mode (the default).
     */
    connectionString?: string;
}

/**
 * Configuration for a single driver.
 *
 * You can provide either:
 * - A `DataDriver` directly (for any database type)
 * - A `PostgresDriverConfig` (convenience for PostgreSQL)
 *
 * @example
 * // PostgreSQL (using config object)
 * { connection: db, schema: { tables, enums, relations } }
 *
 * // Any database (using delegate directly)
 * myFirestoreDelegate
 */
export type DriverConfig = DataDriver | PostgresDriverConfig;

export interface RebaseBackendConfig {
    collections?: EntityCollection[];
    collectionsDir?: string;
    server: Server;
    /** Hono app for mounting auth/storage routes */
    app: Hono<HonoEnv>;
    /** Base path for API routes (default: '/api') */
    basePath?: string;

    /**
     * Driver configuration. Supports two formats:
     *
     * **Single driver (most common):**
     * ```typescript
     * driver: {
     *     connection: db,
     *     schema: { tables, enums, relations }
     * }
     * ```
     *
     * **Multiple drivers:**
     * ```typescript
     * driver: {
     *     "(default)": { connection: db, schema: { tables } },
     *     "analytics": { connection: analyticsDb, schema: { analyticsTables } }
     * }
     * ```
     *
     * **Using delegates directly (for non-PostgreSQL):**
     * ```typescript
     * driver: {
     *     "(default)": postgresDelegate,
     *     "firestore": firestoreDelegate
     * }
     * ```
     *
     * Collections use `driver` property to specify which to use.
     * Collections without `driver` use "(default)".
     */
    driver: DriverConfig | Record<string, DriverConfig>;

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
    storage?: BackendStorageConfig | Record<string, BackendStorageConfig>;
}

export interface RebaseBackendInstance {
    /**
     * Registry for accessing multiple drivers by ID.
     * Use `driverRegistry.getOrDefault(databaseId)` to get a driver.
     */
    driverRegistry: DriverRegistry;

    /**
     * Default driver delegate (convenience accessor).
     * Equivalent to `driverRegistry.getDefault()`.
     */
    driver: DataDriver;

    /**
     * Realtime services keyed by driver ID.
     * Use `realtimeServices[databaseId]` to get the realtime service for a driver.
     */
    realtimeServices: Record<string, RealtimeService>;

    /**
     * Default realtime service (convenience accessor for "(default)" driver).
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

    /**
     * Collection registry instance used by this backend.
     */
    collectionRegistry: BackendCollectionRegistry;
}

export async function initializeRebaseBackend(config: RebaseBackendConfig): Promise<RebaseBackendInstance> {
    try {
        return await _initializeRebaseBackend(config);
    } catch (error: unknown) {
        console.error("❌ Critical error during Rebase Backend initialization:", error);

        const basePath = config.basePath || "/api";
        config.app.use(`${basePath}/*`, async (c) => {
            return c.json({
                error: {
                    message: "Backend initialization failed. Please check the backend server logs for more details. This is usually caused by a database connection failure.",
                    code: "backend-init-failed"
                }
            }, 503);
        });

        // Return a mocked instance so the server still starts and serves the 503 errors
        return {
            __failed: true,
            driverRegistry: DefaultDriverRegistry.create({}),
            driver: {} as unknown as DataDriver,
            realtimeServices: {},
            realtimeService: {} as unknown as RealtimeService,
        } as unknown as RebaseBackendInstance;
    }
}

async function _initializeRebaseBackend(config: RebaseBackendConfig): Promise<RebaseBackendInstance> {
    // Configure logging level automatically
    if (config.logging?.level) {
        configureLogLevel(config.logging.level);
    } else {
        // Use environment variable by default
        configureLogLevel();
    }

    console.log("🔥 Initializing Rebase Backend");

    // Create a fresh registry for this backend instance (no singleton)
    const collectionRegistry = new BackendCollectionRegistry();

    // ============ Load collections dynamically if needed ============
    let activeCollections = config.collections || [];
    if (config.collectionsDir && activeCollections.length === 0) {
        activeCollections = await loadCollectionsFromDirectory(config.collectionsDir);
        console.log(`📁 Auto-discovered ${activeCollections.length} collections from ${config.collectionsDir}`);
    }

    // ============ Parse driver configuration ============

    let rawDriverConfigs: Record<string, DriverConfig>;

    if (isDriverConfig(config.driver)) {
        // Single driver (most common)
        rawDriverConfigs = { [DEFAULT_DRIVER_ID]: config.driver };
    } else {
        // Record of drivers
        rawDriverConfigs = config.driver;
    }

    // ============ Initialize drivers ============

    const realtimeServices: Record<string, RealtimeService> = {};
    const delegates: Record<string, DataDriver> = {};

    for (const [driverId, dsConfig] of Object.entries(rawDriverConfigs)) {
        console.log(`📦 Initializing driver: "${driverId}"`);

        // Resolve the DataDriver from the config
        const {
            delegate,
            db,
            schema,
            adminConnectionString,
            connectionString
        } = resolveDriverConfig(dsConfig);

        if (delegate) {
            // Direct delegate - just use it
            delegates[driverId] = delegate;

            // For non-Postgres delegates, we don't have a RealtimeService
            // They handle their own real-time (e.g., Firestore)
        } else if (db && schema) {
            // PostgreSQL config - create delegate

            // Register tables for this driver
            Object.values(schema.tables).forEach((table) => {
                if (isTable(table)) {
                    const tableName = getTableName(table);
                    const matchingCollection = activeCollections.find(
                        c => c.dbPath === tableName && (
                            c.driver === driverId ||
                            (!c.driver && driverId === DEFAULT_DRIVER_ID)
                        )
                    );
                    collectionRegistry.registerTable(table, matchingCollection?.dbPath ?? tableName);
                }
            });

            if (schema.enums) collectionRegistry.registerEnums(schema.enums);
            if (schema.relations) collectionRegistry.registerRelations(schema.relations);

            // Build a merged schema object and re-create Drizzle with it.
            // This enables db.query.<table>.findMany({ with: { ... } }) for relational queries.
            const mergedSchema: Record<string, unknown> = {
                ...schema.tables,
                ...(schema.relations || {})
            };
            const { drizzle: createDrizzle } = await import("drizzle-orm/node-postgres");
            const schemaAwareDb = createDrizzle((db as any).$client ?? db, { schema: mergedSchema });

            // Create realtime service and driver delegate, using schema-aware db
            const realtimeService = new RealtimeService(schemaAwareDb, collectionRegistry);
            const poolManager = adminConnectionString ? new DatabasePoolManager(adminConnectionString) : undefined;
            const driver = new PostgresDataDriver(schemaAwareDb, realtimeService, collectionRegistry, undefined, poolManager);
            realtimeService.setDataDriver(driver);

            // Enable cross-instance realtime ONLY if connectionString is explicitly provided.
            // This is an opt-in feature — omit connectionString to run in single-instance mode.
            if (connectionString) {
                try {
                    await realtimeService.startListening(connectionString);
                } catch (err) {
                    console.warn(`⚠️ Cross-instance realtime could not be started for driver "${driverId}":`, err);
                }
            }

            realtimeServices[driverId] = realtimeService;
            delegates[driverId] = driver;
        } else {
            console.warn(`⚠️ Skipping driver "${driverId}" - invalid configuration`);
        }
    }

    // Create the registry
    const driverRegistry = DefaultDriverRegistry.create(delegates);

    console.log(`✅ Initialized ${Object.keys(delegates).length} driver(s): ${Object.keys(delegates).join(", ")}`);

    // Register collections
    activeCollections.forEach(collection => collectionRegistry.register(collection));

    // ============ Get default driver for auth ============
    // Auth requires PostgreSQL, so we need to find the default db connection
    let defaultDb: NodePgDatabase | undefined;
    const defaultConfig = rawDriverConfigs[DEFAULT_DRIVER_ID];
    if (defaultConfig) {
        const resolved = resolveDriverConfig(defaultConfig);
        defaultDb = resolved.db;
    }

    // ============ Initialize auth if configured ============
    let userService: UserService | undefined;
    let roleService: RoleService | undefined;
    let emailService: EmailService | undefined;

    if (config.auth) {
        if (!defaultDb) {
            console.warn(
                "⚠️ Auth requires a PostgreSQL database. No default PostgreSQL driver found. " +
                "Auth will not be initialized. Make sure your default driver uses PostgresDriverConfig."
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

        if (isBackendStorageConfig(config.storage)) {
            // Single storage config → maps to "(default)"
            const controller = createStorageController(config.storage);
            controllers[DEFAULT_STORAGE_ID] = controller;
            console.log(`✅ Storage configured (${config.storage.type})`);
        } else {
            // Map of storage configs
            for (const [storageId, storageConfig] of Object.entries(config.storage)) {
                if (isBackendStorageConfig(storageConfig)) {
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

    // ============ Mount core routes (auth, admin, storage) ============
    const basePath = config.basePath || "/api";

    if (config.auth && defaultDb && userService && roleService) {
        const authRoutes = createAuthRoutes({
            db: defaultDb,
            emailService,
            emailConfig: config.auth.email,
            allowRegistration: config.auth.allowRegistration ?? false
        });
        config.app.route(`${basePath}/auth`, authRoutes);
        console.log(`✅ Auth endpoints: ${basePath}/auth/*`);

        const adminRoutes = createAdminRoutes({ db: defaultDb });
        config.app.route(`${basePath}/admin`, adminRoutes);
        console.log(`✅ Admin endpoints: ${basePath}/admin/*`);
    }

    if (storageController) {
        const storageRoutes = createStorageRoutes({
            controller: storageController,
            requireAuth: config.auth?.requireAuth ?? true
        });
        config.app.route(`${basePath}/storage`, storageRoutes);
        console.log(`✅ Storage endpoints: ${basePath}/storage/*`);
    }

    // ============ Create WebSocket with auth support ============
    // Use the default realtime service and driver delegate
    const defaultRealtimeService = realtimeServices[DEFAULT_DRIVER_ID];
    const defaultDataDriverDelegate = driverRegistry.getDefault();

    createPostgresWebSocket(
        config.server,
        defaultRealtimeService,
        defaultDataDriverDelegate as PostgresDataDriver,
        config.auth
    );

    console.log("✅ Rebase Backend Initialized");

    return {
        driverRegistry,
        driver: defaultDataDriverDelegate,
        realtimeServices,
        realtimeService: defaultRealtimeService,
        userService,
        roleService,
        emailService,
        storageRegistry,
        storageController,
        collectionRegistry
    };
}

/**
 * Type guard to check if an object is a DataDriver
 */
function isDataDriverDelegate(obj: unknown): obj is DataDriver {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const delegate = obj as DataDriver;
    return (
        typeof delegate.key === "string" &&
        typeof delegate.fetchCollection === "function" &&
        typeof delegate.fetchEntity === "function" &&
        typeof delegate.saveEntity === "function" &&
        typeof delegate.deleteEntity === "function"
    );
}

/**
 * Type guard to check if an object is a PostgresDriverConfig (new format)
 */
function isPostgresDriverConfig(obj: unknown): obj is PostgresDriverConfig {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const config = obj as PostgresDriverConfig;
    return (
        config.connection !== undefined &&
        typeof config.schema === "object" &&
        config.schema !== null &&
        typeof config.schema.tables === "object"
    );
}

/**
 * Type guard to check if a value is a single DriverConfig
 * (either a DataDriver or PostgresDriverConfig)
 * vs a Record<string, DriverConfig>
 */
function isDriverConfig(obj: unknown): obj is DriverConfig {
    return isDataDriverDelegate(obj) || isPostgresDriverConfig(obj);
}

/**
 * Resolve a DriverConfig into its components
 */
function resolveDriverConfig(config: DriverConfig): {
    delegate?: DataDriver;
    db?: NodePgDatabase;
    schema?: PostgresDriverConfig["schema"];
    adminConnectionString?: string;
    connectionString?: string;
} {
    // If it's a DataDriver directly
    if (isDataDriverDelegate(config)) {
        return { delegate: config };
    }

    // If it's a PostgresDriverConfig
    if (isPostgresDriverConfig(config)) {
        return {
            db: config.connection,
            schema: config.schema,
            adminConnectionString: config.adminConnectionString,
            connectionString: config.connectionString
        };
    }

    return {};
}

/**
 * Type guard to check if an object is a BackendStorageConfig (single storage)
 * vs a Record<string, BackendStorageConfig> (multiple storages)
 */
function isBackendStorageConfig(obj: unknown): obj is BackendStorageConfig {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const config = obj as BackendStorageConfig;
    // A BackendStorageConfig has a `type` property that is 'local' or 's3'
    return (
        config.type === "local" || config.type === "s3"
    );
}

/**
 * Initialize optional REST/GraphQL API endpoints on an Express app.
 * 
 * NOTE: Auth, admin, and storage routes are automatically mounted by
 * initializeRebaseBackend(). This function is only needed if you want
 * to expose REST/GraphQL APIs for external integrations.
 * 
 * @param app Hono application instance
 * @param backend Rebase backend instance from initializeRebaseBackend
 * @param config API configuration options
 * @returns API server instance
 */
export async function initializeRebaseAPI(
    app: Hono<HonoEnv>,
    backend: RebaseBackendInstance,
    config: Partial<ApiConfig> = {}
): Promise<RebaseApiServer> {
    if ((backend as unknown as Record<string, unknown>).__failed) {
        console.warn("⚠️ Skipping REST/GraphQL API initialization because backend initialization failed.");
        // Return a dummy api server
        const { Hono } = await import("hono");
        return { getRouter: () => new Hono<HonoEnv>() } as unknown as RebaseApiServer;
    }

    console.log("🚀 Initializing Rebase REST/GraphQL API (optional for external integrations)");

    // Get collections from the backend's registry instance
    const collections = backend.collectionRegistry.getCollections();

    const apiServer = await RebaseApiServer.create({
        collections,
        collectionsDir: config.collectionsDir,
        driver: backend.driver,
        basePath: config.basePath || "/api",
        enableGraphQL: config.enableGraphQL ?? true,
        enableREST: config.enableREST ?? true,
        cors: config.cors,
        requireAuth: config.requireAuth !== undefined ? config.requireAuth : (backend.userService ? true : false),
        pagination: config.pagination
    });

    // Mount API router on the provided Hono app
    const apiRouter = apiServer.getRouter();
    app.route("/", apiRouter);

    const basePath = config.basePath || "/api";
    console.log(`✅ GraphQL endpoint: ${basePath}/graphql`);
    console.log(`✅ API docs: ${basePath}/swagger`);

    return apiServer;
}


