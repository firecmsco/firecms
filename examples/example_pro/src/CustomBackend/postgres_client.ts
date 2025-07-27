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
    type: "subscribe_collection" | "subscribe_entity" | "unsubscribe" | "collection_update" | "entity_update" | "error";
    payload?: any;
    subscriptionId?: string;
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
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor(config: PostgresDataSourceConfig) {
        this.baseUrl = config.baseUrl.replace(/\/$/, "");
        this.websocketUrl = config.websocketUrl || config.baseUrl.replace("http", "ws");
        this.headers = config.headers || {};
    }

    // Initialize WebSocket connection
    private initWebSocket() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        try {
            this.ws = new WebSocket(this.websocketUrl);

            this.ws.onopen = () => {
                console.log("Connected to PostgreSQL backend");
                this.reconnectAttempts = 0;
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
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error("WebSocket error:", error);
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

    private handleWebSocketMessage(message: WebSocketMessage) {
        const callback = this.subscriptions.get(message.subscriptionId!);
        if (!callback) return;

        switch (message.type) {
            case "collection_update": {
                const collectionMsg = message as CollectionUpdateMessage;
                callback(this.sanitizeAndConvert(collectionMsg.entities));
                break;
            }
            case "entity_update": {
                const entityMsg = message as EntityUpdateMessage;
                callback(this.sanitizeAndConvert(entityMsg.entity));
                break;
            }
            case "error": {
                console.error("WebSocket error:", message.error);
                break;
            }
        }
    }

    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...this.headers,
                ...options.headers
            }
        });

        const json = await response.json();

        if (!response.ok || json.error) {
            const message = json.message;
            const code = json.code || "API_ERROR";
            const error = json.error || "API_ERROR";
            throw new ApiError(message, error, code);
        }

        return this.sanitizeAndConvert(json);
    }

    // API methods that match FireCMS interface
    async fetchCollection<M extends Record<string, any>>(
        request: FetchCollectionProps<M>
    ): Promise<Entity<M>[]> {
        const response = await this.makeRequest<{ entities: Entity<M>[] }>("/api/collections/fetch", {
            method: "POST",
            body: JSON.stringify(request)
        });
        return response.entities;
    }

    async fetchEntity<M extends Record<string, any>>(
        request: FetchEntityProps<M>
    ): Promise<Entity<M> | undefined> {
        const response = await this.makeRequest<{ entity: Entity<M> | null }>("/api/entities/fetch", {
            method: "POST",
            body: JSON.stringify(request)
        });
        return response.entity || undefined;
    }

    async saveEntity<M extends Record<string, any>>(
        request: SaveEntityProps<M>
    ): Promise<Entity<M>> {
        const response = await this.makeRequest<{ entity: Entity<M> }>("/api/entities/save", {
            method: "POST",
            body: JSON.stringify(this.sanitizeAndConvert(request))
        });
        return response.entity;
    }

    async deleteEntity<M extends Record<string, any>>(
        request: DeleteEntityProps<M>
    ): Promise<void> {
        await this.makeRequest("/api/entities/delete", {
            method: "DELETE",
            body: JSON.stringify(request)
        });
    }

    async checkUniqueField(
        path: string,
        name: string,
        value: any,
        entityId?: string,
        collection?: EntityCollection
    ): Promise<boolean> {
        const response = await this.makeRequest<{ isUnique: boolean }>("/api/entities/check-unique", {
            method: "POST",
            body: JSON.stringify({
                path,
                name,
                value,
                entityId,
                collection
            })
        });
        return response.isUnique;
    }

    async countEntities<M extends Record<string, any>>(
        request: FetchCollectionProps<M>
    ): Promise<number> {
        const response = await this.makeRequest<{ count: number }>("/api/collections/count", {
            method: "POST",
            body: JSON.stringify(request)
        });
        return response.count;
    }

    // Real-time subscription methods
    listenCollection<M extends Record<string, any>>(
        request: Omit<FetchCollectionProps<M>, "subscriptionId">,
        onUpdate: (entities: Entity<M>[]) => void,
        _onError?: (error: Error) => void
    ): () => void {
        const subscriptionId = this.generateSubscriptionId();

        this.initWebSocket();
        this.subscriptions.set(subscriptionId, onUpdate);

        // Send subscription request via WebSocket
        const sendSubscription = () => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: "subscribe_collection",
                    payload: {
                        ...request,
                        subscriptionId
                    }
                }));
            } else {
                setTimeout(sendSubscription, 100);
            }
        };
        sendSubscription();

        // Return unsubscribe function
        return () => {
            this.subscriptions.delete(subscriptionId);
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: "unsubscribe",
                    subscriptionId
                }));
            }
        };
    }

    listenEntity<M extends Record<string, any>>(
        request: Omit<FetchEntityProps<M>, "subscriptionId">,
        onUpdate: (entity: Entity<M> | null) => void,
        _onError?: (error: Error) => void
    ): () => void {
        const subscriptionId = this.generateSubscriptionId();

        this.initWebSocket();
        this.subscriptions.set(subscriptionId, onUpdate);

        // Send subscription request via WebSocket
        const sendSubscription = () => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: "subscribe_entity",
                    payload: {
                        ...request,
                        subscriptionId
                    }
                }));
            } else {
                setTimeout(sendSubscription, 100);
            }
        };
        sendSubscription();

        // Return unsubscribe function
        return () => {
            this.subscriptions.delete(subscriptionId);
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: "unsubscribe",
                    subscriptionId
                }));
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
