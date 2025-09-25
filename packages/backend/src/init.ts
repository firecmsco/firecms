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
}

export interface FireCMSBackendInstance {
    dataSourceDelegate: PostgresDataSourceDelegate;
    realtimeService: RealtimeService;
}

export function initializeFireCMSBackend(config: FireCMSBackendConfig): FireCMSBackendInstance {
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

    createPostgresWebSocket(config.server, realtimeService, dataSourceDelegate);

    console.log("✅ FireCMS Backend Initialized");

    return {
        dataSourceDelegate,
        realtimeService
    };
}

/**
 * Initialize FireCMS API endpoints on an Express app
 * @param app Express application instance
 * @param backend FireCMS backend instance from initializeFireCMSBackend
 * @param config API configuration options
 * @returns API server instance
 */
export function initializeFireCMSAPI(
    app: Express,
    backend: FireCMSBackendInstance,
    config: Partial<ApiConfig> = {}
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

    const basePath = config.basePath || "/api";
    console.log(`✅ GraphQL endpoint: ${basePath}/graphql`);
    console.log(`✅ REST API: ${basePath}/`);
    console.log(`✅ API docs: ${basePath}/swagger`);

    return apiServer;
}
