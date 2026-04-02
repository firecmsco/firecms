import {
    DeleteEntityProps,
    Entity,
    EntityCollection,
    FetchCollectionProps,
    FetchEntityProps,
    SaveEntityProps,
    WebSocketMessage,
    WebSocketErrorPayload,
    CollectionUpdateMessage,
    EntityUpdateMessage,
    TableColumnInfo
} from "@rebasepro/types";

/**
 * Extract error message and code from a WebSocket message payload.
 * Handles both `{ error: string }` and `{ error: { message, code } }` shapes.
 */
function extractMessageError(message: WebSocketMessage): { errorMessage: string; errorCode?: string } {
    const payload = message.payload as WebSocketErrorPayload | undefined;
    const errPayload = payload?.error;
    const errorMessage = typeof errPayload === "object"
        ? errPayload.message
        : payload?.message || (typeof errPayload === "string" ? errPayload : undefined) || message.error || "Unknown error";
    const errorCode = typeof errPayload === "object"
        ? errPayload.code
        : payload?.code;
    return { errorMessage, errorCode };
}

export interface RebaseWebSocketConfig {
    websocketUrl: string;
    /** Optional auth token getter for WebSocket authentication */
    getAuthToken?: () => Promise<string>;
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


export class RebaseWebSocketClient {
    private websocketUrl: string;
    private ws: WebSocket | null = null;
    private subscriptions = new Map<string, {
        onUpdate: (data: WebSocketMessage) => void,
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

    private pendingRequests = new Map<string, {
        resolve: (p: unknown) => void;
        reject: (p: Error) => void;
        message?: Record<string, unknown> & { _queuedResolve?: (p: unknown) => void; _queuedReject?: (p: Error) => void }
    }>();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private isConnected = false;
    private messageQueue: Record<string, unknown>[] = [];

    // Auth support
    private getAuthToken?: () => Promise<string>;
    private isAuthenticated = false;
    private authPromise: Promise<void> | null = null;

    constructor(config: RebaseWebSocketConfig) {
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
                this.authPromise = null; // Clear promise so we can retry later
                reject(new Error("Authentication timeout"));
            }, 30000);

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
        // Auto-authenticate if we are already connected but didn't have the token getter yet
        if (this.isConnected && !this.isAuthenticated && !this.authPromise) {
            console.log("WebSocket auto-authenticating after token getter set");
            this.getAuthToken().then(token => {
                if (token) {
                    this.authenticate(token).catch(e => console.warn("WebSocket auto-auth failed:", e));
                }
            }).catch(e => {
                console.warn("WebSocket auto-auth failed:", e);
            });
        }
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
                this.isAuthenticated = false;
                this.authPromise = null;

                // Re-queue pending requests so the UI doesn't hang indefinitely or crash
                for (const [reqId, request] of this.pendingRequests.entries()) {
                    if (reqId.startsWith("auth_")) {
                        request.reject(new Error("Connection closed during authentication"));
                    } else if (request.message) {
                        request.message._queuedResolve = request.resolve;
                        request.message._queuedReject = request.reject;
                        this.messageQueue.push(request.message);
                    } else {
                        request.reject(new ApiError("Connection closed", "Connection closed"));
                    }
                    this.pendingRequests.delete(reqId);
                }

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
            if (message) this.sendMessage(message);
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
                const { errorMessage, errorCode } = extractMessageError(message);
                reject(new ApiError(errorMessage, errorMessage, errorCode));
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
                    const { errorMessage, errorCode } = extractMessageError(message);
                    const error = new ApiError(errorMessage, errorMessage, errorCode);
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
                    const { errorMessage, errorCode } = extractMessageError(message);
                    const error = new ApiError(errorMessage, errorMessage, errorCode);
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
                    const { errorMessage, errorCode } = extractMessageError(message);
                    callback.onError(new ApiError(errorMessage, errorMessage, errorCode));
                }
            } else {
                callback.onUpdate(message);
            }
        }
    }

    private async ensureAuthenticated(retryCount: number = 3): Promise<void> {
        // If already authenticated or no token getter, skip
        if (this.isAuthenticated || !this.getAuthToken) return;

        // If auth is in progress, wait for it
        if (this.authPromise) {
            await this.authPromise;
            return;
        }

        // Try to authenticate with retries
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < retryCount; attempt++) {
            try {
                const token = await this.getAuthToken();
                this.authPromise = this.authenticate(token);
                await this.authPromise;
                this.authPromise = null;
                console.log("WebSocket authenticated on demand");
                return; // Success
            } catch (error: any) {
                this.authPromise = null;
                lastError = error;

                // Check if this is a "not logged in" error - don't retry, just fail
                if (error?.message?.includes("not logged in") || error?.message?.includes("Session expired")) {
                    console.warn("WebSocket auth failed: user not logged in");
                    throw error;
                }

                // For other errors, retry with backoff
                if (attempt < retryCount - 1) {
                    const delay = Math.min(1000 * (attempt + 1), 3000);
                    console.log(`WebSocket auth attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        console.warn("WebSocket on-demand auth failed after retries:", lastError);
        throw lastError;
    }

    /**
     * Force re-authentication (call after token refresh)
     */
    async reauthenticate(): Promise<void> {
        if (!this.getAuthToken) return;

        this.isAuthenticated = false;
        try {
            const token = await this.getAuthToken();
            await this.authenticate(token);
            console.log("WebSocket reauthenticated successfully");
        } catch (error) {
            console.error("WebSocket reauthentication failed:", error);
            throw error;
        }
    }

    private sendMessage(message: Record<string, unknown>): Promise<unknown> {
        // If already has a requestId (re-sending from queue), use the stored promise handlers
        const queuedMsg = message as Record<string, unknown> & { _queuedResolve?: (p: unknown) => void; _queuedReject?: (p: Error) => void };
        if (queuedMsg._queuedResolve && queuedMsg._queuedReject) {
            return this.doSendMessage(message, queuedMsg._queuedResolve, queuedMsg._queuedReject);
        }

        if (!this.isConnected || !this.ws) {
            // Queue the message and return a promise that will be resolved when actually sent
            return new Promise<unknown>((resolve, reject) => {
                const queueable = message as Record<string, unknown> & { _queuedResolve?: (p: unknown) => void; _queuedReject?: (p: Error) => void };
                queueable._queuedResolve = resolve;
                queueable._queuedReject = reject;
                this.messageQueue.push(message);
            });
        }

        return new Promise<unknown>((resolve, reject) => {
            this.doSendMessage(message, resolve, reject);
        });
    }

    private async doSendMessage(message: Record<string, unknown>, resolve: (value: unknown) => void, reject: (error: Error) => void): Promise<void> {
        // Ensure authenticated before sending non-auth messages
        if (message.type !== "AUTHENTICATE" && this.getAuthToken && !this.isAuthenticated) {
            try {
                await this.ensureAuthenticated();
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : "Authentication required";
                reject(new ApiError(errorMessage, errorMessage));
                return;
            }
        }

        const requestId = (message.requestId as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        message.requestId = requestId;

        if (!this.pendingRequests.has(requestId)) {
            this.pendingRequests.set(requestId, {
                resolve,
                reject,
                message: message as Record<string, unknown> & { _queuedResolve?: (p: unknown) => void; _queuedReject?: (p: Error) => void }
            });
        }

        try {
            this.ws!.send(JSON.stringify(message));
        } catch (error) {
            this.pendingRequests.delete(requestId);
            reject(new ApiError("Failed to send message", error instanceof Error ? error.message : "Unknown error"));
        }
    }

    // Data source methods
    async fetchCollection<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<Entity<M>[]> {
        const response = await this.sendMessage({
            type: "FETCH_COLLECTION",
            payload: props
        }) as { entities?: Entity<M>[] };
        return response.entities || [];
    }

    async fetchEntity<M extends Record<string, any>>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
        const response = await this.sendMessage({
            type: "FETCH_ENTITY",
            payload: props
        }) as { entity?: Entity<M> };
        return response.entity;
    }

    async saveEntity<M extends Record<string, any>>(props: SaveEntityProps<M>): Promise<Entity<M>> {
        const response = await this.sendMessage({
            type: "SAVE_ENTITY",
            payload: props
        }) as { entity: Entity<M> };
        return response.entity;
    }

    async deleteEntity<M extends Record<string, any>>(props: DeleteEntityProps<M>): Promise<void> {
        await this.sendMessage({
            type: "DELETE_ENTITY",
            payload: props
        });
    }

    async executeSql(sql: string, options?: { database?: string, role?: string }): Promise<Record<string, unknown>[]> {
        const response = await this.sendMessage({
            type: "EXECUTE_SQL",
            payload: { sql, options }
        }) as { result?: Record<string, unknown>[] };
        return response.result || [];
    }

    async fetchAvailableDatabases(): Promise<string[]> {
        const response = await this.sendMessage({
            type: "FETCH_DATABASES",
            payload: {}
        }) as { databases?: string[] };
        return response.databases || [];
    }

    async fetchAvailableRoles(): Promise<string[]> {
        const response = await this.sendMessage({
            type: "FETCH_ROLES"
        }) as { roles?: string[] };
        return response.roles || [];
    }

    async fetchCurrentDatabase(): Promise<string | undefined> {
        const response = await this.sendMessage({
            type: "FETCH_CURRENT_DATABASE"
        }) as { database?: string };
        return response.database;
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
        }) as { isUnique: boolean };
        return response.isUnique;
    }

    async countEntities<M extends Record<string, any>>(props: FetchCollectionProps<M>): Promise<number> {
        const response = await this.sendMessage({
            type: "COUNT_ENTITIES",
            payload: props
        }) as { count: number };
        return response.count;
    }

    async fetchUnmappedTables(mappedPaths?: string[]): Promise<string[]> {
        const response = await this.sendMessage({
            type: "FETCH_UNMAPPED_TABLES",
            payload: { mappedPaths }
        }) as { tables?: string[] };
        return response.tables || [];
    }

    async fetchTableColumns(tableName: string): Promise<TableColumnInfo[]> {
        const response = await this.sendMessage({
            type: "FETCH_TABLE_COLUMNS",
            payload: { tableName }
        }) as { columns?: TableColumnInfo[] };
        return response.columns || [];
    }

    // Subscription methods
    listenCollection<M extends Record<string, any>>(
        props: FetchCollectionProps<M>,
        onUpdate: (entities: Entity[]) => void,
        onError?: (error: Error) => void
    ): () => void {
        const subscriptionKey = this.createCollectionSubscriptionKey(props);
        const callbackId = `callback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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
        const backendSubscriptionId = `collection_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const callbackMap = new Map<string, {
            onUpdate: (entities: Entity[]) => void;
            onError?: (error: Error) => void;
        }>();
        callbackMap.set(callbackId, { onUpdate, onError });

        this.collectionSubscriptions.set(subscriptionKey, {
            backendSubscriptionId,
            callbacks: callbackMap,
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
                const callbacks = subscription.callbacks;
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
        const callbackId = `callback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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
        const backendSubscriptionId = `entity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const callbackMap = new Map<string, {
            onUpdate: (entity: Entity | null) => void;
            onError?: (error: Error) => void;
        }>();
        callbackMap.set(callbackId, { onUpdate, onError });

        this.entitySubscriptions.set(subscriptionKey, {
            backendSubscriptionId,
            callbacks: callbackMap,
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
                const callbacks = subscription.callbacks;
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
        // Use replacer function (not array) to sort keys at all levels for deterministic output
        return JSON.stringify(key, (_, value) => {
            if (value && typeof value === "object" && !Array.isArray(value)) {
                return Object.keys(value).sort().reduce((sorted: Record<string, any>, k) => {
                    sorted[k] = value[k];
                    return sorted;
                }, {});
            }
            return value;
        });
    }

    private createEntitySubscriptionKey(props: FetchEntityProps): string {
        return `${props.path}|${props.entityId}`;
    }
}
