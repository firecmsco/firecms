import { WebSocket } from "ws";
import { EventEmitter } from "events";
import { Client as PgClient } from "pg";
import { randomUUID } from "crypto";
import { EntityService } from "../db/entityService";

import { Entity, FetchCollectionProps, ListenCollectionProps, ListenEntityProps, DataDriver, CollectionUpdateMessage, EntityUpdateMessage, CollectionEntityPatchMessage, WebSocketMessage } from "@rebasepro/types";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql as drizzleSql } from "drizzle-orm";
import { RealtimeProvider, CollectionSubscriptionConfig, EntitySubscriptionConfig } from "../db/interfaces";
import { BackendCollectionRegistry } from "../collections/BackendCollectionRegistry";

/** Channel name used for Postgres LISTEN/NOTIFY cross-instance realtime. */
const PG_NOTIFY_CHANNEL = "rebase_entity_changes";

/**
 * Auth context stored per-subscription so real-time refetches respect RLS.
 * Mirrors the session variables set by PostgresDataDriver.withAuth().
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
            filter?: Record<string, unknown>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: Record<string, unknown>;
            databaseId?: string;
            searchString?: string;
        };
        // Auth context for RLS — when set, refetches run in a transaction
        // with set_config('app.user_id', ...) / set_config('app.user_roles', ...)
        authContext?: SubscriptionAuthContext;
    }>();

    // Add callback storage for DataDriver subscriptions
    private subscriptionCallbacks = new Map<string, (data: Entity[] | Entity | null) => void>();

    private driver?: DataDriver;

    // ── Cross-instance LISTEN/NOTIFY ──
    /** Unique identifier for this process instance, used to skip own notifications. */
    private readonly instanceId = `inst_${randomUUID().slice(0, 8)}`;
    /** Dedicated pg.Client for LISTEN (outside the Drizzle pool). */
    private listenClient?: PgClient;
    /** Connection string used for reconnecting the LISTEN client. */
    private listenConnectionString?: string;
    /** Whether cross-instance broadcasting is active. */
    private broadcasting = false;
    /** Reconnection timer handle. */
    private reconnectTimer?: ReturnType<typeof setTimeout>;
    /** Debounce timers for collection refetches to prevent refetch storms. */
    private refetchTimers = new Map<string, ReturnType<typeof setTimeout>>();
    /** Debounce window (ms) for coalescing rapid entity updates into a single correctness refetch. */
    private static readonly REFETCH_DEBOUNCE_MS = 300;

    constructor(private db: NodePgDatabase<any>, private registry: BackendCollectionRegistry) {
        super();
        this.entityService = new EntityService(db, registry);
    }

    /** Whether to emit verbose debug logs (disabled in production). */
    private static readonly DEBUG = process.env.NODE_ENV !== "production";
    private debugLog(...args: unknown[]) {
        if (RealtimeService.DEBUG) console.debug(...args);
    }

    setDataDriver(driver: DataDriver) {
        this.driver = driver;
    }

    // Make subscriptions accessible for DataDriver
    get subscriptions() {
        return this._subscriptions;
    }

    // Add public method to register DataDriver subscriptions
    registerDataDriverSubscription(subscriptionId: string, subscription: {
        clientId: string;
        type: "collection" | "entity";
        path: string;
        entityId?: string | number;
        collectionRequest?: {
            filter?: Record<string, unknown>;
            orderBy?: string;
            order?: "desc" | "asc";
            limit?: number;
            startAfter?: Record<string, unknown>;
            databaseId?: string;
            searchString?: string;
        };
        authContext?: SubscriptionAuthContext;
    }) {
        this.debugLog("📋 [RealtimeService] Registering DataDriver subscription:", subscriptionId, subscription.authContext ? "(with auth)" : "(no auth)");
        this._subscriptions.set(subscriptionId, subscription);
    }

    // Add callback management methods
    addSubscriptionCallback(subscriptionId: string, callback: (data: Entity[] | Entity | null) => void) {
        this.debugLog("📋 [RealtimeService] Adding callback for subscription:", subscriptionId);
        this.subscriptionCallbacks.set(subscriptionId, callback);
    }

    removeSubscriptionCallback(subscriptionId: string) {
        this.debugLog("📋 [RealtimeService] Removing callback for subscription:", subscriptionId);
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
                filter: config.filter as Record<string, unknown> | undefined,
                orderBy: config.orderBy,
                order: config.order,
                limit: config.limit,
                startAfter: config.startAfter as Record<string, unknown> | undefined,
                databaseId: config.databaseId,
                searchString: config.searchString
            }
        });

        if (callback) {
            this.subscriptionCallbacks.set(subscriptionId, callback as (data: Entity[] | Entity | null) => void);
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
            this.subscriptionCallbacks.set(subscriptionId, callback as (data: Entity[] | Entity | null) => void);
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
    async handleClientMessage(clientId: string, message: WebSocketMessage, authContext?: SubscriptionAuthContext) {
        await this.handleMessage(clientId, message, authContext);
    }

    async removeClient(clientId: string) {
        this.clients.delete(clientId);

        // Remove all subscriptions, callbacks, and pending refetch timers for this client
        for (const [subscriptionId, subscription] of this._subscriptions.entries()) {
            if (subscription.clientId === clientId) {
                this._subscriptions.delete(subscriptionId);
                this.subscriptionCallbacks.delete(subscriptionId);

                // Cancel any pending debounced refetch timers
                const wsTimerKey = `ws_${subscriptionId}`;
                const drvTimerKey = `drv_${subscriptionId}`;
                const wsTimer = this.refetchTimers.get(wsTimerKey);
                if (wsTimer) { clearTimeout(wsTimer); this.refetchTimers.delete(wsTimerKey); }
                const drvTimer = this.refetchTimers.get(drvTimerKey);
                if (drvTimer) { clearTimeout(drvTimer); this.refetchTimers.delete(drvTimerKey); }
            }
        }
    }

    private async handleMessage(clientId: string, message: WebSocketMessage, authContext?: SubscriptionAuthContext) {
        switch (message.type) {
            case "subscribe_collection":
                await this.handleCollectionSubscription(clientId, message.payload as RealTimeListenCollectionProps, authContext);
                break;
            case "subscribe_entity":
                await this.handleEntitySubscription(clientId, message.payload as RealTimeListenEntityProps, authContext);
                break;
            case "unsubscribe":
                await this.handleUnsubscribe(clientId, message.subscriptionId!);
                break;
            default:
                this.sendError(clientId, "Unknown message type " + message.type, message.subscriptionId);
        }
    }

    private async handleCollectionSubscription(clientId: string, request: RealTimeListenCollectionProps, authContext?: SubscriptionAuthContext) {
        const subscriptionId = request.subscriptionId;

        try {
            // Store subscription with full request parameters and auth context for RLS
            this._subscriptions.set(subscriptionId, {
                clientId,
                type: "collection",
                path: request.path,
                collectionRequest: {
                    filter: request.filter,
                    orderBy: request.orderBy,
                    order: request.order,
                    limit: request.limit,
                    startAfter: request.startAfter as Record<string, unknown> | undefined,
                    databaseId: request.collection?.databaseId,
                    searchString: request.searchString
                },
                authContext
            });

            // Send initial data
            let entities;
            if (this.driver) {
                const collection = this.registry.getCollectionByPath(request.path);
                entities = await this.driver.fetchCollection({
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
                    startAfter: request.startAfter as Record<string, unknown> | undefined,
                    databaseId: request.collection?.databaseId,
                    searchString: request.searchString
                });
            }

            this.sendCollectionUpdate(clientId, subscriptionId, entities);

        } catch (error) {
            this.sendError(clientId, `Failed to subscribe to collection: ${error}`, subscriptionId);
        }
    }

    private async handleEntitySubscription(clientId: string, request: RealTimeListenEntityProps, authContext?: SubscriptionAuthContext) {
        const subscriptionId = request.subscriptionId;

        try {
            // Store subscription in memory with auth context for RLS
            this._subscriptions.set(subscriptionId, {
                clientId,
                type: "entity",
                path: request.path,
                entityId: request.entityId,
                authContext
            });

            // Send initial data
            let entity;
            if (this.driver) {
                const collection = this.registry.getCollectionByPath(request.path);
                entity = await this.driver.fetchEntity({
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
        this.subscriptionCallbacks.delete(subscriptionId);
        // Cancel any pending debounced refetch
        for (const prefix of ["ws_", "drv_"]) {
            const key = `${prefix}${subscriptionId}`;
            const timer = this.refetchTimers.get(key);
            if (timer) { clearTimeout(timer); this.refetchTimers.delete(key); }
        }
    }

    /**
     * Enhanced notification method that handles nested relation updates.
     * @param broadcast When true (default), also sends a pg_notify so other instances
     *                  pick up the change. Set to false when handling an incoming
     *                  cross-instance notification to avoid infinite loops.
     */
    async notifyEntityUpdate(path: string, entityId: string, entity: Entity | null, databaseId?: string, broadcast = true) {
        this.debugLog("🔔 [RealtimeService] notifyEntityUpdate called for path:", path, "entityId:", entityId, "isDelete:", entity === null);

        // Get all paths that need to be notified - the direct path plus any parent paths
        const pathsToNotify = [path];

        // If this is a nested relation path (like "posts/70/tags"), also notify parent paths
        if (path.includes("/") && path.split("/").length > 1) {
            const parentPaths = this.getParentPaths(path);
            pathsToNotify.push(...parentPaths);
            this.debugLog(`🔗 [RealtimeService] Nested path detected. Will notify paths: ${pathsToNotify.join(", ")}`);
        }

        // Process each path that needs notification
        for (const notifyPath of pathsToNotify) {
            await this.notifyPathUpdate(notifyPath, path, entityId, entity, databaseId);
        }

        // Broadcast to other instances via pg_notify (only for local mutations)
        if (broadcast && this.broadcasting) {
            try {
                await this.broadcastChange(path, entityId, databaseId);
            } catch (err) {
                console.error("❌ [RealtimeService] Failed to broadcast change via pg_notify:", err);
            }
        }

        this.debugLog("🔔 [RealtimeService] notifyEntityUpdate completed for path:", path);
    }

    /**
     * Notify subscriptions for a specific path
     */
    private async notifyPathUpdate(notifyPath: string, originalPath: string, entityId: string, entity: Entity | null, _databaseId?: string) {
        this.debugLog(`📡 [RealtimeService] Notifying path: ${notifyPath} (original: ${originalPath})`);

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

        this.debugLog(`📡 [RealtimeService] Found ${allSubscriptions.length} subscriptions for path: ${notifyPath}`);

        // Separate WebSocket subscriptions from DataDriver callback subscriptions
        const webSocketSubscriptions = allSubscriptions.filter(([, sub]) =>
            sub.clientId !== "driver" && this.clients.has(sub.clientId)
        );

        const driverSubscriptions = allSubscriptions.filter(([subscriptionId, sub]) =>
            sub.clientId === "driver" && this.subscriptionCallbacks.has(subscriptionId)
        );

        // Handle WebSocket subscriptions
        for (const [subscriptionId, subscription] of webSocketSubscriptions) {
            try {
                if (subscription.type === "entity" && notifyPath === originalPath) {
                    // Send entity update directly (only for exact path matches)
                    this.sendEntityUpdate(subscription.clientId, subscriptionId, entity);

                } else if (subscription.type === "collection" && subscription.collectionRequest) {
                    // Phase 1: Send instant entity-level patch (no DB query)
                    // This gives immediate cross-tab feedback
                    this.sendCollectionEntityPatch(subscription.clientId, subscriptionId, entityId, entity);

                    // Phase 2: Schedule a deferred full refetch for correctness
                    // Handles filter/sort changes and ensures consistency
                    this.debouncedCollectionRefetch(subscriptionId, notifyPath, subscription);
                }
            } catch (error) {
                console.error(`❌ [RealtimeService] Error processing WebSocket subscription ${subscriptionId}:`, error);
                this.sendError(subscription.clientId, `Failed to process update for subscription ${subscriptionId}`, subscriptionId);
            }
        }

        // Handle DataDriver callback subscriptions
        for (const [subscriptionId, subscription] of driverSubscriptions) {
            try {
                const callback = this.subscriptionCallbacks.get(subscriptionId);
                if (!callback) continue;

                if (subscription.type === "entity" && notifyPath === originalPath) {
                    // Call the callback directly with the entity (only for exact path matches)
                    callback(entity);

                } else if (subscription.type === "collection" && subscription.collectionRequest) {
                    // Debounce collection refetches for DataDriver subscriptions too
                    this.debouncedDriverRefetch(subscriptionId, notifyPath, subscription, callback);
                }
            } catch (error) {
                console.error(`❌ [RealtimeService] Error processing DataDriver subscription ${subscriptionId}:`, error);
            }
        }
    }

    /**
     * Debounce a collection refetch for a WebSocket subscription.
     * Coalesces rapid entity mutations into a single database query.
     */
    private debouncedCollectionRefetch(
        subscriptionId: string,
        notifyPath: string,
        subscription: { clientId: string; collectionRequest?: { filter?: Record<string, unknown>; orderBy?: string; order?: "desc" | "asc"; limit?: number; startAfter?: Record<string, unknown>; databaseId?: string; searchString?: string }; authContext?: SubscriptionAuthContext }
    ) {
        const timerKey = `ws_${subscriptionId}`;
        const existing = this.refetchTimers.get(timerKey);
        if (existing) clearTimeout(existing);

        this.refetchTimers.set(timerKey, setTimeout(async () => {
            this.refetchTimers.delete(timerKey);
            // Verify subscription still exists (client may have disconnected)
            if (!this._subscriptions.has(subscriptionId)) return;
            try {
                const entities = await this.fetchCollectionWithAuth(notifyPath, subscription.collectionRequest!, subscription.authContext);
                this.sendCollectionUpdate(subscription.clientId, subscriptionId, entities);
            } catch (error) {
                console.error(`❌ [RealtimeService] Error in debounced refetch for ${subscriptionId}:`, error);
                this.sendError(subscription.clientId, `Failed to process update for subscription ${subscriptionId}`, subscriptionId);
            }
        }, RealtimeService.REFETCH_DEBOUNCE_MS));
    }

    /**
     * Debounce a collection refetch for a DataDriver callback subscription.
     */
    private debouncedDriverRefetch(
        subscriptionId: string,
        notifyPath: string,
        subscription: { collectionRequest?: { filter?: Record<string, unknown>; orderBy?: string; order?: "desc" | "asc"; limit?: number; startAfter?: Record<string, unknown>; databaseId?: string; searchString?: string }; authContext?: SubscriptionAuthContext },
        callback: (data: Entity[] | Entity | null) => void
    ) {
        const timerKey = `drv_${subscriptionId}`;
        const existing = this.refetchTimers.get(timerKey);
        if (existing) clearTimeout(existing);

        this.refetchTimers.set(timerKey, setTimeout(async () => {
            this.refetchTimers.delete(timerKey);
            if (!this._subscriptions.has(subscriptionId)) return;
            try {
                const entities = await this.fetchCollectionWithAuth(notifyPath, subscription.collectionRequest!, subscription.authContext);
                callback(entities);
            } catch (error) {
                console.error(`❌ [RealtimeService] Error in debounced driver refetch for ${subscriptionId}:`, error);
            }
        }, RealtimeService.REFETCH_DEBOUNCE_MS));
    }

    /**
     * Fetch a collection with optional RLS auth context.
     * When authContext is provided, the fetch runs inside a transaction
     * with set_config calls so PostgreSQL RLS policies are enforced.
     */
    private async fetchCollectionWithAuth(
        notifyPath: string,
        collectionRequest: { filter?: Record<string, unknown>; orderBy?: string; order?: "desc" | "asc"; limit?: number; startAfter?: Record<string, unknown>; databaseId?: string; searchString?: string },
        authContext?: SubscriptionAuthContext
    ): Promise<Entity[]> {
        if (this.driver) {
            const collection = this.registry.getCollectionByPath(notifyPath);
            const fetchFn = async () => this.driver!.fetchCollection({
                path: notifyPath,
                collection: collection,
                filter: collectionRequest.filter as FetchCollectionProps["filter"],
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
                    const txEntityService = new EntityService(tx, this.registry);
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

        // No driver — use entityService directly (no auth wrapping possible)
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
            entities: entities as Entity<Record<string, unknown>>[]
        };
        this.sendMessage(clientId, message);
    }

    private sendEntityUpdate(clientId: string, subscriptionId: string, entity: Entity | null) {
        const message: EntityUpdateMessage = {
            type: "entity_update",
            subscriptionId,
            entity: entity as Entity<Record<string, unknown>> | null
        };
        this.sendMessage(clientId, message);
    }

    /**
     * Send a lightweight entity-level patch to a collection subscriber.
     * The client can merge this into its cached data for instant feedback.
     */
    private sendCollectionEntityPatch(clientId: string, subscriptionId: string, entityId: string, entity: Entity | null) {
        const message: CollectionEntityPatchMessage = {
            type: "collection_entity_patch",
            subscriptionId,
            entityId,
            entity: entity as Entity<Record<string, unknown>> | null
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

    private sendMessage(clientId: string, message: CollectionUpdateMessage | EntityUpdateMessage | CollectionEntityPatchMessage | { type: string; subscriptionId?: string; error?: string }) {
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
    // =============================================================================
    // Cross-Instance LISTEN/NOTIFY
    // =============================================================================

    /**
     * Enable cross-instance realtime broadcasting via Postgres LISTEN/NOTIFY.
     * Creates a dedicated pg.Client (outside the Drizzle pool) that stays
     * connected and listens for change notifications from other instances.
     *
     * This is an **optional** feature — if never called, the backend operates
     * in single-instance mode (the default, perfectly fine for most setups).
     *
     * @param connectionString Raw Postgres connection string for the LISTEN client.
     */
    async startListening(connectionString: string): Promise<void> {
        if (this.broadcasting) {
            console.warn("⚠️ [RealtimeService] startListening called but already listening. Ignoring.");
            return;
        }

        this.listenConnectionString = connectionString;
        // Set broadcasting BEFORE connecting so that scheduleReconnect()
        // works correctly if the initial connection attempt fails.
        this.broadcasting = true;
        await this.connectListenClient();
        console.log(`📡 [RealtimeService] Cross-instance realtime enabled (instanceId: ${this.instanceId})`);
    }

    /**
     * Stop listening and clean up the dedicated LISTEN connection.
     */
    async stopListening(): Promise<void> {
        this.broadcasting = false;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
        if (this.listenClient) {
            try {
                await this.listenClient.end();
            } catch { /* ignore close errors */ }
            this.listenClient = undefined;
        }
        console.log("📡 [RealtimeService] Cross-instance realtime disabled.");
    }

    /**
     * Broadcast a change notification to other instances via pg_notify.
     * Uses the main Drizzle connection (pooled) — NOT the LISTEN client.
     */
    private async broadcastChange(path: string, entityId: string, databaseId?: string): Promise<void> {
        const payload = JSON.stringify({
            sid: this.instanceId,
            p: path,
            eid: entityId,
            db: databaseId ?? null
        });
        await this.db.execute(drizzleSql`SELECT pg_notify(${PG_NOTIFY_CHANNEL}, ${payload})`);
    }

    /**
     * Create and connect the dedicated LISTEN client with auto-reconnect.
     */
    private async connectListenClient(): Promise<void> {
        if (!this.listenConnectionString) return;

        try {
            const client = new PgClient({ connectionString: this.listenConnectionString });

            client.on("error", (err) => {
                console.error("❌ [RealtimeService] LISTEN client error:", err.message);
                this.scheduleReconnect();
            });

            client.on("end", () => {
                if (this.broadcasting) {
                    console.warn("⚠️ [RealtimeService] LISTEN client disconnected unexpectedly.");
                    this.scheduleReconnect();
                }
            });

            client.on("notification", async (msg) => {
                if (!msg.payload) return;
                try {
                    const { sid, p, eid, db } = JSON.parse(msg.payload) as {
                        sid: string;
                        p: string;
                        eid: string;
                        db: string | null;
                    };

                    // Skip our own notifications — already processed locally
                    if (sid === this.instanceId) return;

                    this.debugLog(`📡 [RealtimeService] Received cross-instance notification: path=${p}, entityId=${eid}, from=${sid}`);

                    // Refetch the entity from the DB so entity subscriptions
                    // receive the actual data instead of null (which the client
                    // would interpret as "deleted").
                    let entity: Entity | null = null;
                    try {
                        if (this.driver) {
                            const collection = this.registry.getCollectionByPath(p);
                            const fetched = await this.driver.fetchEntity({
                                path: p,
                                entityId: eid,
                                collection: collection
                            });
                            entity = fetched ?? null;
                        } else {
                            const fetched = await this.entityService.fetchEntity(
                                p, eid, db ?? undefined
                            );
                            entity = fetched ?? null;
                        }
                    } catch (fetchErr) {
                        // If the fetch fails (e.g. entity was deleted), entity stays null
                        this.debugLog(`📡 [RealtimeService] Could not refetch entity ${eid} from ${p} — treating as deleted`, fetchErr);
                    }

                    // Trigger local fan-out with broadcast=false to avoid re-broadcasting
                    await this.notifyEntityUpdate(p, eid, entity, db ?? undefined, false);
                } catch (err) {
                    console.error("❌ [RealtimeService] Error processing cross-instance notification:", err);
                }
            });

            await client.connect();
            await client.query(`LISTEN ${PG_NOTIFY_CHANNEL}`);
            this.listenClient = client;

            this.debugLog(`📡 [RealtimeService] LISTEN client connected on channel "${PG_NOTIFY_CHANNEL}"`);
        } catch (err) {
            console.error("❌ [RealtimeService] Failed to connect LISTEN client:", err);
            this.scheduleReconnect();
        }
    }

    /**
     * Schedule a reconnection attempt with a fixed 3s delay.
     */
    private scheduleReconnect(): void {
        if (!this.broadcasting || this.reconnectTimer) return;

        const delay = 3000; // Fixed 3s delay; simple and predictable
        this.debugLog(`📡 [RealtimeService] Scheduling LISTEN reconnect in ${delay}ms...`);

        this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = undefined;
            if (!this.broadcasting) return;

            // Clean up old client
            if (this.listenClient) {
                try { await this.listenClient.end(); } catch { /* ignore */ }
                this.listenClient = undefined;
            }

            await this.connectListenClient();
        }, delay);
    }
}

/**
 * Alias for RealtimeService for consistent naming with other database implementations.
 * This allows code to use PostgresRealtimeProvider alongside future MongoRealtimeProvider, etc.
 */
export const PostgresRealtimeProvider = RealtimeService;
