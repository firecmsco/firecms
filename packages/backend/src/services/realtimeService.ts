import { WebSocket } from "ws";
import { EventEmitter } from "events";
import { EntityService } from "../db/entityService";

import { CollectionUpdateMessage, EntityUpdateMessage, WebSocketMessage } from "../types";
import { Entity, ListenCollectionProps, ListenEntityProps } from "@firecms/types";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

type RealTimeListenCollectionProps = ListenCollectionProps & {
    subscriptionId: string
};

type RealTimeListenEntityProps = ListenEntityProps & { subscriptionId: string };

export class RealtimeService extends EventEmitter {
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
    }>();

    // Add callback storage for DataSourceDelegate subscriptions
    private subscriptionCallbacks = new Map<string, (data: any) => void>();

    constructor(private db: NodePgDatabase) {
        super();
        this.entityService = new EntityService(db);
    }

    // Make subscriptions accessible for DataSourceDelegate
    get subscriptions() {
        return this._subscriptions;
    }

    // Add public method to register DataSourceDelegate subscriptions
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
    }) {
        console.log("📋 [RealtimeService] Registering DataSource subscription:", subscriptionId);
        this._subscriptions.set(subscriptionId, subscription);
    }

    // Add callback management methods
    addSubscriptionCallback(subscriptionId: string, callback: (data: any) => void) {
        console.log("📋 [RealtimeService] Adding callback for subscription:", subscriptionId);
        this.subscriptionCallbacks.set(subscriptionId, callback);
    }

    removeSubscriptionCallback(subscriptionId: string) {
        console.log("📋 [RealtimeService] Removing callback for subscription:", subscriptionId);
        this.subscriptionCallbacks.delete(subscriptionId);
    }

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
            const entities = await this.entityService.fetchCollection(request.path, {
                filter: request.filter,
                orderBy: request.orderBy,
                order: request.order,
                limit: request.limit,
                startAfter: request.startAfter,
                databaseId: request.collection?.databaseId,
                searchString: request.searchString
            });

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
            const entity = await this.entityService.fetchEntity(
                request.path,
                request.entityId,
                request.collection?.databaseId
            );

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
        console.log("🔔 [RealtimeService] notifyEntityUpdate called for path:", path, "entityId:", entityId, "isDelete:", entity === null);

        // Get all paths that need to be notified - the direct path plus any parent paths
        const pathsToNotify = [path];

        // If this is a nested relation path (like "posts/70/tags"), also notify parent paths
        if (path.includes("/") && path.split("/").length > 1) {
            const parentPaths = this.getParentPaths(path);
            pathsToNotify.push(...parentPaths);
            console.log(`🔗 [RealtimeService] Nested path detected. Will notify paths: ${pathsToNotify.join(", ")}`);
        }

        // Process each path that needs notification
        for (const notifyPath of pathsToNotify) {
            await this.notifyPathUpdate(notifyPath, path, entityId, entity, databaseId);
        }

        console.log("🔔 [RealtimeService] notifyEntityUpdate completed for path:", path);
    }

    /**
     * Notify subscriptions for a specific path
     */
    private async notifyPathUpdate(notifyPath: string, originalPath: string, entityId: string, entity: Entity | null, _databaseId?: string) {
        console.log(`📡 [RealtimeService] Notifying path: ${notifyPath} (original: ${originalPath})`);

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

        console.log(`📡 [RealtimeService] Found ${allSubscriptions.length} subscriptions for path: ${notifyPath}`);

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
                console.log(`🔄 [RealtimeService] Processing WebSocket subscription: ${subscriptionId} of type: ${subscription.type} for path: ${notifyPath}`);

                if (subscription.type === "entity" && notifyPath === originalPath) {
                    // Send entity update directly (only for exact path matches)
                    this.sendEntityUpdate(subscription.clientId, subscriptionId, entity);
                    console.log(`📄 [RealtimeService] Sent entity_update to ${subscriptionId}`);

                } else if (subscription.type === "collection" && subscription.collectionRequest) {
                    // Refetch the collection with its specific filters and send update
                    const collectionRequest = subscription.collectionRequest;
                    console.log(`📋 [RealtimeService] Refetching collection for subscription: ${subscriptionId}, path: ${notifyPath}`);

                    let entities;
                    if (collectionRequest.searchString) {
                        entities = await this.entityService.searchEntities(
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
                    } else {
                        entities = await this.entityService.fetchCollection(notifyPath, {
                            filter: collectionRequest.filter,
                            orderBy: collectionRequest.orderBy,
                            order: collectionRequest.order,
                            limit: collectionRequest.limit,
                            startAfter: collectionRequest.startAfter,
                            databaseId: collectionRequest.databaseId
                        });
                    }

                    console.log(`📬 [RealtimeService] Sending collection_update with ${entities.length} entities to ${subscriptionId} (path: ${notifyPath})`);
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
                console.log(`🔄 [RealtimeService] Processing DataSource subscription: ${subscriptionId} of type: ${subscription.type} for path: ${notifyPath}`);

                const callback = this.subscriptionCallbacks.get(subscriptionId);
                if (!callback) {
                    console.log(`⚠️ [RealtimeService] No callback found for DataSource subscription: ${subscriptionId}`);
                    continue;
                }

                if (subscription.type === "entity" && notifyPath === originalPath) {
                    // Call the callback directly with the entity (only for exact path matches)
                    callback(entity);
                    console.log(`📄 [RealtimeService] Called DataSource callback for entity ${subscriptionId}`);

                } else if (subscription.type === "collection" && subscription.collectionRequest) {
                    // Refetch the collection and call the callback
                    const collectionRequest = subscription.collectionRequest;
                    console.log(`📋 [RealtimeService] Refetching collection for DataSource subscription: ${subscriptionId}, path: ${notifyPath}`);

                    let entities;
                    if (collectionRequest.searchString) {
                        entities = await this.entityService.searchEntities(
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
                    } else {
                        entities = await this.entityService.fetchCollection(notifyPath, {
                            filter: collectionRequest.filter,
                            orderBy: collectionRequest.orderBy,
                            order: collectionRequest.order,
                            limit: collectionRequest.limit,
                            startAfter: collectionRequest.startAfter,
                            databaseId: collectionRequest.databaseId
                        });
                    }

                    console.log(`📬 [RealtimeService] Calling DataSource callback with ${entities.length} entities for ${subscriptionId} (path: ${notifyPath})`);
                    callback(entities);
                }
            } catch (error) {
                console.error(`❌ [RealtimeService] Error processing DataSource subscription ${subscriptionId}:`, error);
            }
        }
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
