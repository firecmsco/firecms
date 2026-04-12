import { Entity, EntityCollection, FilterValues, WhereFilterOp } from "./index";

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
     * Close the database connection and release resources.
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
    value: unknown;
}

/**
 * Options for fetching a collection of entities
 */
export interface FetchCollectionOptions<M extends Record<string, any> = any> {
    filter?: FilterValues<Extract<keyof M, string>>;
    orderBy?: string;
    order?: "desc" | "asc";
    limit?: number;
    startAfter?: unknown;
    searchString?: string;
    databaseId?: string;
    collection?: EntityCollection;
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
    collection?: EntityCollection;
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
 * Implementations translate Rebase filter conditions to database-specific queries.
 * 
 * Note: This interface can be implemented as instance methods or as a class with static methods.
 * For static implementations (like DrizzleConditionBuilder), use the ConditionBuilderStatic type.
 * 
 * @template T The type of condition returned by the builder (e.g., SQL for PostgreSQL, Filter<Document> for MongoDB)
 */
export interface ConditionBuilder<T = any> {
    /**
     * Build filter conditions from Rebase FilterValues
     */
    buildFilterConditions<M extends Record<string, any>>(
        filter: FilterValues<Extract<keyof M, string>>,
        collectionPath: string,
        ...args: unknown[]
    ): T[];

    /**
     * Build search conditions for text search
     */
    buildSearchConditions(
        searchString: string,
        properties: Record<string, unknown>,
        ...args: unknown[]
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
        ...args: unknown[]
    ): T[];
    buildSearchConditions(
        searchString: string,
        properties: Record<string, unknown>,
        ...args: unknown[]
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
        value: unknown,
        excludeEntityId?: string,
        databaseId?: string
    ): Promise<boolean>;

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
    filter?: unknown;
    orderBy?: string;
    order?: "desc" | "asc";
    limit?: number;
    startAfter?: unknown;
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
// DATABASE ADMIN — CAPABILITY-SPECIFIC INTERFACES (1.3)
// =============================================================================

/**
 * Administrative operations for SQL-based databases (PostgreSQL, MySQL, etc.).
 * Used by the SQL Editor, RLS Editor, and schema browser.
 *
 * @group Admin
 */
export interface SQLAdmin {
    /**
     * Execute raw SQL against the database.
     */
    executeSql(sql: string, options?: { database?: string; role?: string }): Promise<Record<string, unknown>[]>;

    /**
     * Fetch the available databases on the server.
     */
    fetchAvailableDatabases?(): Promise<string[]>;

    /**
     * Fetch the available database roles.
     */
    fetchAvailableRoles?(): Promise<string[]>;

    /**
     * Fetch the current database name.
     */
    fetchCurrentDatabase?(): Promise<string | undefined>;
}

/**
 * Administrative operations for document-based databases (MongoDB, Firestore, etc.).
 * Used by future document administration tools.
 *
 * @group Admin
 */
export interface DocumentAdmin {
    /**
     * Execute an aggregation pipeline or equivalent query.
     */
    executeAggregate?(pipeline: Record<string, unknown>[]): Promise<Record<string, unknown>[]>;

    /**
     * Fetch statistics for a collection (document count, size, etc.).
     */
    fetchCollectionStats?(collectionName: string): Promise<{ count: number; sizeBytes?: number }>;
}

/**
 * Administrative operations for schema management.
 * Shared across SQL and document databases.
 *
 * @group Admin
 */
export interface SchemaAdmin {
    /**
     * Fetch database tables/collections not yet mapped to a Rebase collection.
     */
    fetchUnmappedTables?(mappedPaths?: string[]): Promise<string[]>;

    /**
     * Fetch column/field metadata for a single table/collection.
     * The return type is generic — SQL backends return TableMetadata,
     * document backends may return a different shape.
     */
    fetchTableMetadata?(tableName: string): Promise<unknown>;
}

/**
 * Union type for all admin capabilities.
 * A backend may implement any combination of these interfaces.
 *
 * Use type guards (`isSQLAdmin`, `isDocumentAdmin`, `isSchemaAdmin`)
 * to safely narrow the type before calling methods.
 *
 * @group Admin
 */
export type DatabaseAdmin = Partial<SQLAdmin> & Partial<DocumentAdmin> & Partial<SchemaAdmin>;

/**
 * Type guard: does this admin support SQL operations?
 * @group Admin
 */
export function isSQLAdmin(admin: DatabaseAdmin | undefined): admin is SQLAdmin {
    return !!admin && typeof (admin as SQLAdmin).executeSql === "function";
}

/**
 * Type guard: does this admin support document operations?
 * @group Admin
 */
export function isDocumentAdmin(admin: DatabaseAdmin | undefined): admin is DocumentAdmin {
    return !!admin && (
        typeof (admin as DocumentAdmin).executeAggregate === "function" ||
        typeof (admin as DocumentAdmin).fetchCollectionStats === "function"
    );
}

/**
 * Type guard: does this admin support schema management?
 * @group Admin
 */
export function isSchemaAdmin(admin: DatabaseAdmin | undefined): admin is SchemaAdmin {
    return !!admin && (
        typeof (admin as SchemaAdmin).fetchUnmappedTables === "function" ||
        typeof (admin as SchemaAdmin).fetchTableMetadata === "function"
    );
}

// =============================================================================
// LIFECYCLE INTERFACES (1.4)
// =============================================================================

/**
 * Health check result returned by `healthCheck()`.
 * @group Lifecycle
 */
export interface HealthCheckResult {
    /** Whether the backend is healthy and able to serve requests. */
    healthy: boolean;
    /** Round-trip latency to the database in milliseconds. */
    latencyMs: number;
    /** Optional details (e.g., pool stats, replication lag). */
    details?: Record<string, unknown>;
}

/**
 * Lifecycle contract for backend components that hold resources
 * (database connections, WebSocket pools, timers, etc.).
 *
 * All methods are optional — simple backends (e.g., in-memory) can skip them.
 * @group Lifecycle
 */
export interface BackendLifecycle {
    /**
     * Initialize the backend: open connections, run migrations, seed data.
     * Called once during startup. Idempotent.
     */
    initialize?(): Promise<void>;

    /**
     * Check whether the backend is healthy and reachable.
     * Should be fast (< 1 s) and safe to call frequently.
     */
    healthCheck?(): Promise<HealthCheckResult>;

    /**
     * Gracefully shut down: close connections, flush buffers, cancel timers.
     * After calling `destroy()`, no other methods should be called.
     */
    destroy?(): Promise<void>;
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
    connection: unknown;

    /**
     * Schema definition (implementation-specific, e.g., Drizzle schema for PostgreSQL)
     */
    schema?: unknown;
}

/**
 * A complete backend instance with all required services.
 *
 * Now includes optional lifecycle management and admin capabilities.
 */
export interface BackendInstance extends BackendLifecycle {
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

    /**
     * Administrative operations (SQL, schema, documents).
     * What's available depends on the backend type — use type guards
     * (`isSQLAdmin`, `isSchemaAdmin`, etc.) to narrow.
     */
    admin?: DatabaseAdmin;
}

/**
 * Factory function type for creating backend instances
 */
export type BackendFactory<TConfig extends BackendConfig = BackendConfig> =
    (config: TConfig) => BackendInstance;

// =============================================================================
// BACKEND BOOTSTRAPPER (1.2)
// =============================================================================

/**
 * A `BackendBootstrapper` encapsulates all driver-specific initialization logic.
 *
 * Instead of hard-coding Postgres setup into `initializeRebaseBackend()`,
 * each database backend provides its own bootstrapper that knows how to:
 * - Create the DataDriver from a config object
 * - Optionally initialize auth tables
 * - Optionally create a realtime service
 * - Mount driver-specific API routes
 *
 * The main `initializeRebaseBackend()` becomes a **coordinator** that iterates
 * registered bootstrappers, calls their hooks, and wires the results together.
 *
 * @group Backend
 *
 * @example
 * ```typescript
 * // Third-party MySQL bootstrapper
 * const mysqlBootstrapper: BackendBootstrapper = {
 *   type: "mysql",
 *   initializeDriver: async (config) => new MySQLDataDriver(config.connection),
 *   initializeRealtime: async (config) => new MySQLChangeStreamRealtime(config.connection),
 * };
 * 
 * initializeRebaseBackend({
 *   ...config,
 *   bootstrappers: [postgresBootstrapper, mysqlBootstrapper]
 * });
 * ```
 */
export interface BackendBootstrapper {
    /**
     * Which driver type this bootstrapper handles.
     * Must match the `type` field on the driver config object
     * (e.g., `"postgres"`, `"mongodb"`, `"mysql"`).
     */
    type: string;

    /**
     * Create a DataDriver from the given config.
     * This is the only **required** method.
     */
    initializeDriver(config: unknown): Promise<InitializedDriver>;

    /**
     * Initialize auth tables / services if this driver supports them.
     * Return undefined if auth is not supported by this backend.
     */
    initializeAuth?(config: unknown, driverResult: InitializedDriver): Promise<BootstrappedAuth | undefined>;

    /**
     * Create a realtime provider for this driver.
     * Return undefined if the driver does not support realtime.
     */
    initializeRealtime?(config: unknown, driverResult: InitializedDriver): Promise<RealtimeProvider | undefined>;

    /**
     * Mount any driver-specific HTTP routes (e.g., custom admin endpoints).
     * Called after all drivers are initialized.
     */
    mountRoutes?(app: unknown, basePath: string, driverResult: InitializedDriver): void;

    /**
     * Return admin capabilities for this driver.
     */
    getAdmin?(driverResult: InitializedDriver): DatabaseAdmin | undefined;
}

/**
 * Result of `BackendBootstrapper.initializeDriver()`.
 * @group Backend
 */
export interface InitializedDriver {
    /** The DataDriver instance, ready for use. */
    driver: import("../controllers/data_driver").DataDriver;

    /** The realtime service, if the driver created one during init. */
    realtimeProvider?: RealtimeProvider;

    /** A collection registry to register schema / tables into. */
    collectionRegistry?: CollectionRegistryInterface;

    /** The underlying database connection (for lifecycle management). */
    connection?: DatabaseConnection;

    /**
     * Opaque handle that the bootstrapper can use in subsequent hooks
     * (e.g., `initializeAuth`, `mountRoutes`) to access driver internals.
     * Not used by the coordinator.
     */
    internals?: unknown;
}

/**
 * Result of `BackendBootstrapper.initializeAuth()`.
 * @group Backend
 */
export interface BootstrappedAuth {
    /** User management service. */
    userService: unknown;
    /** Role management service. */
    roleService: unknown;
    /** Email service (optional). */
    emailService?: unknown;
}
