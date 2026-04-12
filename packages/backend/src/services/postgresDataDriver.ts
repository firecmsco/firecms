// import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { EntityService } from "../db/entityService";
import { RealtimeService } from "./realtimeService";
import { DatabasePoolManager } from "./databasePoolManager";
import { DrizzleClient } from "../db/interfaces";
import { User } from "@rebasepro/types";
import { sql as drizzleSql } from "drizzle-orm";
import { buildPropertyCallbacks } from "@rebasepro/common";
import { BackendCollectionRegistry } from "../collections/BackendCollectionRegistry";
import {
    DataDriver,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    ListenCollectionProps,
    ListenEntityProps,
    RebaseCallContext,
    SaveEntityProps,
    RebaseData,
    TableMetadata,
    TableColumnInfo,
    TableForeignKeyInfo,
    TableJunctionInfo,
    TablePolicyInfo,
    SQLAdmin,
    SchemaAdmin,
    DatabaseAdmin
} from "@rebasepro/types";
import { buildRebaseData } from "@rebasepro/common";
import { HistoryService } from "../history/HistoryService";
import { mergeDeep } from "@rebasepro/utils";

export class PostgresDataDriver implements DataDriver {
    key = "postgres";
    initialised = true;

    public entityService: EntityService;
    public realtimeService: RealtimeService;
    public historyService?: HistoryService;
    public user?: User;
    public data: RebaseData;

    /**
     * When true, realtime notifications are deferred until after the
     * wrapping transaction commits.  Set by `withAuth` → `withTransaction`.
     */
    _deferNotifications = false;
    _pendingNotifications: Array<{
        path: string;
        entityId: string;
        entity: Entity | null;
        databaseId?: string;
    }> = [];

    constructor(
        public db: DrizzleClient,
        realtimeService: RealtimeService,
        public readonly registry: BackendCollectionRegistry,
        user?: User,
        public poolManager?: DatabasePoolManager,
        historyService?: HistoryService
    ) {
        this.entityService = new EntityService(db, registry);
        this.realtimeService = realtimeService;
        this.historyService = historyService;
        this.user = user;
        this.data = buildRebaseData(this);

        // Expose SQL + schema admin capabilities via the new typed `admin` property.
        // The individual methods on `this` are kept for backwards compatibility.
        this.admin = {
            executeSql: this.executeSql.bind(this),
            fetchAvailableDatabases: this.fetchAvailableDatabases.bind(this),
            fetchAvailableRoles: this.fetchAvailableRoles.bind(this),
            fetchCurrentDatabase: this.fetchCurrentDatabase.bind(this),
            fetchUnmappedTables: this.fetchUnmappedTables.bind(this),
            fetchTableMetadata: this.fetchTableMetadata.bind(this),
        } satisfies SQLAdmin & SchemaAdmin;
    }

    /**
     * Typed admin capabilities (SQLAdmin + SchemaAdmin).
     */
    admin: DatabaseAdmin;



    private resolveCollectionCallbacks<M extends Record<string, any>>(collection: EntityCollection<M> | undefined, path: string) {
        if (!collection && !path) return { collection: undefined, callbacks: undefined, propertyCallbacks: undefined };
        const registryCollection = this.registry.getCollectionByPath(path);
        const resolvedCollection = registryCollection
            ? { ...collection, ...registryCollection } as EntityCollection<M>
            : collection as EntityCollection<M>;

        const callbacks = resolvedCollection?.callbacks;
        const properties = resolvedCollection?.properties;
        let propertyCallbacks;
        if (properties) {
            propertyCallbacks = buildPropertyCallbacks(properties);
        }
        return {
            collection: resolvedCollection,
            callbacks,
            propertyCallbacks
        };
    }

    async fetchCollection<M extends Record<string, any>>({
        path,
        collection,
        filter,
        limit,
        startAfter,
        orderBy,
        searchString,
        order
    }: FetchCollectionProps<M>): Promise<Entity<M>[]> {

        const entities = await this.entityService.fetchCollection<M>(path, {
            filter,
            orderBy,
            order,
            limit,
            startAfter: startAfter as Record<string, unknown> | undefined,
            databaseId: collection?.databaseId,
            searchString
        });

        const { collection: resolvedCollection, callbacks, propertyCallbacks } = this.resolveCollectionCallbacks(collection, path);

        if (callbacks?.afterRead || propertyCallbacks?.afterRead) {
            const contextForCallback = {
                user: this.user,
                driver: this,
                data: this.data
            } as unknown as RebaseCallContext; // Backend context
            return Promise.all(entities.map(async (entity) => {
                let fetched = entity;
                if (callbacks?.afterRead) {
                    fetched = await callbacks.afterRead({
                        collection: resolvedCollection as EntityCollection<M>,
                        path,
                        entity: fetched,
                        context: contextForCallback
                    }) ?? fetched;
                }
                if (propertyCallbacks?.afterRead) {
                    fetched = await propertyCallbacks.afterRead({
                        collection: resolvedCollection as EntityCollection<M>,
                        path,
                        entity: fetched,
                        context: contextForCallback
                    }) ?? fetched;
                }
                return fetched;
            }));
        }

        return entities;
    }

    listenCollection<M extends Record<string, any>>({
        path,
        collection,
        filter,
        limit,
        startAfter,
        orderBy,
        searchString,
        order,
        onUpdate,
        onError
    }: ListenCollectionProps<M>): () => void {

        const subscriptionId = this.generateSubscriptionId();

        // Type-adapter wrapper: RealtimeService expects a union callback signature
        const callbackWrapper = (entities: Entity<M>[]) => {
            onUpdate(entities);
        };

        // Store the subscription in RealtimeService properly using the new public method
        this.realtimeService.registerDataDriverSubscription(subscriptionId, {
            clientId: "driver",
            type: "collection" as const,
            path,
            collectionRequest: {
                filter,
                orderBy,
                order,
                limit,
                startAfter: startAfter as Record<string, unknown> | undefined,
                databaseId: collection?.databaseId,
                searchString
            }
        });

        // Store the callback for this subscription
        this.realtimeService.addSubscriptionCallback(subscriptionId, callbackWrapper as (data: Entity | Entity[] | null) => void);

        // Send initial data immediately
        this.fetchCollection({
            path: path,
            collection,
            filter,
            limit,
            startAfter,
            orderBy,
            searchString,
            order
        }).then(entities => {
            callbackWrapper(entities);
        }).catch(error => {
            if (onError) onError(error);
        });

        return () => {
            this.realtimeService.removeSubscriptionCallback(subscriptionId);
            this.realtimeService.subscriptions.delete(subscriptionId);
        };
    }

    async fetchEntity<M extends Record<string, any>>({
        path,
        entityId,
        databaseId,
        collection
    }: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
        let entity = await this.entityService.fetchEntity<M>(
            path,
            entityId,
            databaseId || collection?.databaseId
        );

        const { collection: resolvedCollection, callbacks, propertyCallbacks } = this.resolveCollectionCallbacks(collection, path);

        if (entity && (callbacks?.afterRead || propertyCallbacks?.afterRead)) {
            const contextForCallback = {
                user: this.user,
                driver: this,
                data: this.data
            } as unknown as RebaseCallContext; // Backend context
            if (callbacks?.afterRead) {
                entity = await callbacks.afterRead({
                    collection: resolvedCollection as EntityCollection<M>,
                    path,
                    entity,
                    context: contextForCallback
                }) ?? entity;
            }
            if (propertyCallbacks?.afterRead) {
                entity = await propertyCallbacks.afterRead({
                    collection: resolvedCollection as EntityCollection<M>,
                    path,
                    entity,
                    context: contextForCallback
                }) ?? entity;
            }
        }

        return entity;
    }

    listenEntity<M extends Record<string, any>>({
        path,
        entityId,
        collection,
        onUpdate,
        onError
    }: ListenEntityProps<M>): () => void {

        const subscriptionId = this.generateSubscriptionId();
        const callbackWrapper = (entity: Entity<M> | null) => {
            if (entity)
                onUpdate(entity);
        };

        // Register the subscription with the RealtimeService
        this.realtimeService.registerDataDriverSubscription(subscriptionId, {
            clientId: "driver",
            type: "entity" as const,
            path,
            entityId
        });

        // Store the callback for this subscription
        this.realtimeService.addSubscriptionCallback(subscriptionId, callbackWrapper as (data: Entity | Entity[] | null) => void);

        // Fetch initial data
        this.fetchEntity({
            path,
            entityId,
            collection
        })
            .then(entity => {
                if (entity) onUpdate(entity);
            })
            .catch(error => {
                if (onError) onError(error as Error);
            });

        // Return the unsubscribe function
        return () => {
            this.realtimeService.removeSubscriptionCallback(subscriptionId);
            this.realtimeService.subscriptions.delete(subscriptionId);
        };
    }

    async saveEntity<M extends Record<string, any>>({
        path,
        entityId,
        values,
        collection,
        status
    }: SaveEntityProps<M>): Promise<Entity<M>> {

        const { collection: resolvedCollection, callbacks, propertyCallbacks } = this.resolveCollectionCallbacks(collection, path);

        let updatedValues = values;
        const contextForCallback = {
            user: this.user,
            driver: this,
            data: this.data
        } as unknown as RebaseCallContext;

        // Fetch previous values for callbacks AND history recording
        let previousValuesForHistory: Partial<Entity<M>["values"]> | undefined;
        if (status === "existing" && entityId) {
            const existing = await this.entityService.fetchEntity<M>(path, entityId, resolvedCollection?.databaseId);
            if (existing) {
                previousValuesForHistory = existing.values as Partial<Entity<M>["values"]>;
            }
        }

        if (callbacks?.beforeSave || propertyCallbacks?.beforeSave) {
            if (callbacks?.beforeSave) {
                const result = await callbacks.beforeSave({
                    collection: resolvedCollection as EntityCollection<M>,
                    path,
                    entityId,
                    values: updatedValues,
                    previousValues: previousValuesForHistory,
                    status,
                    context: contextForCallback
                });
                if (result) updatedValues = mergeDeep(updatedValues, result);
            }

            if (propertyCallbacks?.beforeSave) {
                const result = await propertyCallbacks.beforeSave({
                    collection: resolvedCollection as EntityCollection<M>,
                    path,
                    entityId,
                    values: updatedValues,
                    previousValues: previousValuesForHistory,
                    status,
                    context: contextForCallback
                });
                if (result) updatedValues = mergeDeep(updatedValues, result);
            }

        }

        try {
            let savedEntity = await this.entityService.saveEntity<M>(
                path,
                updatedValues,
                entityId,
                resolvedCollection?.databaseId
            );

            if (savedEntity && (callbacks?.afterRead || propertyCallbacks?.afterRead)) {
                if (callbacks?.afterRead) {
                    savedEntity = await callbacks.afterRead({
                        collection: resolvedCollection as EntityCollection<M>,
                        path,
                        entity: savedEntity,
                        context: contextForCallback
                    }) ?? savedEntity;
                }
                if (propertyCallbacks?.afterRead) {
                    savedEntity = await propertyCallbacks.afterRead({
                        collection: resolvedCollection as EntityCollection<M>,
                        path,
                        entity: savedEntity,
                        context: contextForCallback
                    }) ?? savedEntity;
                }
            }

            if (callbacks?.afterSave || propertyCallbacks?.afterSave) {
                if (callbacks?.afterSave) {
                    await callbacks.afterSave({
                        collection: resolvedCollection as EntityCollection<M>,
                        path,
                        entityId: savedEntity.id,
                        values: updatedValues,
                        previousValues: previousValuesForHistory,
                        status,
                        context: contextForCallback
                    });
                }
                if (propertyCallbacks?.afterSave) {
                    await propertyCallbacks.afterSave({
                        collection: resolvedCollection as EntityCollection<M>,
                        path,
                        entityId: savedEntity.id,
                        values: updatedValues,
                        previousValues: previousValuesForHistory,
                        status,
                        context: contextForCallback
                    });
                }
            }

            // Record entity history (fire-and-forget, never blocks the save)
            if (this.historyService && resolvedCollection?.history) {
                this.historyService.recordHistory({
                    tableName: path,
                    entityId: savedEntity.id.toString(),
                    action: status === "new" ? "create" : "update",
                    values: savedEntity.values as Record<string, unknown>,
                    previousValues: previousValuesForHistory as Record<string, unknown> | undefined,
                    updatedBy: this.user?.uid
                });
            }

            // Notify real-time subscribers (deferred if inside a transaction)
            if (this._deferNotifications) {
                this._pendingNotifications.push({
                    path,
                    entityId: savedEntity.id.toString(),
                    entity: savedEntity,
                    databaseId: resolvedCollection?.databaseId
                });
            } else {
                await this.realtimeService.notifyEntityUpdate(
                    path,
                    savedEntity.id.toString(),
                    savedEntity,
                    resolvedCollection?.databaseId
                );
            }

            return savedEntity;
        } catch (error) {
            if (callbacks?.afterSaveError || propertyCallbacks?.afterSaveError) {
                if (callbacks?.afterSaveError) {
                    await callbacks.afterSaveError({
                        collection: resolvedCollection as EntityCollection<M>,
                        path,
                        entityId: entityId || "unknown",
                        values: updatedValues,
                        previousValues: undefined,
                        status,
                        context: contextForCallback
                    });
                }
                if (propertyCallbacks?.afterSaveError) {
                    await propertyCallbacks.afterSaveError({
                        collection: resolvedCollection as EntityCollection<M>,
                        path,
                        entityId: entityId || "unknown",
                        values: updatedValues,
                        previousValues: undefined,
                        status,
                        context: contextForCallback
                    });
                }
            }
            throw error;
        }
    }

    async deleteEntity<M extends Record<string, any>>({
        entity,
        collection
    }: DeleteEntityProps<M>): Promise<void> {

        // Resolve from backend registry to restore callbacks lost during WebSocket serialization
        const { collection: resolvedCollection, callbacks, propertyCallbacks } = this.resolveCollectionCallbacks(collection, entity.path);

        const contextForCallback = {
            user: this.user,
            driver: this,
            data: this.data
        } as unknown as RebaseCallContext;

        if (callbacks?.beforeDelete || propertyCallbacks?.beforeDelete) {
            if (callbacks?.beforeDelete) {
                await callbacks.beforeDelete({
                    collection: resolvedCollection as EntityCollection<M>,
                    path: entity.path,
                    entityId: entity.id,
                    entity,
                    context: contextForCallback
                });
            }
            if (propertyCallbacks?.beforeDelete) {
                await propertyCallbacks.beforeDelete({
                    collection: resolvedCollection as EntityCollection<M>,
                    path: entity.path,
                    entityId: entity.id,
                    entity,
                    context: contextForCallback
                });
            }
        }

        await this.entityService.deleteEntity(
            entity.path,
            entity.id,
            entity.databaseId || resolvedCollection?.databaseId
        );

        if (callbacks?.afterDelete || propertyCallbacks?.afterDelete) {
            if (callbacks?.afterDelete) {
                await callbacks.afterDelete({
                    collection: resolvedCollection as EntityCollection<M>,
                    path: entity.path,
                    entityId: entity.id,
                    entity,
                    context: contextForCallback
                });
            }
            if (propertyCallbacks?.afterDelete) {
                await propertyCallbacks.afterDelete({
                    collection: resolvedCollection as EntityCollection<M>,
                    path: entity.path,
                    entityId: entity.id,
                    entity,
                    context: contextForCallback
                });
            }
        }

        // Record delete history (fire-and-forget)
        if (this.historyService && resolvedCollection?.history) {
            this.historyService.recordHistory({
                tableName: entity.path,
                entityId: entity.id.toString(),
                action: "delete",
                values: entity.values as Record<string, unknown>,
                updatedBy: this.user?.uid
            });
        }

        // Notify real-time subscribers (deferred if inside a transaction)
        if (this._deferNotifications) {
            this._pendingNotifications.push({
                path: entity.path,
                entityId: entity.id.toString(),
                entity: null,
                databaseId: entity.databaseId || resolvedCollection?.databaseId
            });
        } else {
            await this.realtimeService.notifyEntityUpdate(
                entity.path,
                entity.id.toString(),
                null,
                entity.databaseId || resolvedCollection?.databaseId
            );
        }

    }

    async checkUniqueField(
        path: string,
        name: string,
        value: unknown,
        entityId?: string,
        collection?: EntityCollection
    ): Promise<boolean> {
        return this.entityService.checkUniqueField(
            path,
            name,
            value,
            entityId,
            collection?.databaseId
        );
    }


    async countEntities<M extends Record<string, any>>({
        path,
        collection,
        filter
    }: FetchCollectionProps<M>): Promise<number> {
        return this.entityService.countEntities(
            path,
            { filter }
        );
    }

    private getTargetDb(databaseName?: string): DrizzleClient {
        if (!databaseName || databaseName === this.poolManager?.defaultDatabaseName) {
            return this.db;
        }
        if (!this.poolManager) {
            throw new Error(
                "Cross-database execution requires adminConnectionString to be configured in the backend."
            );
        }
        return this.poolManager.getDrizzle(databaseName);
    }

    async executeSql(sqlText: string, options?: { database?: string, role?: string }): Promise<Record<string, unknown>[]> {
        if (!options?.database && !options?.role) {
            return this.entityService.executeSql(sqlText);
        }

        const targetDb = this.getTargetDb(options?.database);

        try {
            if (options?.role) {
                const safeRole = options.role.replace(/"/g, '""');
                return await targetDb.transaction(async (tx) => {
                    await tx.execute(drizzleSql.raw(`SET LOCAL ROLE "${safeRole}"`));
                    const result = await tx.execute(drizzleSql.raw(sqlText));
                    return result.rows as Record<string, unknown>[];
                });
            }

            const result = await targetDb.execute(drizzleSql.raw(sqlText));
            return result.rows as Record<string, unknown>[];
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            // Provide a user-friendly message for connection/auth errors
            if (msg.includes("pg_hba.conf") || msg.includes("no encryption") || msg.includes("connection refused")) {
                const dbName = options?.database || "unknown";
                throw new Error(`Cannot connect to database "${dbName}": the server rejected the connection. This database may require SSL or is not accessible from this host.`);
            }
            throw error;
        }
    }

    async fetchAvailableDatabases(): Promise<string[]> {
        // Exclude template databases, Cloud SQL internal databases, and the default 'postgres' system db
        const result = await this.executeSql(
            `SELECT datname FROM pg_database 
             WHERE datistemplate = false 
             AND datname NOT IN ('postgres', 'cloudsqladmin', '_cloudsqladmin')
             ORDER BY datname;`
        );
        const databases = result.map((r: Record<string, unknown>) => r.datname as string);
        // Ensure the current connected database is always first in the list
        const currentDb = this.poolManager?.defaultDatabaseName;
        if (currentDb && !databases.includes(currentDb)) {
            databases.unshift(currentDb);
        } else if (currentDb) {
            // Move it to the front
            const idx = databases.indexOf(currentDb);
            if (idx > 0) {
                databases.splice(idx, 1);
                databases.unshift(currentDb);
            }
        }
        return databases;
    }

    async fetchAvailableRoles(): Promise<string[]> {
        const result = await this.executeSql(`SELECT rolname FROM pg_roles;`);
        return result.map((r: Record<string, unknown>) => r.rolname as string);
    }

    async fetchCurrentDatabase(): Promise<string | undefined> {
        return this.poolManager?.defaultDatabaseName;
    }

    /**
     * Fetch public tables that are not yet mapped to a collection.
     * Excludes internal tables (_rebase_*, _auth_*, auth tables, etc.)
     * and junction/connection tables used for many-to-many relations.
     */
    async fetchUnmappedTables(mappedPaths?: string[]): Promise<string[]> {
        const result = await this.executeSql(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

        const internalPrefixes = ["_rebase_", "_auth_"];
        const internalExact = [
            "users", "roles", "user_roles", "refresh_tokens",
            "password_reset_tokens", "email_verification_tokens"
        ];

        const allTables = result
            .map((r: Record<string, unknown>) => r.table_name as string)
            .filter((name: string) => {
                if (internalPrefixes.some(prefix => name.startsWith(prefix))) return false;
                if (internalExact.includes(name)) return false;
                return true;
            });

        // Detect junction tables: tables where every column is part of a foreign key.
        // These are typically many-to-many connection tables and shouldn't be suggested.
        let junctionTables = new Set<string>();
        try {
            const junctionResult = await this.executeSql(`
                SELECT t.table_name
                FROM information_schema.tables t
                WHERE t.table_schema = 'public'
                  AND t.table_type = 'BASE TABLE'
                  AND NOT EXISTS (
                    -- Find columns that are NOT part of any foreign key
                    SELECT 1
                    FROM information_schema.columns c
                    WHERE c.table_schema = t.table_schema
                      AND c.table_name = t.table_name
                      AND c.column_name NOT IN (
                        SELECT kcu.column_name
                        FROM information_schema.key_column_usage kcu
                        JOIN information_schema.table_constraints tc
                          ON tc.constraint_name = kcu.constraint_name
                          AND tc.table_schema = kcu.table_schema
                        WHERE tc.constraint_type = 'FOREIGN KEY'
                          AND kcu.table_schema = t.table_schema
                          AND kcu.table_name = t.table_name
                      )
                  );
            `);
            junctionTables = new Set(junctionResult.map((r: Record<string, unknown>) => r.table_name as string));
        } catch (e) {
            console.warn("Could not detect junction tables:", e);
        }

        const filteredTables = allTables.filter(name => !junctionTables.has(name));

        if (!mappedPaths || mappedPaths.length === 0) return filteredTables;

        const mappedSet = new Set(mappedPaths.map(p => p.toLowerCase()));
        return filteredTables.filter((name: string) => !mappedSet.has(name.toLowerCase()));
    }

    
    /**
     * Fetch metadata for a given table from information_schema (columns, policies, constraints).
     */
    async fetchTableMetadata(tableName: string): Promise<TableMetadata> {
        // Sanitize table name as defense-in-depth (parameterized below)
        const safeName = tableName.replace(/[^a-zA-Z0-9_]/g, "");

        // 1. Fetch Columns
        const result = await this.db.execute(drizzleSql`
            SELECT column_name, data_type, udt_name, is_nullable, column_default, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = ${safeName}
            ORDER BY ordinal_position
        `);
        const columns = result.rows as Record<string, unknown>[];

        // Also fetch enum values for any USER-DEFINED columns
        const enumColumns = columns.filter((c) => c.data_type === "USER-DEFINED");
        if (enumColumns.length > 0) {
            for (const col of enumColumns) {
                try {
                    const enumResult = await this.db.execute(drizzleSql`
                        SELECT e.enumlabel
                        FROM pg_type t
                        JOIN pg_enum e ON t.oid = e.enumtypid
                        WHERE t.typname = ${col.udt_name as string}
                        ORDER BY e.enumsortorder
                    `);
                    col.enum_values = (enumResult.rows as Record<string, unknown>[]).map(e => e.enumlabel);
                } catch {
                    col.enum_values = [];
                }
            }
        }
        const typedColumns = columns as unknown as TableColumnInfo[];

        // 2. Fetch Foreign Keys
        const fkResult = await this.db.execute(drizzleSql`
            SELECT
                kcu.column_name as column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = ${safeName};
        `);
        const foreignKeys = fkResult.rows as unknown as TableForeignKeyInfo[];

        // 3. Fetch Junction Tables (Many-to-Many)
        // A simple junction table is one that has foreign keys to our table and other tables
        const junctionsResult = await this.db.execute(drizzleSql`
            SELECT 
                tc1.table_name as junction_table_name,
                kcu1.column_name as source_column_name,
                ccu2.table_name as target_table_name,
                kcu2.column_name as target_column_name
            FROM information_schema.table_constraints tc1
            JOIN information_schema.key_column_usage kcu1 ON tc1.constraint_name = kcu1.constraint_name
            JOIN information_schema.constraint_column_usage ccu1 ON ccu1.constraint_name = tc1.constraint_name
            JOIN information_schema.table_constraints tc2 ON tc1.table_name = tc2.table_name AND tc2.constraint_type = 'FOREIGN KEY'
            JOIN information_schema.key_column_usage kcu2 ON tc2.constraint_name = kcu2.constraint_name
            JOIN information_schema.constraint_column_usage ccu2 ON ccu2.constraint_name = tc2.constraint_name
            WHERE tc1.constraint_type = 'FOREIGN KEY' 
              AND ccu1.table_name = ${safeName}
              AND ccu2.table_name != ${safeName};
        `);
        const junctions = junctionsResult.rows as unknown as TableJunctionInfo[];

        // 4. Fetch RLS Policies
        const policiesResult = await this.db.execute(drizzleSql`
            SELECT 
                polname as policy_name, 
                polcmd as cmd, 
                polroles::regrole[]::text[] as roles, 
                pg_get_expr(polqual, polrelid) as qual, 
                pg_get_expr(polwithcheck, polrelid) as with_check
            FROM pg_policy
            WHERE polrelid = (SELECT oid FROM pg_class WHERE relname = ${safeName} AND relnamespace = 'public'::regnamespace);
        `);
        const policies = policiesResult.rows as unknown as TablePolicyInfo[];

        return {
            columns: typedColumns,
            foreignKeys,
            junctions,
            policies
        };
    }

    private generateSubscriptionId(): string {
        return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Create a new delegate instance with authenticated context.
     * Starts a transaction and sets the current_user_id and current_user_roles
     * configuration parameters for PostgreSQL Row Level Security.
     */
    async withAuth(user: User): Promise<DataDriver> {
        return new AuthenticatedPostgresDataDriver(this, user);
    }
}

export class AuthenticatedPostgresDataDriver implements DataDriver {
    key = "postgres";
    initialised = true;

    public user: User;
    public data: RebaseData;

    constructor(
        public delegate: PostgresDataDriver,
        user: User
    ) {
        this.user = user;
        this.data = buildRebaseData(this);

        // Delegate admin ops to the base driver (no RLS wrapping for admin)
        this.admin = delegate.admin;
    }

    /**
     * Typed admin capabilities — delegates to the base driver.
     */
    admin: DatabaseAdmin;

    private async withTransaction<T>(
        operation: (delegate: PostgresDataDriver) => Promise<T>
    ): Promise<T> {
        const pendingNotifications: PostgresDataDriver["_pendingNotifications"] = [];
        
        const result = await this.delegate.db.transaction(async (tx) => {
            let userId = this.user?.uid;
            if (!userId) {
                console.warn(`[DataDriver] User ID (uid) is missing for authenticated delegate. Using 'anonymous'. User object:`, this.user);
                userId = 'anonymous';
            }

            let userRoles = this.user?.roles ?? [];
            if (!this.user?.roles) {
                console.warn(`[DataDriver] User roles are missing for authenticated delegate. Using empty array. User object:`, this.user);
            }
            const normalizedRoles = userRoles.map((r: unknown) =>
                typeof r === "string" ? r : (r as Record<string, unknown>)?.id ?? String(r)
            );
            const rolesString = normalizedRoles.join(",");

            await tx.execute(drizzleSql`
                SELECT 
                    set_config('app.user_id', ${userId}, true),
                    set_config('app.user_roles', ${rolesString}, true),
                    set_config('app.jwt', ${JSON.stringify({ sub: userId, roles: userRoles })}, true)
            `);

            const txEntityService = new EntityService(tx, this.delegate.registry);
            const txDelegate = new PostgresDataDriver(tx, this.delegate.realtimeService, this.delegate.registry, this.user, this.delegate.poolManager, this.delegate.historyService);
            
            txDelegate.entityService = txEntityService;
            txDelegate._deferNotifications = true;
            txDelegate._pendingNotifications = pendingNotifications;

            return await operation(txDelegate);
        });

        for (const notification of pendingNotifications) {
            try {
                await this.delegate.realtimeService.notifyEntityUpdate(
                    notification.path,
                    notification.entityId,
                    notification.entity,
                    notification.databaseId
                );
            } catch (e) {
                console.error("[DataDriver] Error flushing deferred notification:", e);
            }
        }

        return result;
    }

    async fetchCollection<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<Entity<M>[]> {
        return this.withTransaction((delegate) => delegate.fetchCollection(props));
    }

    /**
     * Injects the authenticated user's context into the most recently
     * registered realtime subscription so RLS-aware polling can apply.
     */
    private injectAuthContext(unsubscribe: () => void): () => void {
        const authContext = { userId: this.user?.uid || "anonymous", roles: this.user?.roles ?? [] };
        const entries = Array.from(this.delegate.realtimeService.subscriptions.entries());
        const lastEntry = entries[entries.length - 1];
        if (lastEntry && lastEntry[1].clientId === "driver") {
            lastEntry[1].authContext = authContext;
        }
        return unsubscribe;
    }

    listenCollection<M extends Record<string, any>>(props: ListenCollectionProps<M>): () => void {
        return this.injectAuthContext(this.delegate.listenCollection(props));
    }

    async fetchEntity<M extends Record<string, any>>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
        return this.withTransaction((delegate) => delegate.fetchEntity(props));
    }

    listenEntity<M extends Record<string, any>>(props: ListenEntityProps<M>): () => void {
        return this.injectAuthContext(this.delegate.listenEntity(props));
    }

    async saveEntity<M extends Record<string, any>>(props: SaveEntityProps<M>): Promise<Entity<M>> {
        return this.withTransaction((delegate) => delegate.saveEntity(props));
    }

    async deleteEntity<M extends Record<string, any>>(props: DeleteEntityProps<M>): Promise<void> {
        return this.withTransaction((delegate) => delegate.deleteEntity(props));
    }

    async checkUniqueField(
        path: string,
        name: string,
        value: unknown,
        entityId?: string,
        collection?: EntityCollection
    ): Promise<boolean> {
        return this.withTransaction((delegate) => delegate.checkUniqueField(path, name, value, entityId, collection));
    }

    async countEntities<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<number> {
        return this.withTransaction((delegate) => delegate.countEntities(props));
    }

    /**
     * Intentionally delegates to the base delegate WITHOUT RLS wrapping.
     * executeSql is an admin-only feature; access control should be enforced
     * at the API route level, not via database-level RLS.
     */
    async executeSql(sqlText: string, options?: { database?: string, role?: string }): Promise<Record<string, unknown>[]> {
        return this.delegate.executeSql(sqlText, options);
    }

    async fetchAvailableDatabases(): Promise<string[]> {
        return this.delegate.fetchAvailableDatabases();
    }

    async fetchAvailableRoles(): Promise<string[]> {
        return this.delegate.fetchAvailableRoles();
    }

    async fetchCurrentDatabase(): Promise<string | undefined> {
        return this.delegate.fetchCurrentDatabase();
    }

    async fetchUnmappedTables(mappedPaths?: string[]): Promise<string[]> {
        return this.delegate.fetchUnmappedTables(mappedPaths);
    }

    async fetchTableMetadata(tableName: string) {
        return this.delegate.fetchTableMetadata(tableName);
    }
}
