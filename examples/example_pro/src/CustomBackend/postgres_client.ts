import {
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    SaveEntityProps
} from "@firecms/core";

export interface PostgresDataSourceConfig {
    baseUrl: string;
    websocketUrl?: string;
    headers?: Record<string, string>;
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
    private baseUrl: string;
    private websocketUrl: string;
    private headers: Record<string, string>;
    private ws: WebSocket | null = null;
    private subscriptions = new Map<string, (data: any) => void>();
    private pendingRequests = new Map<string, { resolve: Function; reject: Function }>();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private isConnected = false;
    private messageQueue: any[] = [];

    constructor(config: PostgresDataSourceConfig) {
        this.baseUrl = config.baseUrl.replace(/\/$/, "");
        this.websocketUrl = config.websocketUrl || config.baseUrl.replace("http", "ws");
        this.headers = config.headers || {};
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
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

            setTimeout(() => {
                this.initWebSocket();
            }, delay);
        }
    }

    private processMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    }

    private sendMessage(message: any) {
        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            this.messageQueue.push(message);
            if (!this.isConnected) {
                this.initWebSocket();
            }
        }
    }

    private handleWebSocketMessage(message: WebSocketMessage) {
        // Add comprehensive debug logging
        console.log("🔍 [WebSocket Client] Received raw message:", message);
        console.log("🔍 [WebSocket Client] Message type:", message.type);
        console.log("🔍 [WebSocket Client] Message payload:", message.payload);
        console.log("🔍 [WebSocket Client] Subscription ID:", message.subscriptionId);
        console.log("🔍 [WebSocket Client] Request ID:", message.requestId);

        // Handle subscription updates
        if (message.subscriptionId && this.subscriptions.has(message.subscriptionId)) {
            const callback = this.subscriptions.get(message.subscriptionId)!;
            console.log("🔄 [WebSocket Client] Processing subscription update for:", message.subscriptionId);

            switch (message.type) {
                case "collection_update": {
                    const collectionMsg = message as CollectionUpdateMessage;
                    console.log("📋 [WebSocket Client] Collection update - entities count:", collectionMsg.entities.length);
                    console.log("📋 [WebSocket Client] Collection update - entities:", collectionMsg.entities);
                    callback(this.sanitizeAndConvert(collectionMsg.entities));
                    break;
                }
                case "entity_update": {
                    const entityMsg = message as EntityUpdateMessage;
                    console.log("📄 [WebSocket Client] Entity update:", entityMsg.entity);
                    callback(this.sanitizeAndConvert(entityMsg.entity));
                    break;
                }
                case "error": {
                    console.error("❌ [WebSocket Client] Subscription error:", message.error);
                    break;
                }
            }
            return;
        }

        // Handle operation responses using requestId
        if (message.requestId && this.pendingRequests.has(message.requestId)) {
            const {
                resolve,
                reject
            } = this.pendingRequests.get(message.requestId)!;
            this.pendingRequests.delete(message.requestId);
            console.log("✅ [WebSocket Client] Found matching pending request, resolving:", message.requestId);

            if (message.type.endsWith("_SUCCESS")) {
                console.log("✅ [WebSocket Client] Success response for:", message.requestId, message.payload);
                resolve(this.sanitizeAndConvert(message.payload));
            } else if (message.type === "ERROR") {
                console.error("❌ [WebSocket Client] Error response for:", message.requestId, message.payload);
                reject(new ApiError(message.payload?.message || "Unknown error", message.payload?.error, message.payload?.code));
            }
        } else {
            console.warn("⚠️ [WebSocket Client] No matching pending request found for requestId:", message.requestId);
        }
    }

    private generateRequestId(messageType: string): string {
        // Map response types back to request types for matching
        const typeMapping: Record<string, string> = {
            "FETCH_COLLECTION_SUCCESS": "FETCH_COLLECTION",
            "FETCH_ENTITY_SUCCESS": "FETCH_ENTITY",
            "SAVE_ENTITY_SUCCESS": "SAVE_ENTITY",
            "DELETE_ENTITY_SUCCESS": "DELETE_ENTITY",
            "CHECK_UNIQUE_FIELD_SUCCESS": "CHECK_UNIQUE_FIELD",
            "GENERATE_ENTITY_ID_SUCCESS": "GENERATE_ENTITY_ID",
            "COUNT_ENTITIES_SUCCESS": "COUNT_ENTITIES"
        };
        return typeMapping[messageType] || messageType;
    }

    private async sendRequest<T>(type: string, payload: any): Promise<T> {
        return new Promise((resolve, reject) => {
            const requestId = `${type}_${this.generateSubscriptionId()}`; // Create a unique requestId
            this.pendingRequests.set(requestId, {
                resolve,
                reject
            });

            this.sendMessage({
                type,
                requestId, // Send requestId with the message
                payload: this.sanitizeAndConvert(payload)
            });

            // Set timeout for request
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new ApiError("Request timeout", "TIMEOUT", "REQUEST_TIMEOUT"));
                }
            }, 30000); // 30 second timeout
        });
    }

    // API methods that match FireCMS interface - now using WebSockets
    async fetchCollection<M extends Record<string, any>>(
        request: FetchCollectionProps<M>
    ): Promise<Entity<M>[]> {
        const response = await this.sendRequest<{ entities: Entity<M>[] }>("FETCH_COLLECTION", request);
        return response.entities;
    }

    async fetchEntity<M extends Record<string, any>>(
        request: FetchEntityProps<M>
    ): Promise<Entity<M> | undefined> {
        const response = await this.sendRequest<{ entity: Entity<M> | null }>("FETCH_ENTITY", request);
        return response.entity || undefined;
    }

    async saveEntity<M extends Record<string, any>>(
        request: SaveEntityProps<M>
    ): Promise<Entity<M>> {
        const response = await this.sendRequest<{ entity: Entity<M> }>("SAVE_ENTITY", request);
        return response.entity;
    }

    async deleteEntity<M extends Record<string, any>>(
        request: DeleteEntityProps<M>
    ): Promise<void> {
        await this.sendRequest<{ success: boolean }>("DELETE_ENTITY", request);
    }

    async checkUniqueField(
        path: string,
        name: string,
        value: any,
        entityId?: string,
        collection?: EntityCollection
    ): Promise<boolean> {
        const response = await this.sendRequest<{ isUnique: boolean }>("CHECK_UNIQUE_FIELD", {
            path,
            name,
            value,
            entityId,
            collection
        });
        return response.isUnique;
    }

    async countEntities<M extends Record<string, any>>(
        request: FetchCollectionProps<M>
    ): Promise<number> {
        const response = await this.sendRequest<{ count: number }>("COUNT_ENTITIES", request);
        return response.count;
    }

    // Real-time subscription methods
    listenCollection<M extends Record<string, any>>(
        request: Omit<FetchCollectionProps<M>, "subscriptionId">,
        onUpdate: (entities: Entity<M>[]) => void,
        _onError?: (error: Error) => void
    ): () => void {
        const subscriptionId = this.generateSubscriptionId();

        this.subscriptions.set(subscriptionId, onUpdate);

        // Send subscription request via WebSocket
        const sendSubscription = () => {
            this.sendMessage({
                type: "subscribe_collection",
                payload: {
                    ...request,
                    subscriptionId
                }
            });
        };

        if (this.isConnected) {
            sendSubscription();
        } else {
            // Queue the subscription for when connection is established
            this.messageQueue.push({
                type: "subscribe_collection",
                payload: {
                    ...request,
                    subscriptionId
                }
            });
            this.initWebSocket();
        }

        // Return unsubscribe function
        return () => {
            this.subscriptions.delete(subscriptionId);
            if (this.isConnected) {
                this.sendMessage({
                    type: "unsubscribe",
                    subscriptionId
                });
            }
        };
    }

    listenEntity<M extends Record<string, any>>(
        request: Omit<FetchEntityProps<M>, "subscriptionId">,
        onUpdate: (entity: Entity<M> | null) => void,
        _onError?: (error: Error) => void
    ): () => void {
        const subscriptionId = this.generateSubscriptionId();

        this.subscriptions.set(subscriptionId, onUpdate);

        // Send subscription request via WebSocket
        const sendSubscription = () => {
            this.sendMessage({
                type: "subscribe_entity",
                payload: {
                    ...request,
                    subscriptionId
                }
            });
        };

        if (this.isConnected) {
            sendSubscription();
        } else {
            // Queue the subscription for when connection is established
            this.messageQueue.push({
                type: "subscribe_entity",
                payload: {
                    ...request,
                    subscriptionId
                }
            });
            this.initWebSocket();
        }

        // Return unsubscribe function
        return () => {
            this.subscriptions.delete(subscriptionId);
            if (this.isConnected) {
                this.sendMessage({
                    type: "unsubscribe",
                    subscriptionId
                });
            }
        };
    }

    private generateSubscriptionId(): string {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private sanitizeAndConvert(obj: any): any {
        if (obj === null || obj === undefined) {
            return null;
        }

        if (typeof obj === "number" && isNaN(obj)) {
            return null;
        }

        if (typeof obj === "string" && obj.toLowerCase() === "nan") {
            return null;
        }

        if (Array.isArray(obj)) {
            return obj.map(v => this.sanitizeAndConvert(v));
        }

        if (typeof obj === "object" && !(obj instanceof Date)) {
            const newObj: Record<string, any> = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    newObj[key] = this.sanitizeAndConvert(obj[key]);
                }
            }
            return newObj;
        }

        if (typeof obj === "string") {
            const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
            if (isoDateRegex.test(obj)) {
                const date = new Date(obj);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        }

        return obj;
    }
}
