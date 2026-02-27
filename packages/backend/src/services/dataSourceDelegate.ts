// import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { EntityService } from "../db/entityService";
import { RealtimeService } from "./realtimeService";
import { DrizzleClient } from "../db/interfaces";
import { User } from "@firecms/types";
import { sql } from "drizzle-orm";
import { collectionRegistry } from "../collections/registry";
import {
    DataSourceDelegate,
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    ListenCollectionProps,
    ListenEntityProps,
    SaveEntityProps
} from "@firecms/types";

export class PostgresDataSourceDelegate implements DataSourceDelegate {
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
        user?: User
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

        if (collection?.callbacks?.onFetch) {
            const contextForCallback = {
                user: this.user
            } as any; // Backend context
            return Promise.all(entities.map(async (entity) => {
                const fetched = await collection.callbacks!.onFetch!({
                    collection,
                    path,
                    entity,
                    context: contextForCallback
                });
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

        console.log("🔄 [DataSourceDelegate] Setting up collection subscription:", subscriptionId);
        console.log("🔄 [DataSourceDelegate] Collection path:", path);

        // Create a wrapper callback that logs and calls the original callback
        const callbackWrapper = (entities: Entity<M>[]) => {
            console.log("🔄 [DataSourceDelegate] Received collection update for path:", path);
            console.log("🔄 [DataSourceDelegate] Updated entities count:", entities.length);
            console.log("🔄 [DataSourceDelegate] Updated entity IDs:", entities.map(e => e.id));
            console.log("🔄 [DataSourceDelegate] Calling onUpdate callback...");
            onUpdate(entities);
            console.log("🔄 [DataSourceDelegate] onUpdate callback completed");
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

        console.log("🔄 [DataSourceDelegate] Subscription registered with RealtimeService");
        console.log("🔄 [DataSourceDelegate] Total subscriptions:", this.realtimeService.subscriptions.size);

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
            console.log("🔄 [DataSourceDelegate] Initial data fetched for subscription:", subscriptionId);
            console.log("🔄 [DataSourceDelegate] Initial entities count:", entities.length);
            callbackWrapper(entities);
        }).catch(error => {
            console.error("🔄 [DataSourceDelegate] Error fetching initial data:", error);
            if (onError) onError(error);
        });

        console.log("🔄 [DataSourceDelegate] Collection subscription setup complete:", subscriptionId);

        return () => {
            console.log("🔄 [DataSourceDelegate] Unsubscribing from collection:", subscriptionId);
            this.realtimeService.removeSubscriptionCallback(subscriptionId);
            this.realtimeService.subscriptions.delete(subscriptionId);
            console.log("🔄 [DataSourceDelegate] Unsubscription complete");
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

        if (entity && collection?.callbacks?.onFetch) {
            const contextForCallback = {
                user: this.user
            } as any; // Backend context
            entity = await collection.callbacks.onFetch({
                collection,
                path,
                entity,
                context: contextForCallback
            });
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
        console.log("🔄 [DataSourceDelegate] Setting up ENTITY subscription:", subscriptionId);

        // Create a wrapper callback that logs and calls the original callback
        const callbackWrapper = (entity: Entity<M> | null) => {
            console.log("🔄 [DataSourceDelegate] Received entity update for path:", path, "ID:", entityId);
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
            console.log("🔄 [DataSourceDelegate] Unsubscribing from entity:", subscriptionId);
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

        // Resolve the collection from the backend registry so callbacks (which are
        // functions and can't survive JSON serialization over WebSocket) are available.
        const registryCollection = collectionRegistry.getCollectionByPath(path);
        const resolvedCollection = (registryCollection
            ? { ...collection, ...registryCollection, callbacks: registryCollection.callbacks ?? collection?.callbacks }
            : collection) as EntityCollection<M> | undefined;

        let updatedValues = values;
        const contextForCallback = {
            user: this.user
        } as any;

        if (resolvedCollection?.callbacks?.onPreSave) {
            let previousValues: Partial<Entity<M>["values"]> | undefined;
            if (status === "existing" && entityId) {
                const existing = await this.fetchEntity({ path, entityId, collection: resolvedCollection });
                if (existing) {
                    previousValues = existing.values as Partial<Entity<M>["values"]>;
                }
            }
            updatedValues = await resolvedCollection.callbacks.onPreSave({
                collection: resolvedCollection,
                path,
                entityId,
                values,
                previousValues,
                status,
                context: contextForCallback
            });
        }

        try {
            const savedEntity = await this.entityService.saveEntity<M>(
                path,
                updatedValues,
                entityId,
                resolvedCollection?.databaseId
            );

            if (resolvedCollection?.callbacks?.onSaveSuccess) {
                let previousValues: Partial<Entity<M>["values"]> | undefined = undefined;
                await resolvedCollection.callbacks.onSaveSuccess({
                    collection: resolvedCollection as EntityCollection<M>,
                    path,
                    entityId: savedEntity.id,
                    values: updatedValues,
                    previousValues,
                    status,
                    context: contextForCallback
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
            if (resolvedCollection?.callbacks?.onSaveFailure) {
                await resolvedCollection.callbacks.onSaveFailure({
                    collection: resolvedCollection as EntityCollection<M>,
                    path,
                    entityId: entityId || "unknown",
                    values: updatedValues,
                    previousValues: undefined,
                    status,
                    context: contextForCallback
                });
            }
            throw error;
        }
    }

    async deleteEntity<M extends Record<string, any>>({
        entity,
        collection
    }: DeleteEntityProps<M>): Promise<void> {

        console.log("🗑️ [DataSourceDelegate] Starting delete for entity:", entity.id, "in path:", entity.path);

        // Resolve from backend registry to restore callbacks lost during WebSocket serialization
        const registryCollection = collectionRegistry.getCollectionByPath(entity.path);
        const resolvedCollection = (registryCollection
            ? { ...collection, ...registryCollection, callbacks: registryCollection.callbacks ?? collection?.callbacks }
            : collection) as EntityCollection<M> | undefined;

        const contextForCallback = {
            user: this.user
        } as any;

        if (resolvedCollection?.callbacks?.onPreDelete) {
            await resolvedCollection.callbacks.onPreDelete({
                collection: resolvedCollection as EntityCollection<M>,
                path: entity.path,
                entityId: entity.id,
                entity,
                context: contextForCallback
            });
        }

        await this.entityService.deleteEntity(
            entity.path,
            entity.id,
            entity.databaseId || resolvedCollection?.databaseId
        );

        if (resolvedCollection?.callbacks?.onDelete) {
            await resolvedCollection.callbacks.onDelete({
                collection: resolvedCollection as EntityCollection<M>,
                path: entity.path,
                entityId: entity.id,
                entity,
                context: contextForCallback
            });
        }

        console.log("🗑️ [DataSourceDelegate] Entity deleted from database, now notifying real-time subscribers");

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

        console.log("🗑️ [DataSourceDelegate] Real-time notification sent for deletion");
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

    async executeSql(sql: string): Promise<any[]> {
        return this.entityService.executeSql(sql);
    }

    private generateSubscriptionId(): string {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create a new delegate instance with authenticated context.
     * Starts a transaction and sets the current_user_id and current_user_roles
     * configuration parameters for PostgreSQL Row Level Security.
     */
    async withAuth(user: User): Promise<PostgresDataSourceDelegate> {
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

        const wrapMethod = (methodName: keyof PostgresDataSourceDelegate) => {
            const originalMethod = this[methodName] as Function;
            return async (...args: any[]) => {
                // Collect deferred notifications so we can flush them after the
                // transaction commits.  This is critical: notifyEntityUpdate
                // refetches from a *separate* connection and therefore cannot see
                // uncommitted writes inside the transaction.
                const pendingNotifications: PostgresDataSourceDelegate["_pendingNotifications"] = [];

                // @ts-ignore
                const result = await originalDb.transaction(async (tx) => {
                    // Defensive checks for user properties
                    let userId = user.uid;
                    if (!userId) {
                        console.warn(`[DataSourceDelegate] User ID (uid) is missing for authenticated delegate. Using 'anonymous'. User object:`, user);
                        userId = 'anonymous';
                    }

                    let userRoles = user.roles ?? [];
                    if (!user.roles) {
                        console.warn(`[DataSourceDelegate] User roles are missing for authenticated delegate. Using empty array. User object:`, user);
                    }
                    const rolesString = userRoles.map(r => r.id).join(",");

                    // Set the user context for RLS (read by auth.uid(), auth.roles(), auth.jwt())
                    await tx.execute(sql`SELECT set_config('app.user_id', ${userId}, true)`);
                    await tx.execute(sql`SELECT set_config('app.user_roles', ${rolesString}, true)`);
                    await tx.execute(sql`SELECT set_config('app.jwt', ${JSON.stringify({ sub: userId, roles: userRoles.map(r => r.id) })}, true)`);

                    // Create a temporary delegate using the transaction client
                    const txEntityService = new EntityService(tx);

                    const txDelegate = new PostgresDataSourceDelegate(tx, this.realtimeService, user);
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
                        console.error("[DataSourceDelegate] Error flushing deferred notification:", e);
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
        authenticatedDelegate.executeSql = wrapMethod("executeSql");

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
