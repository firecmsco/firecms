/**
 * MongoDB Realtime Service
 *
 * Implements RealtimeProvider interface using MongoDB Change Streams.
 * Provides real-time subscriptions to collection and entity changes.
 */

import { Db, ChangeStream, ChangeStreamDocument, Document, ObjectId } from "mongodb";
import { Entity } from "@firecms/types";
import { MongoEntityService } from "../db/MongoEntityService";
import { MongoConditionBuilder } from "../db/MongoConditionBuilder";

/**
 * Realtime provider interface (from @firecms/backend).
 */
export interface RealtimeProvider {
    subscribeToCollection(
        subscriptionId: string,
        config: CollectionSubscriptionConfig,
        callback?: (entities: Entity[]) => void
    ): void;

    subscribeToEntity(
        subscriptionId: string,
        config: EntitySubscriptionConfig,
        callback?: (entity: Entity | null) => void
    ): void;

    unsubscribe(subscriptionId: string): void;

    notifyEntityUpdate(
        path: string,
        entityId: string,
        entity: Entity | null,
        databaseId?: string
    ): Promise<void>;
}

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

interface Subscription {
    type: "collection" | "entity";
    config: CollectionSubscriptionConfig | EntitySubscriptionConfig;
    changeStream?: ChangeStream;
    callback?: (data: any) => void;
}

/**
 * MongoDB Realtime Service
 *
 * Implements real-time subscriptions using MongoDB Change Streams.
 * Requires MongoDB replica set for change streams to work.
 */
export class MongoRealtimeService implements RealtimeProvider {
    private subscriptions = new Map<string, Subscription>();
    private entityService: MongoEntityService;

    constructor(private db: Db) {
        this.entityService = new MongoEntityService(db);
    }

    /**
     * Get the collection name from a path
     */
    private getCollectionName(path: string): string {
        return path.replace(/\//g, "_");
    }

    /**
     * Subscribe to collection changes
     */
    subscribeToCollection(
        subscriptionId: string,
        config: CollectionSubscriptionConfig,
        callback?: (entities: Entity[]) => void
    ): void {
        // Clean up existing subscription if any
        this.unsubscribe(subscriptionId);

        const collectionName = this.getCollectionName(config.path);
        const collection = this.db.collection(collectionName);

        // Build pipeline for change stream filtering
        const pipeline: Document[] = [];

        // Filter by operation types we care about
        pipeline.push({
            $match: {
                operationType: { $in: ["insert", "update", "replace", "delete"] }
            }
        });

        try {
            // Create change stream
            const changeStream = collection.watch(pipeline, {
                fullDocument: "updateLookup"
            });

            const subscription: Subscription = {
                type: "collection",
                config,
                changeStream,
                callback
            };

            this.subscriptions.set(subscriptionId, subscription);

            // Fetch initial data
            this.fetchAndNotifyCollection(subscriptionId, config, callback);

            // Listen for changes
            changeStream.on("change", async (change: ChangeStreamDocument) => {
                // Re-fetch the entire collection when any change happens
                // This is simpler and ensures consistent sorting/filtering
                await this.fetchAndNotifyCollection(subscriptionId, config, callback);
            });

            changeStream.on("error", (error: Error) => {
                console.error(`Change stream error for subscription ${subscriptionId}:`, error);
            });

        } catch (error) {
            // Change streams might not be available (e.g., standalone MongoDB)
            console.warn("Change streams not available, falling back to polling:", error);

            // Store subscription without change stream for manual notifications
            const subscription: Subscription = {
                type: "collection",
                config,
                callback
            };

            this.subscriptions.set(subscriptionId, subscription);

            // Fetch initial data
            this.fetchAndNotifyCollection(subscriptionId, config, callback);
        }
    }

    /**
     * Fetch collection and notify callback
     */
    private async fetchAndNotifyCollection(
        subscriptionId: string,
        config: CollectionSubscriptionConfig,
        callback?: (entities: Entity[]) => void
    ): Promise<void> {
        try {
            const entities = await this.entityService.fetchCollection(config.path, {
                filter: config.filter,
                orderBy: config.orderBy,
                order: config.order,
                limit: config.limit,
                startAfter: config.startAfter,
                searchString: config.searchString
            });

            if (callback) {
                callback(entities);
            }
        } catch (error) {
            console.error(`Error fetching collection for subscription ${subscriptionId}:`, error);
        }
    }

    /**
     * Subscribe to single entity changes
     */
    subscribeToEntity(
        subscriptionId: string,
        config: EntitySubscriptionConfig,
        callback?: (entity: Entity | null) => void
    ): void {
        // Clean up existing subscription if any
        this.unsubscribe(subscriptionId);

        const collectionName = this.getCollectionName(config.path);
        const collection = this.db.collection(collectionName);

        // Build pipeline to watch specific document
        const entityId = typeof config.entityId === "string" && ObjectId.isValid(config.entityId)
            ? new ObjectId(config.entityId)
            : config.entityId;

        const pipeline: Document[] = [
            {
                $match: {
                    "documentKey._id": entityId,
                    operationType: { $in: ["insert", "update", "replace", "delete"] }
                }
            }
        ];

        try {
            const changeStream = collection.watch(pipeline, {
                fullDocument: "updateLookup"
            });

            const subscription: Subscription = {
                type: "entity",
                config,
                changeStream,
                callback
            };

            this.subscriptions.set(subscriptionId, subscription);

            // Fetch initial data
            this.fetchAndNotifyEntity(subscriptionId, config, callback);

            // Listen for changes
            changeStream.on("change", async (change: ChangeStreamDocument) => {
                if (change.operationType === "delete") {
                    if (callback) {
                        callback(null);
                    }
                } else {
                    await this.fetchAndNotifyEntity(subscriptionId, config, callback);
                }
            });

            changeStream.on("error", (error: Error) => {
                console.error(`Change stream error for subscription ${subscriptionId}:`, error);
            });

        } catch (error) {
            console.warn("Change streams not available, falling back to polling:", error);

            const subscription: Subscription = {
                type: "entity",
                config,
                callback
            };

            this.subscriptions.set(subscriptionId, subscription);

            // Fetch initial data
            this.fetchAndNotifyEntity(subscriptionId, config, callback);
        }
    }

    /**
     * Fetch entity and notify callback
     */
    private async fetchAndNotifyEntity(
        subscriptionId: string,
        config: EntitySubscriptionConfig,
        callback?: (entity: Entity | null) => void
    ): Promise<void> {
        try {
            const entity = await this.entityService.fetchEntity(config.path, config.entityId);

            if (callback) {
                callback(entity || null);
            }
        } catch (error) {
            console.error(`Error fetching entity for subscription ${subscriptionId}:`, error);
        }
    }

    /**
     * Unsubscribe from a subscription
     */
    unsubscribe(subscriptionId: string): void {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            if (subscription.changeStream) {
                subscription.changeStream.close().catch(console.error);
            }
            this.subscriptions.delete(subscriptionId);
        }
    }

    /**
     * Notify all relevant subscribers of an entity update
     * This is called after save/delete operations to push updates
     */
    async notifyEntityUpdate(
        path: string,
        entityId: string,
        entity: Entity | null,
        _databaseId?: string
    ): Promise<void> {
        // Find all subscriptions that might be affected by this update
        for (const [subscriptionId, subscription] of this.subscriptions) {
            if (subscription.type === "entity") {
                const config = subscription.config as EntitySubscriptionConfig;
                if (config.path === path && config.entityId.toString() === entityId) {
                    if (subscription.callback) {
                        subscription.callback(entity);
                    }
                }
            } else if (subscription.type === "collection") {
                const config = subscription.config as CollectionSubscriptionConfig;
                if (config.path === path) {
                    // Re-fetch the collection to get updated data
                    await this.fetchAndNotifyCollection(subscriptionId, config, subscription.callback);
                }
            }
        }
    }

    /**
     * Get all active subscriptions (for debugging)
     */
    getSubscriptions(): Map<string, Subscription> {
        return this.subscriptions;
    }

    /**
     * Close all subscriptions
     */
    async closeAll(): Promise<void> {
        for (const [subscriptionId] of this.subscriptions) {
            this.unsubscribe(subscriptionId);
        }
    }
}
