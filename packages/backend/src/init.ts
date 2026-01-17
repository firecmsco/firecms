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
 * Configuration for a single datasource (database)
 */
export interface DatasourceConfig {
    /** Database connection */
    db: NodePgDatabase;
    /** Database tables (Drizzle schema) */
    tables: Record<string, PgTable>;
    /** Database enums (optional) */
    enums?: Record<string, PgEnum<any>>;
    /** Database relations (optional) */
    relations?: Record<string, Relations>;
}

export interface FireCMSBackendConfig {
    collections: EntityCollection[];
    server: Server;

    /**
     * Database configuration. Supports two formats:
     *
     * 1. Single database (maps to "(default)"):
     *    ```
     *    datasources: { db, tables, enums, relations }
     *    ```
     *
     * 2. Multiple databases (keyed by databaseId):
     *    ```
     *    datasources: {
     *        "(default)": { db, tables, ... },
     *        "analytics": { db: analyticsDb, tables: analyticsTables, ... }
     *    }
     *    ```
     *
     * Collections use `databaseId` property to specify which datasource.
     * Collections without `databaseId` use "(default)".
     */
    datasources: DatasourceConfig | Record<string, DatasourceConfig>;

    /**
     * @deprecated Use `datasources` instead. Single database config for backwards compatibility.
     */
    db?: NodePgDatabase;
    /**
     * @deprecated Use `datasources` instead.
     */
    tables?: Record<string, PgTable>;
    /**
     * @deprecated Use `datasources` instead.
     */
    enums?: Record<string, PgEnum<any>>;
    /**
     * @deprecated Use `datasources` instead.
     */
    relations?: Record<string, Relations>;

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
    // Support both new `datasources` and deprecated `db`/`tables` fields

    let datasourceConfigs: Record<string, DatasourceConfig>;

    if (config.datasources) {
        // Check if it's a single DatasourceConfig or a map
        if (isDatasourceConfig(config.datasources)) {
            // Single datasource → map to "(default)"
            datasourceConfigs = { [DEFAULT_DATASOURCE_ID]: config.datasources };
        } else {
            // Map of datasources
            datasourceConfigs = config.datasources;
        }
    } else if (config.db && config.tables) {
        // Backwards compatibility: use deprecated fields
        console.warn(
            "⚠️ Using deprecated `db`/`tables` fields. Please migrate to `datasources` config."
        );
        datasourceConfigs = {
            [DEFAULT_DATASOURCE_ID]: {
                db: config.db,
                tables: config.tables,
                enums: config.enums,
                relations: config.relations
            }
        };
    } else {
        throw new Error(
            "FireCMSBackendConfig requires either `datasources` or deprecated `db`/`tables` fields."
        );
    }

    // ============ Initialize datasources ============

    const realtimeServices: Record<string, RealtimeService> = {};
    const delegates: Record<string, DataSourceDelegate> = {};

    for (const [datasourceId, dsConfig] of Object.entries(datasourceConfigs)) {
        console.log(`📦 Initializing datasource: "${datasourceId}"`);

        // Register tables for this datasource
        Object.values(dsConfig.tables).forEach((table) => {
            if (isTable(table)) {
                const tableName = getTableName(table);
                const matchingCollection = config.collections.find(
                    c => c.dbPath === tableName && (c.databaseId === datasourceId || (!c.databaseId && datasourceId === DEFAULT_DATASOURCE_ID))
                );
                collectionRegistry.registerTable(table, matchingCollection?.dbPath ?? tableName);
            }
        });

        if (dsConfig.enums) collectionRegistry.registerEnums(dsConfig.enums);
        if (dsConfig.relations) collectionRegistry.registerRelations(dsConfig.relations);

        // Create realtime service and datasource delegate
        const realtimeService = new RealtimeService(dsConfig.db);
        const dataSourceDelegate = new PostgresDataSourceDelegate(dsConfig.db, realtimeService);

        realtimeServices[datasourceId] = realtimeService;
        delegates[datasourceId] = dataSourceDelegate;
    }

    // Create the registry
    const datasourceRegistry = DefaultDatasourceRegistry.create(delegates);

    console.log(`✅ Initialized ${Object.keys(datasourceConfigs).length} datasource(s): ${Object.keys(datasourceConfigs).join(", ")}`);

    // Register collections
    config.collections.forEach(collection => collectionRegistry.register(collection));

    // ============ Get default datasource for auth ============
    const defaultDatasourceConfig = datasourceConfigs[DEFAULT_DATASOURCE_ID];
    if (!defaultDatasourceConfig) {
        throw new Error(
            `No "${DEFAULT_DATASOURCE_ID}" datasource configured. Auth and other core features require a default datasource.`
        );
    }
    const defaultDb = defaultDatasourceConfig.db;

    // ============ Initialize auth if configured ============
    let userService: UserService | undefined;
    let roleService: RoleService | undefined;
    let emailService: EmailService | undefined;

    if (config.auth) {
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
 * Type guard to check if an object is a DatasourceConfig (single datasource)
 * vs a Record<string, DatasourceConfig> (multiple datasources)
 */
function isDatasourceConfig(obj: unknown): obj is DatasourceConfig {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const config = obj as DatasourceConfig;
    // A DatasourceConfig has `db` and `tables` directly
    return (
        config.db !== undefined &&
        typeof config.tables === "object" &&
        config.tables !== null
    );
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
