import { EntityCollection } from "@firecms/core";
import { PgEnum, PgTable } from "drizzle-orm/pg-core";
import { collectionRegistry } from "./collections/registry";
import { getTableName, isTable, Relations } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PostgresDataSourceDelegate } from "./services/dataSourceDelegate";
import { RealtimeService } from "./services/realtimeService";
import { Server } from "http";
import { createPostgresWebSocket } from "./websocket";

export interface FireCMSBackendConfig {
    collections: EntityCollection[];
    tables: Record<string, PgTable>;
    enums?: Record<string, PgEnum<any>>;
    relations?: Record<string, Relations>;
    db: NodePgDatabase;
    server: Server;
}

export function initializeFireCMSBackend(config: FireCMSBackendConfig) {

    console.log("🔥 Initializing FireCMS Backend");

    config.collections.forEach(collection => collectionRegistry.register(collection));

    Object.values(config.tables).forEach((table) => {
        if (isTable(table)) {
            const tableName = getTableName(table);
            const matchingCollection = config.collections.find(c => c.dbPath === tableName);
            if (matchingCollection) {
                collectionRegistry.registerTable(table, matchingCollection.dbPath);
            }
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
