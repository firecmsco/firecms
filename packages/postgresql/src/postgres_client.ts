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
    /** Optional auth token getter for WebSocket authentication */
    getAuthToken?: () => Promise<string>;
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
    private subscriptions = new Map<string, {
        onUpdate: (data: any) => void,
        onError?: (error: Error) => void
    }>();

    // New: Subscription deduplication management with optimizations
    private collectionSubscriptions = new Map<string, {
        backendSubscriptionId: string;
        callbacks: Map<string, {
            onUpdate: (entities: Entity[]) => void;
            onError?: (error: Error) => void;
        }>;
        props: FetchCollectionProps;
        latestData?: Entity[]; // Cache the latest data
        lastUpdated?: number; // Timestamp for cache invalidation
        isInitialDataReceived?: boolean; // Track if we got initial data
    }>();

    private entitySubscriptions = new Map<string, {
        backendSubscriptionId: string;
        callbacks: Map<string, {
            onUpdate: (entity: Entity | null) => void;
            onError?: (error: Error) => void;
        }>;
        props: FetchEntityProps;
        latestData?: Entity | null; // Cache the latest data
        lastUpdated?: number; // Timestamp for cache invalidation
        isInitialDataReceived?: boolean; // Track if we got initial data
    }>();

    // Maps to quickly find subscription by backend subscription ID
    private backendToCollectionKey = new Map<string, string>();
    private backendToEntityKey = new Map<string, string>();

    // Optimization: Debounce subscription creation to handle rapid component mounting/unmounting
    private pendingSubscriptions = new Map<string, {
        timer: NodeJS.Timeout;
        callbacks: Array<{
            onUpdate: (entities: Entity[]) => void;
            onError?: (error: Error) => void;
            callbackId: string;
        }>;
        props: FetchCollectionProps;
    }>();

    // Optimization: Connection status tracking
    private connectionPromise: Promise<void> | null = null;
    private isReconnecting = false;

    private pendingRequests = new Map<string, { resolve: (p: any) => void; reject: (p: any) => void }>();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private isConnected = false;
    private messageQueue: any[] = [];

    // Auth support
    private getAuthToken?: () => Promise<string>;
    private isAuthenticated = false;
    private authPromise: Promise<void> | null = null;

    constructor(config: PostgresDataSourceConfig) {
        this.websocketUrl = config.websocketUrl;
        this.getAuthToken = config.getAuthToken;
        this.initWebSocket();
    }

    /**
     * Authenticate the WebSocket connection
     */
    async authenticate(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const requestId = `auth_${Date.now()}`;

            const timeout = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error("Authentication timeout"));
            }, 10000);

            this.pendingRequests.set(requestId, {
                resolve: () => {
                    clearTimeout(timeout);
                    this.isAuthenticated = true;
                    resolve();
                },
                reject: (error) => {
                    clearTimeout(timeout);
                    reject(error);
                }
            });

            const message = {
                type: "AUTHENTICATE",
                requestId,
                payload: { token }
            };

            if (!this.isConnected || !this.ws) {
                this.messageQueue.unshift(message); // Auth should be first
            } else {
                this.ws.send(JSON.stringify(message));
            }
        });
    }

    /**
     * Set the auth token getter function
     */
    setAuthTokenGetter(getAuthToken: () => Promise<string>): void {
        this.getAuthToken = getAuthToken;
    }

    // Initialize WebSocket connection
    private initWebSocket() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        try {
            this.ws = new WebSocket(this.websocketUrl);

            this.ws.onopen = async () => {
                console.log("Connected to PostgreSQL backend");
                this.isConnected = true;
                this.reconnectAttempts = 0;

                // Auto-authenticate if token getter is available
                if (this.getAuthToken && !this.isAuthenticated) {
                    try {
                        const token = await this.getAuthToken();
                        await this.authenticate(token);
                        console.log("WebSocket auto-authenticated");
                    } catch (error) {
                        console.warn("WebSocket auto-auth failed, requests may fail:", error);
                    }
                }

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
        const {
            type,
            requestId,
            subscriptionId
        } = message;

        // Handle responses to pending requests
        if (requestId && this.pendingRequests.has(requestId)) {
            const {
                resolve,
                reject
            } = this.pendingRequests.get(requestId)!;
            this.pendingRequests.delete(requestId);

            if (type === "ERROR" || type === "AUTH_ERROR" || message.error) {
                reject(new ApiError(message.payload?.message || message.payload?.error || message.error || "Unknown error", message.payload?.error ?? message.error, message.payload?.code));
            } else {
                resolve(message.payload || message);
            }
            return;
        }

        // Handle subscription updates for collection subscriptions
        if (subscriptionId && type === "collection_update") {
            const subscriptionKey = this.backendToCollectionKey.get(subscriptionId);
            if (subscriptionKey) {
                const collectionSub = this.collectionSubscriptions.get(subscriptionKey);
                if (collectionSub) {
                    const entities = message.entities || [];
                    // Cache the latest data with optimizations
                    collectionSub.latestData = entities;
                    collectionSub.lastUpdated = Date.now();
                    collectionSub.isInitialDataReceived = true;

                    // Notify all callbacks for this subscription
                    collectionSub.callbacks.forEach(callback => {
                        try {
                            callback.onUpdate(entities);
                        } catch (error) {
                            console.error("Error in collection subscription callback:", error);
                            if (callback.onError) {
                                callback.onError(error instanceof Error ? error : new Error(String(error)));
                            }
                        }
                    });
                    return;
                }
            }
        }

        // Handle subscription updates for entity subscriptions
        if (subscriptionId && type === "entity_update") {
            const subscriptionKey = this.backendToEntityKey.get(subscriptionId);
            if (subscriptionKey) {
                const entitySub = this.entitySubscriptions.get(subscriptionKey);
                if (entitySub) {
                    const entity = message.entity ?? null;
                    // Cache the latest data with optimizations
                    entitySub.latestData = entity;
                    entitySub.lastUpdated = Date.now();
                    entitySub.isInitialDataReceived = true;

                    // Notify all callbacks for this subscription
                    entitySub.callbacks.forEach(callback => {
                        try {
                            callback.onUpdate(entity);
                        } catch (error) {
                            console.error("Error in entity subscription callback:", error);
                            if (callback.onError) {
                                callback.onError(error instanceof Error ? error : new Error(String(error)));
                            }
                        }
                    });
                    return;
                }
            }
        }

        // Handle subscription errors
        if (subscriptionId && (type === "ERROR" || message.error)) {
            const collectionKey = this.backendToCollectionKey.get(subscriptionId);
            if (collectionKey) {
                const collectionSub = this.collectionSubscriptions.get(collectionKey);
                if (collectionSub) {
                    const error = new ApiError(message.payload?.message || message.error || "Unknown error", message.payload?.error ?? message.error, message.payload?.code);
                    collectionSub.callbacks.forEach(callback => {
                        if (callback.onError) {
                            callback.onError(error);
                        }
                    });
                    return;
                }
            }

            const entityKey = this.backendToEntityKey.get(subscriptionId);
            if (entityKey) {
                const entitySub = this.entitySubscriptions.get(entityKey);
                if (entitySub) {
                    const error = new ApiError(message.payload?.message || message.error || "Unknown error", message.payload?.error ?? message.error, message.payload?.code);
                    entitySub.callbacks.forEach(callback => {
                        if (callback.onError) {
                            callback.onError(error);
                        }
                    });
                    return;
                }
            }
        }

        // Legacy subscription handling (for backward compatibility)
        if (subscriptionId && this.subscriptions.has(subscriptionId)) {
            const callback = this.subscriptions.get(subscriptionId);
            if (!callback) {
                throw new Error(`Subscription callback not found for subscriptionId: ${subscriptionId}`);
            }
            if (message.type === "ERROR" || message.error) {
                if (callback.onError) {
                    callback.onError(new ApiError(message.payload?.message || message.error || "Unknown error", message.payload?.error ?? message.error, message.payload?.code));
                }
            } else {
                callback.onUpdate(message);
            }
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

            this.pendingRequests.set(requestId, {
                resolve,
                reject
            });

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
            payload: {
                path,
                name,
                value,
                entityId,
                collection
            }
        });
        return response.isUnique;
    }

    generateEntityId(path: string, collection?: EntityCollection): Promise<string> {
        return this.sendMessage({
            type: "GENERATE_ENTITY_ID",
            payload: {
                path,
                collection
            }
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
        onUpdate: (entities: Entity[]) => void,
        onError?: (error: Error) => void
    ): () => void {
        const subscriptionKey = this.createCollectionSubscriptionKey(props);
        const callbackId = `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Check if we already have a subscription for these exact parameters
        const existingSubscription = this.collectionSubscriptions.get(subscriptionKey);

        if (existingSubscription) {
            // Reuse existing subscription - just add the new callback
            const callbackMap = existingSubscription.callbacks as Map<string, {
                onUpdate: (entities: Entity[]) => void;
                onError?: (error: Error) => void;
            }>;
            callbackMap.set(callbackId, { onUpdate, onError });

            // Immediately fire the callback with cached data if available
            if (existingSubscription.latestData !== undefined && existingSubscription.isInitialDataReceived) {
                try {
                    onUpdate(existingSubscription.latestData);
                } catch (error) {
                    console.error("Error in collection subscription callback:", error);
                    if (onError) {
                        onError(error instanceof Error ? error : new Error(String(error)));
                    }
                }
            }

            // Return unsubscribe function
            return () => {
                callbackMap.delete(callbackId);
                if (callbackMap.size === 0) {
                    // No more callbacks, unsubscribe from backend
                    this.collectionSubscriptions.delete(subscriptionKey);
                    this.backendToCollectionKey.delete(existingSubscription.backendSubscriptionId);
                    if (this.isConnected && this.ws) {
                        this.sendMessage({
                            type: "unsubscribe",
                            payload: { subscriptionId: existingSubscription.backendSubscriptionId }
                        }).catch(console.error);
                    }
                }
            };
        }

        // Create new subscription
        const backendSubscriptionId = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const callbackMap = new Map<string, {
            onUpdate: (entities: Entity[]) => void;
            onError?: (error: Error) => void;
        }>();
        callbackMap.set(callbackId, { onUpdate, onError });

        this.collectionSubscriptions.set(subscriptionKey, {
            backendSubscriptionId,
            callbacks: callbackMap as any, // Type assertion to satisfy the interface
            props
        });

        // Add reverse lookup
        this.backendToCollectionKey.set(backendSubscriptionId, subscriptionKey);

        // Send subscription request to backend
        this.sendMessage({
            type: "subscribe_collection",
            payload: {
                ...props,
                subscriptionId: backendSubscriptionId
            }
        }).catch(error => {
            if (onError) onError(error);
        });

        // Return unsubscribe function
        return () => {
            const subscription = this.collectionSubscriptions.get(subscriptionKey);
            if (subscription) {
                const callbacks = subscription.callbacks as Map<string, any>;
                callbacks.delete(callbackId);
                if (callbacks.size === 0) {
                    this.collectionSubscriptions.delete(subscriptionKey);
                    this.backendToCollectionKey.delete(subscription.backendSubscriptionId);
                    if (this.isConnected && this.ws) {
                        this.sendMessage({
                            type: "unsubscribe",
                            payload: { subscriptionId: subscription.backendSubscriptionId }
                        }).catch(console.error);
                    }
                }
            }
        };
    }

    listenEntity<M extends Record<string, any>>(
        props: FetchEntityProps<M>,
        onUpdate: (entity: Entity | null) => void,
        onError?: (error: Error) => void
    ): () => void {
        const subscriptionKey = this.createEntitySubscriptionKey(props);
        const callbackId = `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Check if we already have a subscription for these exact parameters
        const existingSubscription = this.entitySubscriptions.get(subscriptionKey);

        if (existingSubscription) {
            // Reuse existing subscription - just add the new callback
            const callbackMap = existingSubscription.callbacks as Map<string, {
                onUpdate: (entity: Entity | null) => void;
                onError?: (error: Error) => void;
            }>;
            callbackMap.set(callbackId, { onUpdate, onError });

            // Immediately fire the callback with cached data if available
            if (existingSubscription.latestData !== undefined && existingSubscription.isInitialDataReceived) {
                try {
                    onUpdate(existingSubscription.latestData);
                } catch (error) {
                    console.error("Error in entity subscription callback:", error);
                    if (onError) {
                        onError(error instanceof Error ? error : new Error(String(error)));
                    }
                }
            }

            // Return unsubscribe function
            return () => {
                callbackMap.delete(callbackId);
                if (callbackMap.size === 0) {
                    // No more callbacks, unsubscribe from backend
                    this.entitySubscriptions.delete(subscriptionKey);
                    this.backendToEntityKey.delete(existingSubscription.backendSubscriptionId);
                    if (this.isConnected && this.ws) {
                        this.sendMessage({
                            type: "unsubscribe",
                            payload: { subscriptionId: existingSubscription.backendSubscriptionId }
                        }).catch(console.error);
                    }
                }
            };
        }

        // Create new subscription
        const backendSubscriptionId = `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const callbackMap = new Map<string, {
            onUpdate: (entity: Entity | null) => void;
            onError?: (error: Error) => void;
        }>();
        callbackMap.set(callbackId, { onUpdate, onError });

        this.entitySubscriptions.set(subscriptionKey, {
            backendSubscriptionId,
            callbacks: callbackMap as any, // Type assertion to satisfy the interface
            props
        });

        // Add reverse lookup
        this.backendToEntityKey.set(backendSubscriptionId, subscriptionKey);

        // Send subscription request to backend
        this.sendMessage({
            type: "subscribe_entity",
            payload: {
                ...props,
                subscriptionId: backendSubscriptionId
            }
        }).catch(error => {
            if (onError) onError(error);
        });

        // Return unsubscribe function
        return () => {
            const subscription = this.entitySubscriptions.get(subscriptionKey);
            if (subscription) {
                const callbacks = subscription.callbacks as Map<string, any>;
                callbacks.delete(callbackId);
                if (callbacks.size === 0) {
                    this.entitySubscriptions.delete(subscriptionKey);
                    this.backendToEntityKey.delete(subscription.backendSubscriptionId);
                    if (this.isConnected && this.ws) {
                        this.sendMessage({
                            type: "unsubscribe",
                            payload: { subscriptionId: subscription.backendSubscriptionId }
                        }).catch(console.error);
                    }
                }
            }
        };
    }

    private createCollectionSubscriptionKey(props: FetchCollectionProps): string {
        // Create a deterministic key based on subscription parameters
        const key = {
            path: props.path,
            filter: props.filter,
            limit: props.limit,
            startAfter: props.startAfter,
            orderBy: props.orderBy,
            order: props.order,
            searchString: props.searchString,
            collection: props.collection?.name
        };
        return JSON.stringify(key, Object.keys(key).sort());
    }

    private createEntitySubscriptionKey(props: FetchEntityProps): string {
        return `${props.path}|${props.entityId}`;
    }
}
