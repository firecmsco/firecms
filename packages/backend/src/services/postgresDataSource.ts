// import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { EntityService } from "../db/entityService";
import { RealtimeService } from "./realtimeService";
import { DatabasePoolManager } from "./databasePoolManager";
import { DrizzleClient } from "../db/interfaces";
import { User } from "@firecms/types";
import { sql as drizzleSql } from "drizzle-orm";
import { buildPropertyCallbacks, mergeDeep } from "@firecms/common";
import { collectionRegistry } from "../collections/registry";
import {
    DataSource,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    ListenCollectionProps,
    ListenEntityProps,
    SaveEntityProps
} from "@firecms/types";

export class PostgresDataSource implements DataSource {
    key = "postgres";
    initialised = true;

    private entityService: EntityService;
    private realtimeService: RealtimeService;
    private user?: User;

    /**
     * When true, realtime notifications are deferred until after the
     * wrapping transaction commits.  Set by `withAuth` → `wrapMethod`.
     */
    _deferNotifications = false;
    _pendingNotifications: Array<{
        path: string;
        entityId: string;
        entity: Entity | null;
        databaseId?: string;
    }> = [];

    constructor(
        private db: DrizzleClient,
        realtimeService: RealtimeService,
        user?: User,
        private poolManager?: DatabasePoolManager
    ) {
        this.entityService = new EntityService(db);
        this.realtimeService = realtimeService;
        this.user = user;
    }

    /**
     * Set a date to midnight (start of day) in UTC
     */
    setDateToMidnight(input?: any): any {
        if (!input) return null;
        const date = input instanceof Date ? input : new Date(input);
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }

    private resolveCollectionCallbacks<M extends Record<string, any>>(collection: EntityCollection<M> | undefined, path: string) {
        if (!collection && !path) return { collection: undefined, callbacks: undefined, propertyCallbacks: undefined };
        const registryCollection = collectionRegistry.getCollectionByPath(path);
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
            startAfter,
            databaseId: collection?.databaseId,
            searchString
        });

        const { collection: resolvedCollection, callbacks, propertyCallbacks } = this.resolveCollectionCallbacks(collection, path);

        if (callbacks?.afterRead || propertyCallbacks?.afterRead) {
            const contextForCallback = {
                user: this.user
            } as any; // Backend context
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

        console.log("🔄 [DataSource] Setting up collection subscription:", subscriptionId);
        console.log("🔄 [DataSource] Collection path:", path);

        // Create a wrapper callback that logs and calls the original callback
        const callbackWrapper = (entities: Entity<M>[]) => {
            console.log("🔄 [DataSource] Received collection update for path:", path);
            console.log("🔄 [DataSource] Updated entities count:", entities.length);
            console.log("🔄 [DataSource] Updated entity IDs:", entities.map(e => e.id));
            console.log("🔄 [DataSource] Calling onUpdate callback...");
            onUpdate(entities);
            console.log("🔄 [DataSource] onUpdate callback completed");
        };

        // Store the subscription in RealtimeService properly using the new public method
        this.realtimeService.registerDataSourceSubscription(subscriptionId, {
            clientId: "datasource",
            type: "collection" as const,
            path,
            collectionRequest: {
                filter,
                orderBy,
                order,
                limit,
                startAfter,
                databaseId: collection?.databaseId,
                searchString
            }
        });

        // Store the callback for this subscription
        this.realtimeService.addSubscriptionCallback(subscriptionId, callbackWrapper);

        console.log("🔄 [DataSource] Subscription registered with RealtimeService");
        console.log("🔄 [DataSource] Total subscriptions:", this.realtimeService.subscriptions.size);

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
            console.log("🔄 [DataSource] Initial data fetched for subscription:", subscriptionId);
            console.log("🔄 [DataSource] Initial entities count:", entities.length);
            callbackWrapper(entities);
        }).catch(error => {
            console.error("🔄 [DataSource] Error fetching initial data:", error);
            if (onError) onError(error);
        });

        console.log("🔄 [DataSource] Collection subscription setup complete:", subscriptionId);

        return () => {
            console.log("🔄 [DataSource] Unsubscribing from collection:", subscriptionId);
            this.realtimeService.removeSubscriptionCallback(subscriptionId);
            this.realtimeService.subscriptions.delete(subscriptionId);
            console.log("🔄 [DataSource] Unsubscription complete");
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
                user: this.user
            } as any; // Backend context
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
        console.log("🔄 [DataSource] Setting up ENTITY subscription:", subscriptionId);

        // Create a wrapper callback that logs and calls the original callback
        const callbackWrapper = (entity: Entity<M> | null) => {
            console.log("🔄 [DataSource] Received entity update for path:", path, "ID:", entityId);
            if (entity)
                onUpdate(entity);
        };

        // Register the subscription with the RealtimeService
        this.realtimeService.registerDataSourceSubscription(subscriptionId, {
            clientId: "datasource",
            type: "entity" as const,
            path,
            entityId
        });

        // Store the callback for this subscription
        this.realtimeService.addSubscriptionCallback(subscriptionId, callbackWrapper);

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
            console.log("🔄 [DataSource] Unsubscribing from entity:", subscriptionId);
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
            user: this.user
        } as any;

        if (callbacks?.beforeSave || propertyCallbacks?.beforeSave) {
            let previousValues: Partial<Entity<M>["values"]> | undefined;
            if (status === "existing" && entityId) {
                const existing = await this.entityService.fetchEntity<M>(path, entityId, resolvedCollection?.databaseId);
                if (existing) {
                    previousValues = existing.values as Partial<Entity<M>["values"]>;
                }
            }

            if (callbacks?.beforeSave) {
                const result = await callbacks.beforeSave({
                    collection: resolvedCollection as EntityCollection<M>,
                    path,
                    entityId,
                    values: updatedValues,
                    previousValues,
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
                    previousValues,
                    status,
                    context: contextForCallback
                });
                if (result) updatedValues = mergeDeep(updatedValues, result);
            }

            console.log("💾 [DataSource] updatedValues after beforeSave callback:", updatedValues);
        } else {
            console.warn("⚠️ [DataSource] No beforeSave callback found for collection", path);
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
                let previousValues: Partial<Entity<M>["values"]> | undefined = undefined;
                if (callbacks?.afterSave) {
                    await callbacks.afterSave({
                        collection: resolvedCollection as EntityCollection<M>,
                        path,
                        entityId: savedEntity.id,
                        values: updatedValues,
                        previousValues,
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
                        previousValues,
                        status,
                        context: contextForCallback
                    });
                }
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

        console.log("🗑️ [DataSource] Starting delete for entity:", entity.id, "in path:", entity.path);

        // Resolve from backend registry to restore callbacks lost during WebSocket serialization
        const { collection: resolvedCollection, callbacks, propertyCallbacks } = this.resolveCollectionCallbacks(collection, entity.path);

        const contextForCallback = {
            user: this.user
        } as any;

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

        console.log("🗑️ [DataSource] Entity deleted from database, now notifying real-time subscribers");

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

        console.log("🗑️ [DataSource] Real-time notification sent for deletion");
    }

    async checkUniqueField(
        path: string,
        name: string,
        value: any,
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
        console.log(`[DataSource] executeSql CALLED: options=`, options, `sql=`, sqlText.substring(0, 50));
        if (!options?.database && !options?.role) {
            return this.entityService.executeSql(sqlText);
        }

        const targetDb = this.getTargetDb(options?.database);

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
    }

    async fetchAvailableDatabases(): Promise<string[]> {
        const result = await this.executeSql(`SELECT datname FROM pg_database WHERE datistemplate = false;`);
        return result.map((r: any) => r.datname as string);
    }

    async fetchAvailableRoles(): Promise<string[]> {
        const result = await this.executeSql(`SELECT rolname FROM pg_roles;`);
        return result.map((r: any) => r.rolname as string);
    }

    async fetchCurrentDatabase(): Promise<string | undefined> {
        return this.poolManager?.defaultDatabaseName;
    }

    private generateSubscriptionId(): string {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create a new delegate instance with authenticated context.
     * Starts a transaction and sets the current_user_id and current_user_roles
     * configuration parameters for PostgreSQL Row Level Security.
     */
    async withAuth(user: User): Promise<PostgresDataSource> {
        // We need to return a proxy that wraps every method in a transaction
        // But since we can't easily start a transaction and keep it open for multiple calls without a callback,
        // we'll implement a different approach:
        // We returns a new delegate where every operation will start its own transaction,
        // set the config, and then perform the operation.
        // Ideally, if Drizzle supported session variables on connection, we'd use that.
        // Since we are using a pool, we MUST use a transaction to guarantee the SET LOCAL applies to the query.

        const authenticatedDelegate = Object.create(this);
        const originalDb = this.db;

        // We can't directly "return" a delegate that shares a single transaction for *future* calls
        // because typical usage is: get delegate -> await fetch -> await save.
        // Each await releases the event loop.
        // So we have to wrap each method.

        const wrapMethod = (methodName: keyof PostgresDataSource) => {
            const originalMethod = this[methodName] as Function;
            return async (...args: any[]) => {
                // Collect deferred notifications so we can flush them after the
                // transaction commits.  This is critical: notifyEntityUpdate
                // refetches from a *separate* connection and therefore cannot see
                // uncommitted writes inside the transaction.
                const pendingNotifications: PostgresDataSource["_pendingNotifications"] = [];

                // @ts-ignore
                const result = await originalDb.transaction(async (tx) => {
                    // Defensive checks for user properties
                    let userId = user.uid;
                    if (!userId) {
                        console.warn(`[DataSource] User ID (uid) is missing for authenticated delegate. Using 'anonymous'. User object:`, user);
                        userId = 'anonymous';
                    }

                    let userRoles = user.roles ?? [];
                    if (!user.roles) {
                        console.warn(`[DataSource] User roles are missing for authenticated delegate. Using empty array. User object:`, user);
                    }
                    const rolesString = userRoles.map((r: any) => typeof r === "string" ? r : r.id).join(",");

                    // Set the user context for RLS (read by auth.uid(), auth.roles(), auth.jwt())
                    await tx.execute(drizzleSql`SELECT set_config('app.user_id', ${userId}, true)`);
                    await tx.execute(drizzleSql`SELECT set_config('app.user_roles', ${rolesString}, true)`);
                    await tx.execute(drizzleSql`SELECT set_config('app.jwt', ${JSON.stringify({ sub: userId, roles: userRoles.map((r: any) => typeof r === "string" ? r : r.id) })}, true)`);

                    // Create a temporary delegate using the transaction client
                    const txEntityService = new EntityService(tx);

                    const txDelegate = new PostgresDataSource(tx, this.realtimeService, user, this.poolManager);
                    // Force inject the transactional entity service
                    // @ts-ignore
                    txDelegate.entityService = txEntityService;
                    // Defer realtime notifications — they'll be flushed post-commit
                    txDelegate._deferNotifications = true;
                    txDelegate._pendingNotifications = pendingNotifications;

                    return await originalMethod.apply(txDelegate, args);
                });

                // Transaction committed — now flush deferred realtime notifications
                // so subscribers refetch data that includes the committed changes.
                for (const notification of pendingNotifications) {
                    try {
                        await this.realtimeService.notifyEntityUpdate(
                            notification.path,
                            notification.entityId,
                            notification.entity,
                            notification.databaseId
                        );
                    } catch (e) {
                        console.error("[DataSource] Error flushing deferred notification:", e);
                    }
                }

                return result;
            };
        };

        // Wrap the methods that perform DB operations
        authenticatedDelegate.fetchCollection = wrapMethod("fetchCollection");
        authenticatedDelegate.fetchEntity = wrapMethod("fetchEntity");
        authenticatedDelegate.saveEntity = wrapMethod("saveEntity");
        authenticatedDelegate.deleteEntity = wrapMethod("deleteEntity");
        authenticatedDelegate.checkUniqueField = wrapMethod("checkUniqueField");
        authenticatedDelegate.countEntities = wrapMethod("countEntities");

        // These bypass the RLS transaction — they use the pool manager directly
        // or query cluster-wide catalogs where RLS doesn't apply.
        authenticatedDelegate.executeSql = this.executeSql.bind(this);
        authenticatedDelegate.fetchAvailableDatabases = this.fetchAvailableDatabases.bind(this);
        authenticatedDelegate.fetchCurrentDatabase = this.fetchCurrentDatabase.bind(this);
        authenticatedDelegate.fetchAvailableRoles = this.fetchAvailableRoles.bind(this);

        // Listen methods use websockets/realtime service which handles auth differently (via connection params usually),
        // OR we might need to think about how listen works with RLS.
        // For now, let's assume Listen is handled separately or doesn't need this transaction wrap
        // because it establishes a long-lived connection where we might set config once?
        // Actually, RealtimeService logic generates queries too?
        // If RealtimeService uses `db` to fetch updates, it needs RLS too.
        // But RealtimeService is a singleton.
        // Only the initial fetch in `listenCollection` uses `fetchCollection`.
        // So wrapping `fetchCollection` covers the initial data.
        // Subsequent updates come from `notifyEntityUpdate`.

        return authenticatedDelegate;
    }
}
