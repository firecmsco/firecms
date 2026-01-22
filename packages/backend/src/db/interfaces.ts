/**
 * Database Abstraction Interfaces
 * 
 * These interfaces define the contracts that any database backend must implement
 * to be used with FireCMS. This allows for pluggable database backends like
 * PostgreSQL, MongoDB, MySQL, etc.
 */

import { Entity, EntityCollection, FilterValues, WhereFilterOp } from "@firecms/types";

// =============================================================================
// DATABASE CONNECTION INTERFACES
// =============================================================================

/**
 * Abstract database connection interface.
 * Represents a connection to any database system.
 */
export interface DatabaseConnection {
    /**
     * Type identifier for this database (e.g., 'postgres', 'mongodb', 'mysql')
     */
    readonly type: string;

    /**
     * Whether the connection is currently active
     */
    readonly isConnected?: boolean;

    /**
     * Close the database connection
     */
    close?(): Promise<void>;
}

// =============================================================================
// QUERY BUILDING INTERFACES
// =============================================================================

/**
 * A single filter condition for database queries
 */
export interface QueryFilter {
    field: string;
    operator: WhereFilterOp;
    value: any;
}

/**
 * Options for fetching a collection of entities
 */
export interface FetchCollectionOptions<M extends Record<string, any> = any> {
    filter?: FilterValues<Extract<keyof M, string>>;
    orderBy?: string;
    order?: "desc" | "asc";
    limit?: number;
    startAfter?: any;
    searchString?: string;
    databaseId?: string;
}

/**
 * Options for searching entities
 */
export interface SearchOptions<M extends Record<string, any> = any> {
    filter?: FilterValues<Extract<keyof M, string>>;
    orderBy?: string;
    order?: "desc" | "asc";
    limit?: number;
    databaseId?: string;
}

/**
 * Options for counting entities
 */
export interface CountOptions<M extends Record<string, any> = any> {
    filter?: FilterValues<Extract<keyof M, string>>;
    databaseId?: string;
}

/**
 * Abstract condition builder interface.
 * Implementations translate FireCMS filter conditions to database-specific queries.
 * 
 * Note: This interface can be implemented as instance methods or as a class with static methods.
 * For static implementations (like DrizzleConditionBuilder), use the ConditionBuilderStatic type.
 * 
 * @template T The type of condition returned by the builder (e.g., SQL for PostgreSQL, Filter<Document> for MongoDB)
 */
export interface ConditionBuilder<T = any> {
    /**
     * Build filter conditions from FireCMS FilterValues
     */
    buildFilterConditions<M extends Record<string, any>>(
        filter: FilterValues<Extract<keyof M, string>>,
        collectionPath: string,
        ...args: any[]
    ): T[];

    /**
     * Build search conditions for text search
     */
    buildSearchConditions(
        searchString: string,
        properties: Record<string, any>,
        ...args: any[]
    ): T[];

    /**
     * Combine multiple conditions with AND operator
     */
    combineConditionsWithAnd(conditions: T[]): T | undefined;

    /**
     * Combine multiple conditions with OR operator
     */
    combineConditionsWithOr(conditions: T[]): T | undefined;
}

/**
 * Static condition builder type for implementations using static methods.
 * Use this type when the class provides static methods rather than instance methods.
 * 
 * @example
 * // DrizzleConditionBuilder satisfies this type
 * const builder: ConditionBuilderStatic<SQL> = DrizzleConditionBuilder;
 */
export type ConditionBuilderStatic<T = any> = {
    buildFilterConditions<M extends Record<string, any>>(
        filter: FilterValues<Extract<keyof M, string>>,
        ...args: any[]
    ): T[];
    buildSearchConditions(
        searchString: string,
        properties: Record<string, any>,
        ...args: any[]
    ): T[];
    combineConditionsWithAnd(conditions: T[]): T | undefined;
    combineConditionsWithOr(conditions: T[]): T | undefined;
};

// =============================================================================
// ENTITY REPOSITORY INTERFACES
// =============================================================================

/**
 * Abstract entity repository interface.
 * Handles all CRUD operations for entities in the database.
 * 
 * Implementations should handle:
 * - Entity serialization/deserialization
 * - Relation resolution
 * - ID generation and conversion
 */
export interface EntityRepository {
    /**
     * Fetch a single entity by ID
     */
    fetchEntity<M extends Record<string, any>>(
        collectionPath: string,
        entityId: string | number,
        databaseId?: string
    ): Promise<Entity<M> | undefined>;

    /**
     * Fetch a collection of entities with optional filtering, ordering, and pagination
     */
    fetchCollection<M extends Record<string, any>>(
        collectionPath: string,
        options?: FetchCollectionOptions<M>
    ): Promise<Entity<M>[]>;

    /**
     * Search entities by text
     */
    searchEntities<M extends Record<string, any>>(
        collectionPath: string,
        searchString: string,
        options?: SearchOptions<M>
    ): Promise<Entity<M>[]>;

    /**
     * Count entities in a collection
     */
    countEntities<M extends Record<string, any>>(
        collectionPath: string,
        options?: CountOptions<M>
    ): Promise<number>;

    /**
     * Save an entity (create or update)
     */
    saveEntity<M extends Record<string, any>>(
        collectionPath: string,
        values: Partial<M>,
        entityId?: string | number,
        databaseId?: string
    ): Promise<Entity<M>>;

    /**
     * Delete an entity by ID
     */
    deleteEntity(
        collectionPath: string,
        entityId: string | number,
        databaseId?: string
    ): Promise<void>;

    /**
     * Check if a field value is unique in a collection
     */
    checkUniqueField(
        collectionPath: string,
        fieldName: string,
        value: any,
        excludeEntityId?: string,
        databaseId?: string
    ): Promise<boolean>;

    /**
     * Generate a new entity ID
     */
    generateEntityId(): string;
}

// =============================================================================
// REALTIME INTERFACES
// =============================================================================

/**
 * Configuration for subscribing to a collection
 */
export interface CollectionSubscriptionConfig {
    clientId: string;
    path: string;
    filter?: any;
    orderBy?: string;
    order?: "desc" | "asc";
    limit?: number;
    startAfter?: any;
    databaseId?: string;
    searchString?: string;
}

/**
 * Configuration for subscribing to a single entity
 */
export interface EntitySubscriptionConfig {
    clientId: string;
    path: string;
    entityId: string | number;
}

/**
 * Abstract realtime provider interface.
 * Handles real-time subscriptions and notifications for entity changes.
 */
export interface RealtimeProvider {
    /**
     * Subscribe to collection changes
     */
    subscribeToCollection(
        subscriptionId: string,
        config: CollectionSubscriptionConfig,
        callback?: (entities: Entity[]) => void
    ): void;

    /**
     * Subscribe to single entity changes
     */
    subscribeToEntity(
        subscriptionId: string,
        config: EntitySubscriptionConfig,
        callback?: (entity: Entity | null) => void
    ): void;

    /**
     * Unsubscribe from a subscription
     */
    unsubscribe(subscriptionId: string): void;

    /**
     * Notify all relevant subscribers of an entity update
     */
    notifyEntityUpdate(
        path: string,
        entityId: string,
        entity: Entity | null,
        databaseId?: string
    ): Promise<void>;
}

// =============================================================================
// COLLECTION REGISTRY INTERFACES
// =============================================================================

/**
 * Abstract collection registry interface.
 * Manages registration and lookup of entity collections.
 */
export interface CollectionRegistryInterface {
    /**
     * Register a collection
     */
    register(collection: EntityCollection): void;

    /**
     * Get a collection by its path
     */
    getCollectionByPath(path: string): EntityCollection | undefined;

    /**
     * Get all registered collections
     */
    getCollections(): EntityCollection[];
}

// =============================================================================
// DATA TRANSFORMER INTERFACES
// =============================================================================

/**
 * Abstract data transformer interface.
 * Handles serialization/deserialization between frontend and database formats.
 */
export interface DataTransformer {
    /**
     * Transform entity data for storage in the database
     */
    serializeToDatabase<M extends Record<string, any>>(
        entity: M,
        collection: EntityCollection
    ): Record<string, any>;

    /**
     * Transform database data back to entity format
     */
    deserializeFromDatabase<M extends Record<string, any>>(
        data: Record<string, any>,
        collection: EntityCollection
    ): Promise<M>;
}

// =============================================================================
// BACKEND FACTORY INTERFACES
// =============================================================================

/**
 * Configuration for creating a database backend
 */
export interface BackendConfig {
    /**
     * Type of database backend
     */
    type: string;

    /**
     * Database connection (implementation-specific)
     */
    connection: any;

    /**
     * Schema definition (implementation-specific, e.g., Drizzle schema for PostgreSQL)
     */
    schema?: any;
}

/**
 * A complete backend instance with all required services
 */
export interface BackendInstance {
    /**
     * Entity repository for CRUD operations
     */
    entityRepository: EntityRepository;

    /**
     * Realtime provider for subscriptions
     */
    realtimeProvider: RealtimeProvider;

    /**
     * Collection registry
     */
    collectionRegistry: CollectionRegistryInterface;

    /**
     * The underlying database connection
     */
    connection: DatabaseConnection;
}

/**
 * Factory function type for creating backend instances
 */
export type BackendFactory<TConfig extends BackendConfig = BackendConfig> =
    (config: TConfig) => BackendInstance;
