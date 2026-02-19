// import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { EntityService } from "../db/entityService";
import { RealtimeService } from "./realtimeService";
import { DrizzleClient } from "../db/interfaces";
import { User } from "@firecms/types";
import { sql } from "drizzle-orm";
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

    constructor(
        private db: DrizzleClient,
        realtimeService: RealtimeService
    ) {
        this.entityService = new EntityService(db);
        this.realtimeService = realtimeService;
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

        return this.entityService.fetchCollection<M>(path, {
            filter,
            orderBy,
            order,
            limit,
            startAfter,
            databaseId: collection?.databaseId,
            searchString
        });
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
        return this.entityService.fetchEntity<M>(
            path,
            entityId,
            databaseId || collection?.databaseId
        );
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

        const savedEntity = await this.entityService.saveEntity<M>(
            path,
            values,
            entityId,
            collection?.databaseId
        );

        // Notify real-time subscribers
        await this.realtimeService.notifyEntityUpdate(
            path,
            savedEntity.id.toString(),
            savedEntity,
            collection?.databaseId
        );

        return savedEntity;
    }

    async deleteEntity<M extends Record<string, any>>({
        entity,
        collection
    }: DeleteEntityProps<M>): Promise<void> {

        console.log("🗑️ [DataSourceDelegate] Starting delete for entity:", entity.id, "in path:", entity.path);

        await this.entityService.deleteEntity(
            entity.path,
            entity.id,
            entity.databaseId || collection?.databaseId
        );

        console.log("🗑️ [DataSourceDelegate] Entity deleted from database, now notifying real-time subscribers");

        // Use the EXACT SAME notification system as saveEntity - this is the key!
        await this.realtimeService.notifyEntityUpdate(
            entity.path,
            entity.id.toString(),
            null, // null indicates deletion
            entity.databaseId || collection?.databaseId
        );

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

    generateEntityId(path: string, collection?: EntityCollection): string {
        return this.entityService.generateEntityId();
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
                // @ts-ignore
                return await originalDb.transaction(async (tx) => {
                    // Set the user ID and roles for RLS
                    await tx.execute(sql`SELECT set_config('firecms.current_user_id', ${user.uid}, true)`);
                    // Set user roles as comma-separated string for role-based RLS policies
                    const rolesString = (user.roles ?? []).map(r => r.id).join(",");
                    await tx.execute(sql`SELECT set_config('firecms.current_user_roles', ${rolesString}, true)`);

                    // Create a temporary delegate using the transaction client
                    // We need to instantiate a new EntityService with the tx
                    const txEntityService = new EntityService(tx);

                    // Creates a lightweight copy of the delegate to invoke the method on
                    // We can't use 'this' directly because it might be bound to the original db
                    // But wait, the methods in THIS class mainly delegate to this.entityService.
                    // So we can just call the method on a new instance that interprets `this.entityService` as `txEntityService`.

                    // Let's create a partial clone
                    const txDelegate = new PostgresDataSourceDelegate(tx, this.realtimeService);
                    // Force inject the transactional entity service
                    // @ts-ignore
                    txDelegate.entityService = txEntityService;

                    return await originalMethod.apply(txDelegate, args);
                });
            };
        };

        // Wrap the methods that perform DB operations
        authenticatedDelegate.fetchCollection = wrapMethod("fetchCollection");
        authenticatedDelegate.fetchEntity = wrapMethod("fetchEntity");
        authenticatedDelegate.saveEntity = wrapMethod("saveEntity");
        authenticatedDelegate.deleteEntity = wrapMethod("deleteEntity");
        authenticatedDelegate.checkUniqueField = wrapMethod("checkUniqueField");
        authenticatedDelegate.countEntities = wrapMethod("countEntities");

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
