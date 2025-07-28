import { WebSocket } from "ws";
import { EventEmitter } from "events";
import { EntityService } from "../db/entityService";
import { Database } from "../db/connection";
import {
    CollectionUpdateMessage,
    Entity,
    EntityUpdateMessage,
    ListenCollectionRequest,
    ListenEntityRequest,
    WebSocketMessage
} from "../types";
import { PgTable } from "drizzle-orm/pg-core";

export class RealtimeService extends EventEmitter {
    private clients = new Map<string, WebSocket>();
    private entityService: EntityService;
    // Enhanced subscriptions storage with full request parameters
    private _subscriptions = new Map<string, {
        clientId: string;
        type: "collection" | "entity";
        path: string;
        entityId?: string;
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

    constructor(private db: Database, tables: Record<string, PgTable>) {
        super();
        this.entityService = new EntityService(db, tables);
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
        entityId?: string;
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
                await this.handleCollectionSubscription(clientId, message.payload as ListenCollectionRequest);
                break;
            case "subscribe_entity":
                await this.handleEntitySubscription(clientId, message.payload as ListenEntityRequest);
                break;
            case "unsubscribe":
                await this.handleUnsubscribe(clientId, message.subscriptionId!);
                break;
            default:
                this.sendError(clientId, "Unknown message type " + message.type, message.subscriptionId);
        }
    }

    private async handleCollectionSubscription(clientId: string, request: ListenCollectionRequest) {
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
                databaseId: request.collection?.databaseId
            });

            this.sendCollectionUpdate(clientId, subscriptionId, entities);

        } catch (error) {
            this.sendError(clientId, `Failed to subscribe to collection: ${error}`, subscriptionId);
        }
    }

    private async handleEntitySubscription(clientId: string, request: ListenEntityRequest) {
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
            this.sendError(clientId, `Failed to subscribe to entity: ${error}`, subscriptionId);
        }
    }

    private async handleUnsubscribe(clientId: string, subscriptionId: string) {
        this._subscriptions.delete(subscriptionId);
    }

    // Enhanced notification method that properly handles collection updates
    async notifyEntityUpdate(path: string, entityId: string, entity: Entity | null, databaseId?: string) {
        console.log("🔔 [RealtimeService] notifyEntityUpdate called for path:", path, "entityId:", entityId, "isDelete:", entity === null);

        // Find all relevant WebSocket subscriptions for this path
        const webSocketSubscriptions = Array.from(this._subscriptions.entries()).filter(([_, sub]) => {
            const isPathMatch = sub.path === path;
            const isClientActive = sub.clientId !== "datasource" && this.clients.has(sub.clientId);

            if (!isPathMatch || !isClientActive) return false;

            // For entity subscriptions, check if the entityId matches
            if (sub.type === "entity") {
                return sub.entityId === entityId;
            }
            // For collection subscriptions, it's always relevant if the path matches
            if (sub.type === "collection") {
                return true;
            }
            return false;
        });

        console.log(`📡 [RealtimeService] Found ${webSocketSubscriptions.length} active WebSocket subscriptions for path: ${path}`);

        for (const [subscriptionId, subscription] of webSocketSubscriptions) {
            try {
                console.log(`🔄 [RealtimeService] Processing subscription: ${subscriptionId} of type: ${subscription.type}`);

                if (subscription.type === "entity") {
                    // Send entity update directly
                    this.sendEntityUpdate(subscription.clientId, subscriptionId, entity);
                    console.log(`📄 [RealtimeService] Sent entity_update to ${subscriptionId}`);

                } else if (subscription.type === "collection" && subscription.collectionRequest) {
                    // Refetch the collection with its specific filters and send update
                    const collectionRequest = subscription.collectionRequest;
                    console.log("📋 [RealtimeService] Refetching collection for subscription:", subscriptionId, "with request:", collectionRequest);

                    let entities;
                    if (collectionRequest.searchString) {
                        entities = await this.entityService.searchEntities(
                            path,
                            collectionRequest.searchString,
                            collectionRequest.databaseId
                        );
                    } else {
                        entities = await this.entityService.fetchCollection(path, {
                            filter: collectionRequest.filter,
                            orderBy: collectionRequest.orderBy,
                            order: collectionRequest.order,
                            limit: collectionRequest.limit,
                            startAfter: collectionRequest.startAfter,
                            databaseId: collectionRequest.databaseId
                        });
                    }

                    console.log(`📬 [RealtimeService] Sending collection_update with ${entities.length} entities to ${subscriptionId}`);
                    this.sendCollectionUpdate(subscription.clientId, subscriptionId, entities);
                }
            } catch (error) {
                console.error(`❌ [RealtimeService] Error processing subscription ${subscriptionId}:`, error);
                this.sendError(subscription.clientId, `Failed to process update for subscription ${subscriptionId}`, subscriptionId);
            }
        }

        console.log("🔔 [RealtimeService] notifyEntityUpdate completed for path:", path);
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
}
