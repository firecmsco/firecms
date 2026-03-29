import { WebSocket } from "ws";
import { EventEmitter } from "events";
import { EntityService } from "../db/entityService";

import { Entity, ListenCollectionProps, ListenEntityProps, DataSource, CollectionUpdateMessage, EntityUpdateMessage, WebSocketMessage } from "@rebasepro/types";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql as drizzleSql } from "drizzle-orm";
import { RealtimeProvider, CollectionSubscriptionConfig, EntitySubscriptionConfig } from "../db/interfaces";
import { collectionRegistry } from "../collections/registry";

/**
 * Auth context stored per-subscription so real-time refetches respect RLS.
 * Mirrors the session variables set by PostgresDataSource.withAuth().
 */
export interface SubscriptionAuthContext {
    userId: string;
    roles: string[];
}

type RealTimeListenCollectionProps = ListenCollectionProps & {
    subscriptionId: string
};

type RealTimeListenEntityProps = ListenEntityProps & { subscriptionId: string };

/**
 * PostgreSQL-specific realtime service.
 * Handles WebSocket connections and subscriptions for real-time entity updates.
 * 
 * Implements the RealtimeProvider interface for database abstraction.
 */
export class RealtimeService extends EventEmitter implements RealtimeProvider {
    private clients = new Map<string, WebSocket>();
    private entityService: EntityService;
    // Enhanced subscriptions storage with full request parameters
    private _subscriptions = new Map<string, {
        clientId: string;
        type: "collection" | "entity";
        path: string;
        entityId?: string | number;
        // Store full collection request parameters for proper refetching
        collectionRequest?: {
            filter?: any;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            databaseId?: string;
            searchString?: string;
        };
        // Auth context for RLS — when set, refetches run in a transaction
        // with set_config('app.user_id', ...) / set_config('app.user_roles', ...)
        authContext?: SubscriptionAuthContext;
    }>();

    // Add callback storage for DataSource subscriptions
    private subscriptionCallbacks = new Map<string, (data: any) => void>();

    private dataSource?: DataSource;

    constructor(private db: NodePgDatabase) {
        super();
        this.entityService = new EntityService(db);
    }

    setDataSource(dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    // Make subscriptions accessible for DataSource
    get subscriptions() {
        return this._subscriptions;
    }

    // Add public method to register DataSource subscriptions
    registerDataSourceSubscription(subscriptionId: string, subscription: {
        clientId: string;
        type: "collection" | "entity";
        path: string;
        entityId?: string | number;
        collectionRequest?: {
            filter?: any;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: any;
            databaseId?: string;
            searchString?: string;
        };
        authContext?: SubscriptionAuthContext;
    }) {
        console.debug("📋 [RealtimeService] Registering DataSource subscription:", subscriptionId, subscription.authContext ? "(with auth)" : "(no auth)");
        this._subscriptions.set(subscriptionId, subscription);
    }

    // Add callback management methods
    addSubscriptionCallback(subscriptionId: string, callback: (data: any) => void) {
        console.debug("📋 [RealtimeService] Adding callback for subscription:", subscriptionId);
        this.subscriptionCallbacks.set(subscriptionId, callback);
    }

    removeSubscriptionCallback(subscriptionId: string) {
        console.debug("📋 [RealtimeService] Removing callback for subscription:", subscriptionId);
        this.subscriptionCallbacks.delete(subscriptionId);
    }

    // =============================================================================
    // RealtimeProvider Interface Methods
    // =============================================================================

    /**
     * Subscribe to collection changes (RealtimeProvider interface)
     */
    subscribeToCollection(
        subscriptionId: string,
        config: CollectionSubscriptionConfig,
        callback?: (entities: Entity[]) => void
    ): void {
        this._subscriptions.set(subscriptionId, {
            clientId: config.clientId,
            type: "collection",
            path: config.path,
            collectionRequest: {
                filter: config.filter,
                orderBy: config.orderBy,
                order: config.order,
                limit: config.limit,
                startAfter: config.startAfter,
                databaseId: config.databaseId,
                searchString: config.searchString
            }
        });

        if (callback) {
            this.subscriptionCallbacks.set(subscriptionId, callback);
        }
    }

    /**
     * Subscribe to single entity changes (RealtimeProvider interface)
     */
    subscribeToEntity(
        subscriptionId: string,
        config: EntitySubscriptionConfig,
        callback?: (entity: Entity | null) => void
    ): void {
        this._subscriptions.set(subscriptionId, {
            clientId: config.clientId,
            type: "entity",
            path: config.path,
            entityId: config.entityId
        });

        if (callback) {
            this.subscriptionCallbacks.set(subscriptionId, callback);
        }
    }

    /**
     * Unsubscribe from a subscription (RealtimeProvider interface)
     */
    unsubscribe(subscriptionId: string): void {
        this._subscriptions.delete(subscriptionId);
        this.subscriptionCallbacks.delete(subscriptionId);
    }

    // =============================================================================
    // WebSocket Client Management
    // =============================================================================

    addClient(clientId: string, ws: WebSocket) {
        this.clients.set(clientId, ws);

        ws.on("close", () => {
            this.removeClient(clientId);
        });

        ws.on("error", (error) => {
            console.error("WebSocket error for client", clientId, error);
            this.removeClient(clientId);
        });
    }

    // Public method to handle messages from external sources (like main WebSocket handler)
    async handleClientMessage(clientId: string, message: WebSocketMessage) {
        await this.handleMessage(clientId, message);
    }

    async removeClient(clientId: string) {
        this.clients.delete(clientId);

        // Remove all subscriptions for this client from memory
        for (const [subscriptionId, subscription] of this._subscriptions.entries()) {
            if (subscription.clientId === clientId) {
                this._subscriptions.delete(subscriptionId);
            }
        }
    }

    private async handleMessage(clientId: string, message: WebSocketMessage) {
        switch (message.type) {
            case "subscribe_collection":
                await this.handleCollectionSubscription(clientId, message.payload as RealTimeListenCollectionProps);
                break;
            case "subscribe_entity":
                await this.handleEntitySubscription(clientId, message.payload as RealTimeListenEntityProps);
                break;
            case "unsubscribe":
                await this.handleUnsubscribe(clientId, message.subscriptionId!);
                break;
            default:
                this.sendError(clientId, "Unknown message type " + message.type, message.subscriptionId);
        }
    }

    private async handleCollectionSubscription(clientId: string, request: RealTimeListenCollectionProps) {
        const subscriptionId = request.subscriptionId;

        try {
            // Store subscription with full request parameters
            this._subscriptions.set(subscriptionId, {
                clientId,
                type: "collection",
                path: request.path,
                collectionRequest: {
                    filter: request.filter,
                    orderBy: request.orderBy,
                    order: request.order,
                    limit: request.limit,
                    startAfter: request.startAfter,
                    databaseId: request.collection?.databaseId,
                    searchString: request.searchString
                }
            });

            // Send initial data
            let entities;
            if (this.dataSource) {
                const collection = collectionRegistry.getCollectionByPath(request.path);
                entities = await this.dataSource.fetchCollection({
                    path: request.path,
                    collection: collection,
                    filter: request.filter,
                    orderBy: request.orderBy,
                    order: request.order,
                    limit: request.limit,
                    startAfter: request.startAfter,
                    searchString: request.searchString
                });
            } else {
                entities = await this.entityService.fetchCollection(request.path, {
                    filter: request.filter,
                    orderBy: request.orderBy,
                    order: request.order,
                    limit: request.limit,
                    startAfter: request.startAfter,
                    databaseId: request.collection?.databaseId,
                    searchString: request.searchString
                });
            }

            this.sendCollectionUpdate(clientId, subscriptionId, entities);

        } catch (error) {
            this.sendError(clientId, `Failed to subscribe to collection: ${error}`, subscriptionId);
        }
    }

    private async handleEntitySubscription(clientId: string, request: RealTimeListenEntityProps) {
        const subscriptionId = request.subscriptionId;

        try {
            // Store subscription in memory
            this._subscriptions.set(subscriptionId, {
                clientId,
                type: "entity",
                path: request.path,
                entityId: request.entityId
            });

            // Send initial data
            let entity;
            if (this.dataSource) {
                const collection = collectionRegistry.getCollectionByPath(request.path);
                entity = await this.dataSource.fetchEntity({
                    path: request.path,
                    entityId: request.entityId,
                    collection: collection
                });
            } else {
                entity = await this.entityService.fetchEntity(
                    request.path,
                    request.entityId,
                    request.collection?.databaseId
                );
            }

            this.sendEntityUpdate(clientId, subscriptionId, entity || null);

        } catch (error) {
            this.sendError(clientId, `Failed to subscribe to entity: ${request.path} ${request.entityId} ${error}`, subscriptionId);
        }
    }

    private async handleUnsubscribe(_clientId: string, subscriptionId: string) {
        this._subscriptions.delete(subscriptionId);
    }

    // Enhanced notification method that handles nested relation updates
    async notifyEntityUpdate(path: string, entityId: string, entity: Entity | null, databaseId?: string) {
        console.debug("🔔 [RealtimeService] notifyEntityUpdate called for path:", path, "entityId:", entityId, "isDelete:", entity === null);

        // Get all paths that need to be notified - the direct path plus any parent paths
        const pathsToNotify = [path];

        // If this is a nested relation path (like "posts/70/tags"), also notify parent paths
        if (path.includes("/") && path.split("/").length > 1) {
            const parentPaths = this.getParentPaths(path);
            pathsToNotify.push(...parentPaths);
            console.debug(`🔗 [RealtimeService] Nested path detected. Will notify paths: ${pathsToNotify.join(", ")}`);
        }

        // Process each path that needs notification
        for (const notifyPath of pathsToNotify) {
            await this.notifyPathUpdate(notifyPath, path, entityId, entity, databaseId);
        }

        console.debug("🔔 [RealtimeService] notifyEntityUpdate completed for path:", path);
    }

    /**
     * Notify subscriptions for a specific path
     */
    private async notifyPathUpdate(notifyPath: string, originalPath: string, entityId: string, entity: Entity | null, _databaseId?: string) {
        console.debug(`📡 [RealtimeService] Notifying path: ${notifyPath} (original: ${originalPath})`);

        // Find all relevant subscriptions for this specific path
        const allSubscriptions = Array.from(this._subscriptions.entries()).filter(([, sub]) => {
            const isPathMatch = sub.path === notifyPath;

            // For entity subscriptions, check if the entityId matches (only for exact path matches)
            if (sub.type === "entity") {
                return isPathMatch && (notifyPath === originalPath ? sub.entityId === entityId : true);
            }
            // For collection subscriptions, it's always relevant if the path matches
            if (sub.type === "collection") {
                return isPathMatch;
            }
            return false;
        });

        console.debug(`📡 [RealtimeService] Found ${allSubscriptions.length} subscriptions for path: ${notifyPath}`);

        // Separate WebSocket subscriptions from DataSource callback subscriptions
        const webSocketSubscriptions = allSubscriptions.filter(([, sub]) =>
            sub.clientId !== "datasource" && this.clients.has(sub.clientId)
        );

        const dataSourceSubscriptions = allSubscriptions.filter(([subscriptionId, sub]) =>
            sub.clientId === "datasource" && this.subscriptionCallbacks.has(subscriptionId)
        );

        // Handle WebSocket subscriptions
        for (const [subscriptionId, subscription] of webSocketSubscriptions) {
            try {
                console.debug(`🔄 [RealtimeService] Processing WebSocket subscription: ${subscriptionId} of type: ${subscription.type} for path: ${notifyPath}`);

                if (subscription.type === "entity" && notifyPath === originalPath) {
                    // Send entity update directly (only for exact path matches)
                    this.sendEntityUpdate(subscription.clientId, subscriptionId, entity);
                    console.debug(`📄 [RealtimeService] Sent entity_update to ${subscriptionId}`);

                } else if (subscription.type === "collection" && subscription.collectionRequest) {
                    // Refetch the collection with its specific filters and send update
                    const collectionRequest = subscription.collectionRequest;
                    console.debug(`📋 [RealtimeService] Refetching collection for subscription: ${subscriptionId}, path: ${notifyPath}`);

                    const entities = await this.fetchCollectionWithAuth(notifyPath, collectionRequest, subscription.authContext);

                    console.debug(`📬 [RealtimeService] Sending collection_update with ${entities.length} entities to ${subscriptionId} (path: ${notifyPath})`);
                    this.sendCollectionUpdate(subscription.clientId, subscriptionId, entities);
                }
            } catch (error) {
                console.error(`❌ [RealtimeService] Error processing WebSocket subscription ${subscriptionId}:`, error);
                this.sendError(subscription.clientId, `Failed to process update for subscription ${subscriptionId}`, subscriptionId);
            }
        }

        // Handle DataSource callback subscriptions
        for (const [subscriptionId, subscription] of dataSourceSubscriptions) {
            try {
                console.debug(`🔄 [RealtimeService] Processing DataSource subscription: ${subscriptionId} of type: ${subscription.type} for path: ${notifyPath}`);

                const callback = this.subscriptionCallbacks.get(subscriptionId);
                if (!callback) {
                    console.debug(`⚠️ [RealtimeService] No callback found for DataSource subscription: ${subscriptionId}`);
                    continue;
                }

                if (subscription.type === "entity" && notifyPath === originalPath) {
                    // Call the callback directly with the entity (only for exact path matches)
                    callback(entity);
                    console.debug(`📄 [RealtimeService] Called DataSource callback for entity ${subscriptionId}`);

                } else if (subscription.type === "collection" && subscription.collectionRequest) {
                    // Refetch the collection and call the callback
                    const collectionRequest = subscription.collectionRequest;
                    console.debug(`📋 [RealtimeService] Refetching collection for DataSource subscription: ${subscriptionId}, path: ${notifyPath}`);

                    const entities = await this.fetchCollectionWithAuth(notifyPath, collectionRequest, subscription.authContext);

                    console.debug(`📬 [RealtimeService] Calling DataSource callback with ${entities.length} entities for ${subscriptionId} (path: ${notifyPath})`);
                    callback(entities);
                }
            } catch (error) {
                console.error(`❌ [RealtimeService] Error processing DataSource subscription ${subscriptionId}:`, error);
            }
        }
    }

    /**
     * Fetch a collection with optional RLS auth context.
     * When authContext is provided, the fetch runs inside a transaction
     * with set_config calls so PostgreSQL RLS policies are enforced.
     */
    private async fetchCollectionWithAuth(
        notifyPath: string,
        collectionRequest: { filter?: any; orderBy?: string; order?: "desc" | "asc"; limit?: number; startAfter?: any; databaseId?: string; searchString?: string },
        authContext?: SubscriptionAuthContext
    ): Promise<Entity[]> {
        if (this.dataSource) {
            const collection = collectionRegistry.getCollectionByPath(notifyPath);
            const fetchFn = async () => this.dataSource!.fetchCollection({
                path: notifyPath,
                collection: collection,
                filter: collectionRequest.filter,
                orderBy: collectionRequest.orderBy,
                order: collectionRequest.order,
                limit: collectionRequest.limit,
                startAfter: collectionRequest.startAfter,
                searchString: collectionRequest.searchString
            });

            // If we have auth context, wrap in a transaction with session vars
            if (authContext) {
                return await this.db.transaction(async (tx) => {
                    await tx.execute(drizzleSql`SELECT set_config('app.user_id', ${authContext.userId}, true)`);
                    await tx.execute(drizzleSql`SELECT set_config('app.user_roles', ${authContext.roles.join(",")}, true)`);
                    await tx.execute(drizzleSql`SELECT set_config('app.jwt', ${JSON.stringify({ sub: authContext.userId, roles: authContext.roles })}, true)`);
                    const txEntityService = new EntityService(tx);
                    if (collectionRequest.searchString) {
                        return await txEntityService.searchEntities(
                            notifyPath,
                            collectionRequest.searchString,
                            {
                                filter: collectionRequest.filter,
                                orderBy: collectionRequest.orderBy,
                                order: collectionRequest.order,
                                limit: collectionRequest.limit,
                                databaseId: collectionRequest.databaseId
                            }
                        );
                    }
                    return await txEntityService.fetchCollection(notifyPath, {
                        filter: collectionRequest.filter,
                        orderBy: collectionRequest.orderBy,
                        order: collectionRequest.order,
                        limit: collectionRequest.limit,
                        startAfter: collectionRequest.startAfter,
                        databaseId: collectionRequest.databaseId
                    });
                });
            }

            return fetchFn();
        }

        // No dataSource — use entityService directly (no auth wrapping possible)
        if (collectionRequest.searchString) {
            return await this.entityService.searchEntities(
                notifyPath,
                collectionRequest.searchString,
                {
                    filter: collectionRequest.filter,
                    orderBy: collectionRequest.orderBy,
                    order: collectionRequest.order,
                    limit: collectionRequest.limit,
                    databaseId: collectionRequest.databaseId
                }
            );
        }
        return await this.entityService.fetchCollection(notifyPath, {
            filter: collectionRequest.filter,
            orderBy: collectionRequest.orderBy,
            order: collectionRequest.order,
            limit: collectionRequest.limit,
            startAfter: collectionRequest.startAfter,
            databaseId: collectionRequest.databaseId
        });
    }

    private sendCollectionUpdate(clientId: string, subscriptionId: string, entities: Entity[]) {
        const message: CollectionUpdateMessage = {
            type: "collection_update",
            subscriptionId,
            entities
        };
        this.sendMessage(clientId, message);
    }

    private sendEntityUpdate(clientId: string, subscriptionId: string, entity: Entity | null) {
        const message: EntityUpdateMessage = {
            type: "entity_update",
            subscriptionId,
            entity
        };
        this.sendMessage(clientId, message);
    }

    private sendError(clientId: string, error: string, subscriptionId?: string) {
        console.error("Error handling collection subscription:", error);
        const message = {
            type: "error" as const,
            subscriptionId,
            error
        };
        this.sendMessage(clientId, message);
    }

    private sendMessage(clientId: string, message: any) {
        const client = this.clients.get(clientId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }

    /**
     * Extract parent paths from a nested path like "posts/70/tags"
     * Returns ["posts", "posts/70"] for the example above
     */
    private getParentPaths(path: string): string[] {
        const segments = path.split("/").filter(s => s.length > 0);
        const parentPaths: string[] = [];

        // Build parent paths progressively
        for (let i = 1; i < segments.length; i += 2) {
            const parentPath = segments.slice(0, i).join("/");
            if (parentPath) {
                parentPaths.push(parentPath);
            }

            // If there's an entity ID, add the path including the entity
            if (i + 1 < segments.length) {
                const pathWithEntity = segments.slice(0, i + 1).join("/");
                parentPaths.push(pathWithEntity);
            }
        }

        return parentPaths;
    }
}

/**
 * Alias for RealtimeService for consistent naming with other database implementations.
 * This allows code to use PostgresRealtimeProvider alongside future MongoRealtimeProvider, etc.
 */
export const PostgresRealtimeProvider = RealtimeService;
