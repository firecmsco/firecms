/**
 * MongoDB Backend Factory
 *
 * This module provides factory functions for creating MongoDB backend instances.
 * It abstracts the creation of datasources, realtime services, and entity services.
 */

import { Db, MongoClient } from "mongodb";
import { DataSourceDelegate, EntityCollection } from "@firecms/types";

import { MongoEntityService, EntityRepository } from "./db/MongoEntityService";
import { MongoRealtimeService, RealtimeProvider } from "./services/MongoRealtimeService";
import { MongoDataSourceDelegate } from "./services/MongoDataSourceDelegate";
import { MongoDBConnection, DatabaseConnection } from "./connection";

// =============================================================================
// MongoDB-Specific Configuration Types
// =============================================================================

/**
 * Backend instance interface (from @firecms/backend).
 */
export interface BackendInstance {
    entityRepository: EntityRepository;
    realtimeProvider: RealtimeProvider;
    collectionRegistry: CollectionRegistryInterface;
    connection: DatabaseConnection;
}

/**
 * Backend config interface (from @firecms/backend).
 */
export interface BackendConfig {
    type: string;
    connection: any;
    schema?: any;
}

/**
 * Collection registry interface (from @firecms/backend).
 */
export interface CollectionRegistryInterface {
    register(collection: EntityCollection): void;
    getCollectionByPath(path: string): EntityCollection | undefined;
    getCollections(): EntityCollection[];
}

/**
 * Configuration for creating a MongoDB backend.
 */
export interface MongoBackendConfig extends BackendConfig {
    type: "mongodb";
    /** MongoDB database instance */
    connection: Db;
    /** MongoDB client (for connection management) */
    client: MongoClient;
    /** Collections to register (optional, can be registered later) */
    collections?: EntityCollection[];
}

/**
 * MongoDB-specific backend instance with additional MongoDB types.
 */
export interface MongoBackendInstance extends BackendInstance {
    /** The MongoDB database instance */
    db: Db;
    /** The MongoDB client */
    client: MongoClient;
    /** MongoDB DataSourceDelegate for use with FireCMS */
    dataSourceDelegate: DataSourceDelegate;
    /** Entity service for direct database operations */
    entityService: MongoEntityService;
    /** Realtime service for subscriptions */
    realtimeService: MongoRealtimeService;
}

// =============================================================================
// Simple Collection Registry
// =============================================================================

/**
 * Simple in-memory collection registry for MongoDB.
 */
export class MongoCollectionRegistry implements CollectionRegistryInterface {
    private collections = new Map<string, EntityCollection>();

    /**
     * Register a collection
     */
    register(collection: EntityCollection): void {
        this.collections.set(collection.name, collection);
    }

    /**
     * Get a collection by its path
     */
    getCollectionByPath(path: string): EntityCollection | undefined {
        return this.collections.get(path);
    }

    /**
     * Get all registered collections
     */
    getCollections(): EntityCollection[] {
        return Array.from(this.collections.values());
    }
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create a complete MongoDB backend instance.
 *
 * This factory function creates all the necessary services for a MongoDB backend:
 * - MongoDBConnection (database connection wrapper)
 * - MongoEntityService (implements EntityRepository)
 * - MongoRealtimeService (implements RealtimeProvider)
 * - MongoCollectionRegistry (implements CollectionRegistryInterface)
 * - MongoDataSourceDelegate (for FireCMS integration)
 *
 * @example
 * ```typescript
 * import { createMongoBackend } from "@firecms/mongodb";
 *
 * const client = new MongoClient("mongodb://localhost:27017");
 * await client.connect();
 * const db = client.db("my_database");
 *
 * const backend = createMongoBackend({
 *     type: "mongodb",
 *     connection: db,
 *     client: client,
 *     collections: myCollections
 * });
 *
 * // Use the backend
 * const entities = await backend.entityRepository.fetchCollection("users", {});
 * ```
 */
export function createMongoBackend(config: MongoBackendConfig): MongoBackendInstance {
    const { connection: db, client, collections } = config;

    // Create collection registry
    const collectionRegistry = new MongoCollectionRegistry();

    // Register collections if provided
    if (collections) {
        collections.forEach(collection => collectionRegistry.register(collection));
    }

    // Create services
    const entityService = new MongoEntityService(db);
    const realtimeService = new MongoRealtimeService(db);
    const dataSourceDelegate = new MongoDataSourceDelegate(db, realtimeService);
    const mongoConnection = new MongoDBConnection(db, client);

    return {
        // Abstract interface implementations
        connection: mongoConnection,
        entityRepository: entityService,
        realtimeProvider: realtimeService,
        collectionRegistry: collectionRegistry,

        // MongoDB-specific accessors
        db,
        client,
        dataSourceDelegate,
        entityService,
        realtimeService
    };
}

/**
 * Create a MongoDB DataSourceDelegate.
 *
 * This is a convenience function when you only need the DataSourceDelegate
 * without the full backend instance.
 *
 * @example
 * ```typescript
 * import { createMongoDelegate } from "@firecms/mongodb";
 *
 * const delegate = createMongoDelegate(db);
 * ```
 */
export function createMongoDelegate(
    db: Db,
    realtimeService?: MongoRealtimeService
): MongoDataSourceDelegate {
    const realtime = realtimeService ?? new MongoRealtimeService(db);
    return new MongoDataSourceDelegate(db, realtime);
}

/**
 * Create a RealtimeService for MongoDB.
 *
 * @example
 * ```typescript
 * import { createMongoRealtimeService } from "@firecms/mongodb";
 *
 * const realtimeService = createMongoRealtimeService(db);
 * ```
 */
export function createMongoRealtimeService(db: Db): MongoRealtimeService {
    return new MongoRealtimeService(db);
}

/**
 * Create a MongoDB entity repository.
 *
 * @example
 * ```typescript
 * import { createMongoEntityRepository } from "@firecms/mongodb";
 *
 * const repository = createMongoEntityRepository(db);
 * const users = await repository.fetchCollection("users", {});
 * ```
 */
export function createMongoEntityRepository(db: Db): EntityRepository {
    return new MongoEntityService(db);
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if a backend config is for MongoDB.
 */
export function isMongoBackendConfig(config: BackendConfig): config is MongoBackendConfig {
    return config.type === "mongodb" &&
        typeof (config as MongoBackendConfig).connection !== "undefined" &&
        typeof (config as MongoBackendConfig).client !== "undefined";
}

/**
 * Check if a datasource config is for MongoDB.
 */
export function isMongoDatasourceConfig(obj: unknown): obj is { type: "mongodb"; connection: Db; client: MongoClient } {
    return typeof obj === "object" &&
        obj !== null &&
        "type" in obj &&
        (obj as any).type === "mongodb" &&
        "connection" in obj &&
        "client" in obj;
}
