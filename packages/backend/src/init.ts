import { EntityCollection } from "@firecms/types";
import { PgEnum, PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "./collections/registry";
import { getTableName, isTable, Relations } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PostgresDataSourceDelegate } from "./services/dataSourceDelegate";
import { RealtimeService } from "./services/realtimeService";
import { Server } from "http";
import { createPostgresWebSocket } from "./websocket";
import { ApiConfig, FireCMSApiServer } from "./api";
import { Express } from "express";
import { configureLogLevel } from "./utils/logging";
import { configureJwt, configureGoogleOAuth, createAuthRoutes, RoleService, UserService, RefreshTokenService, ensureAuthTablesExist } from "./auth";

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
    /** Whether auth is required for all API requests (default: true) */
    requireAuth?: boolean;
    /** Seed default roles on startup (default: true on first run) */
    seedDefaultRoles?: boolean;
}

export interface FireCMSBackendConfig {
    collections: EntityCollection[];
    tables: Record<string, PgTable>;
    enums?: Record<string, PgEnum<any>>;
    relations?: Record<string, Relations>;
    db: NodePgDatabase;
    server: Server;
    logging?: {
        level?: "error" | "warn" | "info" | "debug";
    };
    /** Authentication configuration */
    auth?: AuthConfig;
}

export interface FireCMSBackendInstance {
    dataSourceDelegate: PostgresDataSourceDelegate;
    realtimeService: RealtimeService;
    userService?: UserService;
    roleService?: RoleService;
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

    config.collections.forEach(collection => collectionRegistry.register(collection));

    Object.values(config.tables).forEach((table) => {
        if (isTable(table)) {
            const tableName = getTableName(table);
            const matchingCollection = config.collections.find(c => c.dbPath === tableName);
            collectionRegistry.registerTable(table, matchingCollection?.dbPath ?? tableName);
        }
    });

    if (config.enums) collectionRegistry.registerEnums(config.enums);
    if (config.relations) collectionRegistry.registerRelations(config.relations);

    const realtimeService = new RealtimeService(config.db);
    const dataSourceDelegate = new PostgresDataSourceDelegate(config.db, realtimeService);

    // Initialize auth if configured
    let userService: UserService | undefined;
    let roleService: RoleService | undefined;

    if (config.auth) {
        console.log("🔐 Configuring authentication...");

        // Ensure auth tables exist (auto-create if needed)
        await ensureAuthTablesExist(config.db);

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

        // Create services
        userService = new UserService(config.db);
        roleService = new RoleService(config.db);

        console.log("✅ Authentication configured");
    }

    // Create WebSocket with auth support
    createPostgresWebSocket(config.server, realtimeService, dataSourceDelegate, config.auth);

    console.log("✅ FireCMS Backend Initialized");

    return {
        dataSourceDelegate,
        realtimeService,
        userService,
        roleService
    };
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
    config: Partial<ApiConfig> & { db?: NodePgDatabase } = {}
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
        const authRoutes = createAuthRoutes({ db: config.db });
        const basePath = config.basePath || "/api";
        app.use(`${basePath}/auth`, authRoutes);
        console.log(`✅ Auth endpoints: ${basePath}/auth/*`);
    }

    const basePath = config.basePath || "/api";
    console.log(`✅ GraphQL endpoint: ${basePath}/graphql`);
    console.log(`✅ REST API: ${basePath}/`);
    console.log(`✅ API docs: ${basePath}/swagger`);

    return apiServer;
}

