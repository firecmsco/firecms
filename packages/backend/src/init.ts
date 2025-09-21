import { EntityCollection } from "@firecms/types";
import { PgEnum, PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "./collections/registry";
import { getTableName, isTable, Relations } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PostgresDataSourceDelegate } from "./services/dataSourceDelegate";
import { RealtimeService } from "./services/realtimeService";
import { Server } from "http";
import { createPostgresWebSocket } from "./websocket";
import { FireCMSApiServer } from "./api/server";
import { ApiConfig } from "./api/types";
import { Express } from "express";
import { configureLogLevel } from "./utils/logging";

export interface FireCMSBackendConfig {
    collections: EntityCollection[];
    tables: Record<string, PgTable>;
    enums?: Record<string, PgEnum<any>>;
    relations?: Record<string, Relations>;
    db: NodePgDatabase;
    server: Server;
    // NEW: Optional API configuration
    api?: Partial<ApiConfig> & {
        app?: Express; // Pass the Express app to mount API routes
    };
    // NEW: Optional logging configuration
    logging?: {
        level?: 'error' | 'warn' | 'info' | 'debug';
    };
}

export function initializeFireCMSBackend(config: FireCMSBackendConfig) {
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

    // NEW: Initialize API server if requested
    let apiServer: FireCMSApiServer | undefined;
    if (config.api?.app) {
        console.log("🚀 Initializing FireCMS API endpoints");

        apiServer = new FireCMSApiServer({
            collections: config.collections,
            dataSource: dataSourceDelegate,
            basePath: config.api.basePath || '/api',
            enableGraphQL: config.api.enableGraphQL ?? true,
            enableREST: config.api.enableREST ?? true,
            cors: config.api.cors,
            auth: config.api.auth,
            pagination: config.api.pagination
        });

        // Mount API router on the provided Express app
        const apiRouter = apiServer.getRouter();
        config.api.app.use(apiRouter);

        console.log(`✅ GraphQL endpoint: ${config.api.basePath || '/api'}/graphql`);
        console.log(`✅ REST API: ${config.api.basePath || '/api'}/`);
        console.log(`✅ API docs: ${config.api.basePath || '/api'}/swagger`);
    }

    console.log("✅ FireCMS Backend Initialized");

    return {
        dataSourceDelegate,
        realtimeService,
        apiServer
    };
}
