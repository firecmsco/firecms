import {
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    SaveEntityProps
} from "@firecms/types";

export interface PostgresDataSourceConfig {
    websocketUrl: string;
}

export interface WebSocketMessage {
    type: string;
    payload?: any;
    subscriptionId?: string;
    requestId?: string;
    entities?: Entity[];
    entity?: Entity | null;
    error?: string;
}

export interface CollectionUpdateMessage extends WebSocketMessage {
    type: "collection_update";
    subscriptionId: string;
    entities: Entity[];
}

export interface EntityUpdateMessage extends WebSocketMessage {
    type: "entity_update";
    subscriptionId: string;
    entity: Entity | null;
}

export class ApiError extends Error {
    public code?: string;
    public error?: string;

    constructor(message: string, error?: string, code?: string) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.error = error;
    }
}

export class PostgresDataSourceClient {
    private websocketUrl: string;
    private ws: WebSocket | null = null;
    private subscriptions = new Map<string, (data: any) => void>();
    private pendingRequests = new Map<string, { resolve: (p:any) => void; reject: (p:any) => void }>();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private isConnected = false;
    private messageQueue: any[] = [];

    constructor(config: PostgresDataSourceConfig) {
        this.websocketUrl = config.websocketUrl;
        this.initWebSocket();
    }

    // Initialize WebSocket connection
    private initWebSocket() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        try {
            this.ws = new WebSocket(this.websocketUrl);

            this.ws.onopen = () => {
                console.log("Connected to PostgreSQL backend");
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.processMessageQueue();
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            this.ws.onclose = () => {
                console.log("Disconnected from PostgreSQL backend");
                this.isConnected = false;
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                this.isConnected = false;
            };
        } catch (error) {
            console.error("Failed to initialize WebSocket:", error);
            this.attemptReconnect();
        }
    }

    private processMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("Max reconnection attempts reached");
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => {
            this.initWebSocket();
        }, delay);
    }

    private handleWebSocketMessage(message: WebSocketMessage) {
        const { type, requestId, subscriptionId } = message;

        // Handle responses to pending requests
        if (requestId && this.pendingRequests.has(requestId)) {
            const { resolve, reject } = this.pendingRequests.get(requestId)!;
            this.pendingRequests.delete(requestId);

            if (type.endsWith("_SUCCESS")) {
                resolve(message.payload || message);
            } else if (type === "ERROR") {
                reject(new ApiError(message.payload?.message || message.payload?.error || "Unknown error", message.payload?.error, message.payload?.code));
            }
            return;
        }

        // Handle subscription updates
        if (subscriptionId && this.subscriptions.has(subscriptionId)) {
            const callback = this.subscriptions.get(subscriptionId);
            if (!callback) {
                throw new Error(`Subscription callback not found for subscriptionId: ${subscriptionId}`);
            }
            console.log("Received subscription update:", message);
            callback(message);
        }
    }

    private sendMessage(message: any): Promise<any> {
        if (!this.isConnected || !this.ws) {
            this.messageQueue.push(message);
            // Return a promise that will be resolved when the message is actually sent
            return new Promise((queueResolve, queueReject) => {
                message._resolve = queueResolve;
                message._reject = queueReject;
            });
        }

        return new Promise((resolve, reject) => {
            const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            message.requestId = requestId;

            this.pendingRequests.set(requestId, { resolve, reject });

            try {
                this.ws!.send(JSON.stringify(message));
            } catch (error) {
                this.pendingRequests.delete(requestId);
                reject(new ApiError("Failed to send message", error instanceof Error ? error.message : "Unknown error"));
            }
        });
    }

    // Data source methods
    async fetchCollection<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<Entity<M>[]> {
        const response = await this.sendMessage({
            type: "FETCH_COLLECTION",
            payload: props
        });
        return response.entities || [];
    }

    async fetchEntity<M extends Record<string, any>>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
        const response = await this.sendMessage({
            type: "FETCH_ENTITY",
            payload: props
        });
        return response.entity;
    }

    async saveEntity<M extends Record<string, any>>(props: SaveEntityProps<M>): Promise<Entity<M>> {
        const response = await this.sendMessage({
            type: "SAVE_ENTITY",
            payload: props
        });
        return response.entity;
    }

    async deleteEntity<M extends Record<string, any>>(props: DeleteEntityProps<M>): Promise<void> {
        await this.sendMessage({
            type: "DELETE_ENTITY",
            payload: props
        });
    }

    async checkUniqueField(path: string, name: string, value: any, entityId?: string, collection?: EntityCollection): Promise<boolean> {
        const response = await this.sendMessage({
            type: "CHECK_UNIQUE_FIELD",
            payload: { path, name, value, entityId, collection }
        });
        return response.isUnique;
    }

    generateEntityId(path: string, collection?: EntityCollection): Promise<string> {
        return this.sendMessage({
            type: "GENERATE_ENTITY_ID",
            payload: { path, collection }
        }).then(response => response.id);
    }

    async countEntities<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<number> {
        const response = await this.sendMessage({
            type: "COUNT_ENTITIES",
            payload: props
        });
        return response.count;
    }

    // Subscription methods
    listenCollection<M extends Record<string, any>>(
        props: FetchCollectionProps<M>,
        onUpdate: (entities: Entity<M>[]) => void,
        onError?: (error: Error) => void
    ): () => void {
        const subscriptionId = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.subscriptions.set(subscriptionId, (message: CollectionUpdateMessage) => {
            if (message.type === "collection_update") {
                onUpdate(message.entities);
            }
        });

        this.sendMessage({
            type: "subscribe_collection",
            payload: { ...props, subscriptionId }
        }).catch(error => {
            if (onError) onError(error);
        });

        return () => {
            this.subscriptions.delete(subscriptionId);
            if (this.isConnected && this.ws) {
                this.sendMessage({
                    type: "unsubscribe",
                    payload: { subscriptionId }
                }).catch(console.error);
            }
        };
    }

    listenEntity<M extends Record<string, any>>(
        props: FetchEntityProps<M>,
        onUpdate: (entity: Entity<M> | null) => void,
        onError?: (error: Error) => void
    ): () => void {
        const subscriptionId = `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.subscriptions.set(subscriptionId, (message: EntityUpdateMessage) => {
            if (message.type === "entity_update") {
                onUpdate(message.entity);
            }
        });

        this.sendMessage({
            type: "subscribe_entity",
            payload: { ...props, subscriptionId }
        }).catch(error => {
            if (onError) onError(error);
        });

        return () => {
            this.subscriptions.delete(subscriptionId);
            if (this.isConnected && this.ws) {
                this.sendMessage({
                    type: "unsubscribe",
                    payload: { subscriptionId }
                }).catch(console.error);
            }
        };
    }

    // Connection management
    isConnectedToBackend(): boolean {
        return this.isConnected;
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.subscriptions.clear();
        this.pendingRequests.clear();
        this.isConnected = false;
    }
}
