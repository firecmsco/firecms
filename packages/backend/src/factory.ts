/**
 * PostgreSQL Backend Factory
 * 
 * This module provides factory functions for creating PostgreSQL backend instances.
 * It abstracts the creation of datasources, realtime services, and collection registries.
 * 
 * Future database implementations (MongoDB, MySQL, etc.) would have their own factory modules.
 */

import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PgEnum, PgTable } from "drizzle-orm/pg-core";
import { getTableName, isTable, Relations } from "drizzle-orm";
import { DataSourceDelegate, EntityCollection } from "@firecms/types";

import { EntityService } from "./db/entityService";
import { RealtimeService, PostgresRealtimeProvider } from "./services/realtimeService";
import { PostgresDataSourceDelegate } from "./services/dataSourceDelegate";
import { BackendCollectionRegistry, PostgresCollectionRegistry } from "./collections/BackendCollectionRegistry";
import {
    BackendInstance,
    EntityRepository,
    RealtimeProvider,
    CollectionRegistryInterface,
    DatabaseConnection,
    BackendConfig
} from "./db/interfaces";

// =============================================================================
// PostgreSQL-Specific Configuration Types
// =============================================================================

/**
 * PostgreSQL database connection wrapper that implements DatabaseConnection interface.
 */
export class PostgresConnection implements DatabaseConnection {
    readonly type = "postgres";
    readonly isConnected = true;

    constructor(public readonly db: NodePgDatabase) { }

    async close(): Promise<void> {
        // Note: The actual pool closing is handled by the pg Pool instance
        // This is a placeholder for interface compliance
        console.log("PostgresConnection close requested");
    }
}

/**
 * Configuration for creating a PostgreSQL backend.
 */
export interface PostgresBackendConfig extends BackendConfig {
    type: "postgres";
    /** Drizzle database connection */
    connection: NodePgDatabase;
    /** Database schema definition */
    schema: {
        /** Database tables (Drizzle schema) */
        tables: Record<string, PgTable>;
        /** Database enums (optional) */
        enums?: Record<string, PgEnum<any>>;
        /** Database relations (optional) */
        relations?: Record<string, Relations>;
    };
    /** Collections to register (optional, can be registered later) */
    collections?: EntityCollection[];
}

/**
 * PostgreSQL-specific backend instance with additional PostgreSQL types.
 */
export interface PostgresBackendInstance extends BackendInstance {
    /** The Drizzle database connection */
    db: NodePgDatabase;
    /** PostgreSQL DataSourceDelegate for use with FireCMS */
    dataSourceDelegate: DataSourceDelegate;
    /** Entity service for direct database operations */
    entityService: EntityService;
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create a complete PostgreSQL backend instance.
 * 
 * This factory function creates all the necessary services for a PostgreSQL backend:
 * - PostgresConnection (database connection wrapper)
 * - EntityService (implements EntityRepository)
 * - RealtimeService (implements RealtimeProvider)
 * - BackendCollectionRegistry (implements CollectionRegistryInterface)
 * - PostgresDataSourceDelegate (for FireCMS integration)
 * 
 * @example
 * ```typescript
 * import { createPostgresBackend } from "@firecms/backend";
 * 
 * const backend = createPostgresBackend({
 *     type: "postgres",
 *     connection: db,
 *     schema: { tables, enums, relations },
 *     collections: myCollections
 * });
 * 
 * // Use the backend
 * const entities = await backend.entityRepository.fetchCollection("users", {});
 * ```
 */
export function createPostgresBackend(config: PostgresBackendConfig): PostgresBackendInstance {
    const { connection: db, schema, collections } = config;

    // Create collection registry and register schema
    const collectionRegistry = new BackendCollectionRegistry();

    // Register tables
    if (schema.tables) {
        Object.values(schema.tables).forEach((table) => {
            if (isTable(table)) {
                const tableName = getTableName(table);
                collectionRegistry.registerTable(table, tableName);
            }
        });
    }

    // Register enums
    if (schema.enums) {
        collectionRegistry.registerEnums(schema.enums);
    }

    // Register relations
    if (schema.relations) {
        collectionRegistry.registerRelations(schema.relations);
    }

    // Register collections if provided
    if (collections) {
        collections.forEach(collection => collectionRegistry.register(collection));
    }

    // Create services
    const entityService = new EntityService(db);
    const realtimeService = new RealtimeService(db);
    const dataSourceDelegate = new PostgresDataSourceDelegate(db, realtimeService);
    const postgresConnection = new PostgresConnection(db);

    return {
        // Abstract interface implementations
        connection: postgresConnection,
        entityRepository: entityService,
        realtimeProvider: realtimeService,
        collectionRegistry: collectionRegistry,

        // PostgreSQL-specific accessors
        db,
        dataSourceDelegate,
        entityService
    };
}

/**
 * Create a PostgreSQL DataSourceDelegate.
 * 
 * This is a convenience function when you only need the DataSourceDelegate
 * without the full backend instance.
 * 
 * @example
 * ```typescript
 * import { createPostgresDelegate } from "@firecms/backend";
 * 
 * const delegate = createPostgresDelegate(db);
 * ```
 */
export function createPostgresDelegate(
    db: NodePgDatabase,
    realtimeService?: RealtimeService
): PostgresDataSourceDelegate {
    const realtime = realtimeService ?? new RealtimeService(db);
    return new PostgresDataSourceDelegate(db, realtime);
}

/**
 * Create a RealtimeService for PostgreSQL.
 * 
 * @example
 * ```typescript
 * import { createPostgresRealtimeService } from "@firecms/backend";
 * 
 * const realtimeService = createPostgresRealtimeService(db);
 * ```
 */
export function createPostgresRealtimeService(db: NodePgDatabase): RealtimeService {
    return new RealtimeService(db);
}

/**
 * Create a PostgreSQL entity repository.
 * 
 * @example
 * ```typescript
 * import { createPostgresEntityRepository } from "@firecms/backend";
 * 
 * const repository = createPostgresEntityRepository(db);
 * const users = await repository.fetchCollection("users", {});
 * ```
 */
export function createPostgresEntityRepository(db: NodePgDatabase): EntityRepository {
    return new EntityService(db);
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if a backend config is for PostgreSQL.
 */
export function isPostgresBackendConfig(config: BackendConfig): config is PostgresBackendConfig {
    return config.type === "postgres" &&
        typeof (config as PostgresBackendConfig).connection !== "undefined" &&
        typeof (config as PostgresBackendConfig).schema !== "undefined";
}
