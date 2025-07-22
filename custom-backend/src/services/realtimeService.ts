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
    // Store subscriptions in memory instead of database
    private subscriptions = new Map<string, {
        clientId: string;
        type: "collection" | "entity";
        path: string;
        entityId?: string;
        filter?: any;
    }>();

    constructor(private db: Database, tables: Record<string, PgTable>) {
        super();
        this.entityService = new EntityService(db, tables);
    }

    addClient(clientId: string, ws: WebSocket) {
        this.clients.set(clientId, ws);

        ws.on("message", async (data) => {
            try {
                const message: WebSocketMessage = JSON.parse(data.toString());
                await this.handleMessage(clientId, message);
            } catch (error) {
                this.sendError(clientId, "Invalid message format", undefined);
            }
        });

        ws.on("close", () => {
            this.removeClient(clientId);
        });

        ws.on("error", (error) => {
            console.error("WebSocket error for client", clientId, error);
            this.removeClient(clientId);
        });
    }

    async removeClient(clientId: string) {
        this.clients.delete(clientId);

        // Remove all subscriptions for this client from memory
        for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
            if (subscription.clientId === clientId) {
                this.subscriptions.delete(subscriptionId);
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
                this.sendError(clientId, "Unknown message type", message.subscriptionId);
        }
    }

    private async handleCollectionSubscription(clientId: string, request: ListenCollectionRequest) {
        const subscriptionId = request.subscriptionId;

        try {
            // Store subscription in memory
            this.subscriptions.set(subscriptionId, {
                clientId,
                type: "collection",
                path: request.path,
                filter: request.filter
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
            this.subscriptions.set(subscriptionId, {
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
        this.subscriptions.delete(subscriptionId);
    }

    // Called when an entity is updated to notify subscribers
    async notifyEntityUpdate(path: string, entityId: string, entity: Entity | null, databaseId?: string) {
        // Find all relevant subscriptions
        const relevantSubscriptions = Array.from(this.subscriptions.entries()).filter(([_, sub]) => {
            if (sub.type === "entity" && sub.path === path && sub.entityId === entityId) {
                return true;
            }
            if (sub.type === "collection" && sub.path === path) {
                return true;
            }
            return false;
        });

        for (const [subscriptionId, subscription] of relevantSubscriptions) {
            try {
                if (subscription.type === "entity") {
                    this.sendEntityUpdate(subscription.clientId, subscriptionId, entity);
                } else if (subscription.type === "collection") {
                    // Refetch the collection for collection subscribers
                    const entities = await this.entityService.fetchCollection(path, {
                        filter: subscription.filter,
                        databaseId
                    });
                    this.sendCollectionUpdate(subscription.clientId, subscriptionId, entities);
                }
            } catch (error) {
                console.error("Error notifying subscriber:", error);
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
