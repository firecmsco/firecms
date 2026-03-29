import { DataSource, EntityCollection } from "@rebasepro/types";
import { PgEnum, PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "./collections/registry";
import { loadCollectionsFromDirectory } from "./collections/loader";
import { getTableName, isTable, Relations } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PostgresDataSource } from "./services/postgresDataSource";
import { RealtimeService } from "./services/realtimeService";
import { DatasourceRegistry, DEFAULT_DATASOURCE_ID, DefaultDatasourceRegistry } from "./services/datasource-registry";
import { DatabasePoolManager } from "./services/databasePoolManager";
import { Server } from "http";
import { createPostgresWebSocket } from "./websocket";
import { ApiConfig, RebaseApiServer } from "./api";
import { Express } from "express";
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
    StorageConfig,
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
 * Configuration for a PostgreSQL datasource.
 * Use with `createPostgresDelegate()` to create a DataSource.
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
    /** Explicit cluster connection string to enable cross-database queries 
        and administrative pool generation. */
    adminConnectionString?: string;
}

/**
 * Configuration for a single datasource.
 *
 * You can provide either:
 * - A `DataSource` directly (for any database type)
 * - A `PostgresDatasourceConfig` (convenience for PostgreSQL)
 *
 * @example
 * // PostgreSQL (using config object)
 * { connection: db, schema: { tables, enums, relations } }
 *
 * // Any database (using delegate directly)
 * myFirestoreDelegate
 */
export type DatasourceConfig = DataSource | PostgresDatasourceConfig;

export interface RebaseBackendConfig {
    collections?: EntityCollection[];
    collectionsDir?: string;
    server: Server;
    /** Express app for mounting auth/storage routes */
    app: Express;
    /** Base path for API routes (default: '/api') */
    basePath?: string;

    /**
     * Datasource configuration. Supports two formats:
     *
     * **Single datasource (most common):**
     * ```typescript
     * datasource: {
     *     connection: db,
     *     schema: { tables, enums, relations }
     * }
     * ```
     *
     * **Multiple datasources:**
     * ```typescript
     * datasource: {
     *     "(default)": { connection: db, schema: { tables } },
     *     "analytics": { connection: analyticsDb, schema: { analyticsTables } }
     * }
     * ```
     *
     * **Using delegates directly (for non-PostgreSQL):**
     * ```typescript
     * datasource: {
     *     "(default)": postgresDelegate,
     *     "firestore": firestoreDelegate
     * }
     * ```
     *
     * Collections use `datasource` property to specify which to use.
     * Collections without `datasource` use "(default)".
     */
    datasource: DatasourceConfig | Record<string, DatasourceConfig>;

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

export interface RebaseBackendInstance {
    /**
     * Registry for accessing multiple datasources by ID.
     * Use `datasourceRegistry.getOrDefault(databaseId)` to get a datasource.
     */
    datasourceRegistry: DatasourceRegistry;

    /**
     * Default datasource delegate (convenience accessor).
     * Equivalent to `datasourceRegistry.getDefault()`.
     */
    dataSource: DataSource;

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

export async function initializeRebaseBackend(config: RebaseBackendConfig): Promise<RebaseBackendInstance> {
    try {
        return await _initializeRebaseBackend(config);
    } catch (error: any) {
        console.error("❌ Critical error during Rebase Backend initialization:", error);

        const basePath = config.basePath || "/api";
        config.app.use(basePath, (req, res, next) => {
            res.status(503).json({
                error: {
                    message: "Backend initialization failed. Please check the backend server logs for more details. This is usually caused by a database connection failure.",
                    code: "backend-init-failed"
                }
            });
        });

        // Return a mocked instance so the server still starts and serves the 503 errors
        return {
            __failed: true,
            datasourceRegistry: DefaultDatasourceRegistry.create({}),
            dataSource: {} as any,
            realtimeServices: {},
            realtimeService: {} as any,
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

    // ============ Load collections dynamically if needed ============
    let activeCollections = config.collections || [];
    if (config.collectionsDir && activeCollections.length === 0) {
        activeCollections = await loadCollectionsFromDirectory(config.collectionsDir);
        console.log(`📁 Auto-discovered ${activeCollections.length} collections from ${config.collectionsDir}`);
    }

    // ============ Parse datasource configuration ============

    let rawDatasourceConfigs: Record<string, DatasourceConfig>;

    if (isDatasourceConfig(config.datasource)) {
        // Single datasource (most common)
        rawDatasourceConfigs = { [DEFAULT_DATASOURCE_ID]: config.datasource };
    } else {
        // Record of datasources
        rawDatasourceConfigs = config.datasource;
    }

    // ============ Initialize datasources ============

    const realtimeServices: Record<string, RealtimeService> = {};
    const delegates: Record<string, DataSource> = {};

    for (const [datasourceId, dsConfig] of Object.entries(rawDatasourceConfigs)) {
        console.log(`📦 Initializing datasource: "${datasourceId}"`);

        // Resolve the DataSource from the config
        const {
            delegate,
            db,
            schema,
            adminConnectionString
        } = resolveDatasourceConfig(dsConfig);

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
                    const matchingCollection = activeCollections.find(
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
            const poolManager = adminConnectionString ? new DatabasePoolManager(adminConnectionString) : undefined;
            const dataSource = new PostgresDataSource(db, realtimeService, undefined, poolManager);
            realtimeService.setDataSource(dataSource);

            realtimeServices[datasourceId] = realtimeService;
            delegates[datasourceId] = dataSource;
        } else {
            console.warn(`⚠️ Skipping datasource "${datasourceId}" - invalid configuration`);
        }
    }

    // Create the registry
    const datasourceRegistry = DefaultDatasourceRegistry.create(delegates);

    console.log(`✅ Initialized ${Object.keys(delegates).length} datasource(s): ${Object.keys(delegates).join(", ")}`);

    // Register collections
    activeCollections.forEach(collection => collectionRegistry.register(collection));

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

    // ============ Mount core routes (auth, admin, storage) ============
    const basePath = config.basePath || "/api";

    if (config.auth && defaultDb && userService && roleService) {
        const authRoutes = createAuthRoutes({
            db: defaultDb,
            emailService,
            emailConfig: config.auth.email,
            allowRegistration: config.auth.allowRegistration ?? false
        });
        config.app.use(`${basePath}/auth`, authRoutes);
        console.log(`✅ Auth endpoints: ${basePath}/auth/*`);

        const adminRoutes = createAdminRoutes({ db: defaultDb });
        config.app.use(`${basePath}/admin`, adminRoutes);
        console.log(`✅ Admin endpoints: ${basePath}/admin/*`);
    }

    if (storageController) {
        const storageRoutes = createStorageRoutes({
            controller: storageController,
            requireAuth: config.auth?.requireAuth ?? true
        });
        config.app.use(`${basePath}/storage`, storageRoutes);
        console.log(`✅ Storage endpoints: ${basePath}/storage/*`);
    }

    // ============ Create WebSocket with auth support ============
    // Use the default realtime service and datasource delegate
    const defaultRealtimeService = realtimeServices[DEFAULT_DATASOURCE_ID];
    const defaultDataSourceDelegate = datasourceRegistry.getDefault();

    createPostgresWebSocket(
        config.server,
        defaultRealtimeService,
        defaultDataSourceDelegate as PostgresDataSource,
        config.auth
    );

    console.log("✅ Rebase Backend Initialized");

    return {
        datasourceRegistry,
        dataSource: defaultDataSourceDelegate,
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
 * Type guard to check if an object is a DataSource
 */
function isDataSourceDelegate(obj: unknown): obj is DataSource {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const delegate = obj as DataSource;
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
 * Type guard to check if a value is a single DatasourceConfig
 * (either a DataSource or PostgresDatasourceConfig)
 * vs a Record<string, DatasourceConfig>
 */
function isDatasourceConfig(obj: unknown): obj is DatasourceConfig {
    return isDataSourceDelegate(obj) || isPostgresDatasourceConfig(obj);
}

/**
 * Resolve a DatasourceConfig into its components
 */
function resolveDatasourceConfig(config: DatasourceConfig): {
    delegate?: DataSource;
    db?: NodePgDatabase;
    schema?: PostgresDatasourceConfig["schema"];
    adminConnectionString?: string;
} {
    // If it's a DataSource directly
    if (isDataSourceDelegate(config)) {
        return { delegate: config };
    }

    // If it's a PostgresDatasourceConfig
    if (isPostgresDatasourceConfig(config)) {
        return {
            db: config.connection,
            schema: config.schema,
            adminConnectionString: config.adminConnectionString
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
 * @param app Express application instance
 * @param backend Rebase backend instance from initializeRebaseBackend
 * @param config API configuration options
 * @returns API server instance
 */
export async function initializeRebaseAPI(
    app: Express,
    backend: RebaseBackendInstance,
    config: Partial<ApiConfig> = {}
): Promise<RebaseApiServer> {
    if ((backend as any).__failed) {
        console.warn("⚠️ Skipping REST/GraphQL API initialization because backend initialization failed.");
        // Return a dummy api server
        const express = await import("express");
        return { getRouter: () => express.Router() } as any;
    }

    console.log("🚀 Initializing Rebase REST/GraphQL API (optional for external integrations)");

    // Get collections from the registry using the correct method
    const collections = collectionRegistry.getCollections();

    const apiServer = await RebaseApiServer.create({
        collections,
        collectionsDir: config.collectionsDir,
        dataSource: backend.dataSource,
        basePath: config.basePath || "/api",
        enableGraphQL: config.enableGraphQL ?? true,
        enableREST: config.enableREST ?? true,
        cors: config.cors,
        requireAuth: config.requireAuth !== undefined ? config.requireAuth : (backend.userService ? true : false),
        pagination: config.pagination
    });

    // Mount API router on the provided Express app
    const apiRouter = apiServer.getRouter();
    app.use(apiRouter);

    const basePath = config.basePath || "/api";
    console.log(`✅ GraphQL endpoint: ${basePath}/graphql`);
    console.log(`✅ API docs: ${basePath}/swagger`);

    return apiServer;
}


