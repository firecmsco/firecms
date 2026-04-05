import { RealtimeService } from "./services/realtimeService";
import { PostgresDataDriver } from "./services/postgresDataDriver";
import { DataDriver, DeleteEntityProps, FetchCollectionProps, FetchEntityProps, SaveEntityProps, TableMetadata } from "@rebasepro/types";
import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { inspect } from "util";
import { extractUserFromToken, AccessTokenPayload } from "./auth";
import { AuthConfig } from "./init";

interface ClientSession {
    ws: WebSocket;
    user?: AccessTokenPayload;
    authenticated: boolean;
    /** Sliding window message counter for rate limiting */
    messageCount: number;
    messageWindowStart: number;
}

const clientSessions = new Map<string, ClientSession>();

/** Maximum messages per client per window */
const WS_RATE_LIMIT = 200;
/** Rate limit window in milliseconds (60 seconds) */
const WS_RATE_WINDOW_MS = 60_000;

/** Admin-only WebSocket message types */
const ADMIN_ONLY_TYPES = new Set([
    "EXECUTE_SQL",
    "FETCH_DATABASES",
    "FETCH_ROLES",
    "FETCH_UNMAPPED_TABLES",
    "FETCH_TABLE_METADATA",
    "FETCH_CURRENT_DATABASE"
]);

/**
 * Check if the current session belongs to an admin user.
 */
function isAdminSession(session: ClientSession | undefined): boolean {
    if (!session?.user?.roles) return false;
    return session.user.roles.some((r: unknown) => {
        if (typeof r === "string") return r === "admin";
        if (r && typeof r === "object" && "isAdmin" in r) return (r as { isAdmin: boolean }).isAdmin;
        if (r && typeof r === "object" && "id" in r) return (r as { id: string }).id === "admin";
        return false;
    });
}

export function createPostgresWebSocket(
    server: Server,
    realtimeService: RealtimeService,
    driver: PostgresDataDriver,
    authConfig?: AuthConfig
) {
    const isProduction = process.env.NODE_ENV === "production";
    /** Debug logger that is suppressed in production to prevent PII/data leaks */
    const wsDebug = (...args: unknown[]) => { if (!isProduction) console.debug(...args); };
    const wss = new WebSocketServer({ server });
    const requireAuth = authConfig?.requireAuth !== false && authConfig?.jwtSecret;

    wss.on("connection", (ws) => {
        const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        wsDebug(`WebSocket client connected: ${clientId}`);

        // Initialize client session
        clientSessions.set(clientId, { ws, authenticated: !requireAuth, messageCount: 0, messageWindowStart: Date.now() });
        realtimeService.addClient(clientId, ws);

        ws.on("close", () => {
            wsDebug(`WebSocket client disconnected: ${clientId}`);
            clientSessions.delete(clientId);
        });

        // Route all messages through RealtimeService for unified handling
        ws.on("message", async (message) => {
            let requestId: string | undefined;
            try {
                const {
                    type,
                    payload,
                    requestId: reqId
                } = JSON.parse(message.toString());
                requestId = reqId; // Capture requestId for use in catch block

                wsDebug(`[WS] ${clientId} → ${type}`, requestId ? `(${requestId})` : "");

                // Handle authentication first
                // Helper: send a canonical error frame
                const sendError = (errType: "ERROR" | "AUTH_ERROR", code: string, msg: string) => {
                    ws.send(JSON.stringify({
                        type: errType,
                        requestId,
                        payload: { error: { message: msg, code } }
                    }));
                };

                if (type === "AUTHENTICATE") {
                    const { token } = payload || {};
                    if (!token) {
                        sendError("AUTH_ERROR", "INVALID_INPUT", "Token is required");
                        return;
                    }

                    const user = extractUserFromToken(token);
                    if (user) {
                        const session = clientSessions.get(clientId);
                        if (session) {
                            session.user = user;
                            session.authenticated = true;
                        }
                        wsDebug(`[WS] replying AUTH_SUCCESS for requestId ${requestId}`);
                        ws.send(JSON.stringify({
                            type: "AUTH_SUCCESS",
                            requestId,
                            payload: { userId: user.userId, roles: user.roles }
                        }));
                        wsDebug(`🔐 [WebSocket Server] Client ${clientId} authenticated as ${user.userId}`);
                    } else {
                        wsDebug(`[WS] replying AUTH_ERROR for requestId ${requestId} (invalid token)`);
                        sendError("AUTH_ERROR", "INVALID_TOKEN", "Invalid or expired token");
                    }
                    return;
                }

                // Check authentication for protected operations
                if (requireAuth) {
                    const session = clientSessions.get(clientId);
                    if (!session?.authenticated) {
                        sendError("ERROR", "UNAUTHORIZED", "Authentication required");
                        return;
                    }
                }

                // Rate limiting: reject if client exceeds message limit
                {
                    const session = clientSessions.get(clientId);
                    if (session) {
                        const now = Date.now();
                        if (now - session.messageWindowStart > WS_RATE_WINDOW_MS) {
                            session.messageCount = 0;
                            session.messageWindowStart = now;
                        }
                        session.messageCount++;
                        if (session.messageCount > WS_RATE_LIMIT) {
                            sendError("ERROR", "RATE_LIMITED", "Too many requests. Please slow down.");
                            return;
                        }
                    }
                }

                // Admin-only operations require admin role
                if (ADMIN_ONLY_TYPES.has(type)) {
                    const session = clientSessions.get(clientId);
                    if (!isAdminSession(session)) {
                        sendError("ERROR", "FORBIDDEN", "Admin access required for this operation");
                        return;
                    }
                }

                // Helper to get correctly scoped delegate for the current request
                const getScopedDelegate = async () => {
                    const session = clientSessions.get(clientId);
                    if (session?.user && "withAuth" in driver && typeof (driver as unknown as Record<string, unknown>).withAuth === "function") {
                        try {
                            // Map AccessTokenPayload back to User interface for withAuth (roles are already string IDs from JWT)
                            const userForAuth: Record<string, unknown> = {
                                uid: session.user.userId,
                                roles: session.user.roles ?? []
                            };
                            return await (driver as unknown as { withAuth: (user: Record<string, unknown>) => Promise<DataDriver> }).withAuth(userForAuth);
                        } catch (e) {
                            console.error("Failed to create authenticated delegate for WS request", e);
                            return driver;
                        }
                    }
                    return driver;
                };

                switch (type) {
                    case "FETCH_COLLECTION": {
                        wsDebug("📋 [WebSocket Server] Processing FETCH_COLLECTION request");
                        const request: FetchCollectionProps = payload;
                        const delegate = await getScopedDelegate();
                        const entities = await delegate.fetchCollection(request);
                        wsDebug("📋 [WebSocket Server] FETCH_COLLECTION result - entities count:", entities.length);
                        const response = {
                            type: "FETCH_COLLECTION_SUCCESS",
                            payload: { entities },
                            requestId
                        };
                        wsDebug("📋 [WebSocket Server] Sending FETCH_COLLECTION_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "FETCH_ENTITY": {
                        wsDebug("📄 [WebSocket Server] Processing FETCH_ENTITY request");
                        const request: FetchEntityProps = payload;
                        const delegate = await getScopedDelegate();
                        const entity = await delegate.fetchEntity(request);
                        wsDebug("📄 [WebSocket Server] FETCH_ENTITY result:", entity);
                        const response = {
                            type: "FETCH_ENTITY_SUCCESS",
                            payload: { entity },
                            requestId
                        };
                        wsDebug("📄 [WebSocket Server] Sending FETCH_ENTITY_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "SAVE_ENTITY": {
                        wsDebug("💾 [WebSocket Server] Processing SAVE_ENTITY request");
                        const request: SaveEntityProps = payload;
                        wsDebug("💾 [WebSocket Server] Saving entity with request:", inspect(request, { depth: null, colors: true }));
                        const delegate = await getScopedDelegate();
                        const entity = await delegate.saveEntity(request);
                        wsDebug("💾 [WebSocket Server] SAVE_ENTITY result:", inspect(entity, { depth: null, colors: true }));
                        const response = {
                            type: "SAVE_ENTITY_SUCCESS",
                            payload: { entity },
                            requestId
                        };
                        wsDebug("💾 [WebSocket Server] Sending SAVE_ENTITY_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "DELETE_ENTITY": {
                        wsDebug("🗑️ [WebSocket Server] Processing DELETE_ENTITY request");
                        const request: DeleteEntityProps = payload;
                        wsDebug("🗑️ [WebSocket Server] Deleting entity:", request.entity);
                        const delegate = await getScopedDelegate();
                        await delegate.deleteEntity(request);
                        wsDebug("🗑️ [WebSocket Server] DELETE_ENTITY completed successfully");
                        const response = {
                            type: "DELETE_ENTITY_SUCCESS",
                            payload: { success: true },
                            requestId
                        };
                        wsDebug("🗑️ [WebSocket Server] Sending DELETE_ENTITY_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "CHECK_UNIQUE_FIELD": {
                        wsDebug("🔍 [WebSocket Server] Processing CHECK_UNIQUE_FIELD request");
                        const {
                            path,
                            name,
                            value,
                            entityId,
                            collection
                        } = payload;
                        const delegate = await getScopedDelegate();
                        const isUnique = await delegate.checkUniqueField(path, name, value, entityId, collection);
                        wsDebug("🔍 [WebSocket Server] CHECK_UNIQUE_FIELD result:", isUnique);
                        const response = {
                            type: "CHECK_UNIQUE_FIELD_SUCCESS",
                            payload: { isUnique },
                            requestId
                        };
                        wsDebug("🔍 [WebSocket Server] Sending CHECK_UNIQUE_FIELD_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                        break;


                    case "COUNT_ENTITIES": {
                        const request: FetchCollectionProps = payload;
                        const delegate = await getScopedDelegate();
                        const count = await delegate.countEntities!(request);
                        const response = {
                            type: "COUNT_ENTITIES_SUCCESS",
                            payload: { count },
                            requestId
                        };
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "EXECUTE_SQL": {
                        const { sql, options } = payload;
                        const delegate = await getScopedDelegate();
                        const result = await (delegate as unknown as { executeSql: (sql: string, options?: { database?: string, role?: string }) => Promise<Record<string, unknown>[]> }).executeSql(sql, options);
                        if (process.env.NODE_ENV !== "production") {
                            wsDebug(`⚡ [WebSocket Server] SQL executed. Returned ${Array.isArray(result) ? result.length : 'non-array'} rows.`);
                        }
                        const response = {
                            type: "EXECUTE_SQL_SUCCESS",
                            payload: { result },
                            requestId
                        };
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "FETCH_DATABASES": {
                        wsDebug("📚 [WebSocket Server] Processing FETCH_DATABASES request");
                        const delegate = await getScopedDelegate();
                        let databases: string[] = [];
                        if (delegate.fetchAvailableDatabases) {
                            databases = await delegate.fetchAvailableDatabases();
                        }
                        wsDebug(`📚 [WebSocket Server] Fetched ${databases.length} databases.`);
                        const response = {
                            type: "FETCH_DATABASES_SUCCESS",
                            payload: { databases },
                            requestId
                        };
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "FETCH_ROLES": {
                        wsDebug("👤 [WebSocket Server] Processing FETCH_ROLES request");
                        const delegate = await getScopedDelegate();
                        let roles: string[] = [];
                        if (delegate.fetchAvailableRoles) {
                            roles = await delegate.fetchAvailableRoles();
                        }
                        wsDebug(`👤 [WebSocket Server] Fetched ${roles.length} roles.`);
                        const response = {
                            type: "FETCH_ROLES_SUCCESS",
                            payload: { roles },
                            requestId
                        };
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "FETCH_CURRENT_DATABASE": {
                        wsDebug("📚 [WebSocket Server] Processing FETCH_CURRENT_DATABASE request");
                        const delegate = await getScopedDelegate();
                        let database: string | undefined = undefined;
                        if (delegate.fetchCurrentDatabase) {
                            database = await delegate.fetchCurrentDatabase();
                        }
                        const response = {
                            type: "FETCH_CURRENT_DATABASE_SUCCESS",
                            payload: { database },
                            requestId
                        };
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "FETCH_UNMAPPED_TABLES": {
                        wsDebug("📋 [WebSocket Server] Processing FETCH_UNMAPPED_TABLES request");
                        const delegate = await getScopedDelegate();
                        let tables: string[] = [];
                        if (delegate.fetchUnmappedTables) {
                            tables = await delegate.fetchUnmappedTables(payload?.mappedPaths);
                        }
                        wsDebug(`📋 [WebSocket Server] Fetched ${tables.length} unmapped tables.`);
                        const response = {
                            type: "FETCH_UNMAPPED_TABLES_SUCCESS",
                            payload: { tables },
                            requestId
                        };
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "FETCH_TABLE_METADATA": {
                        wsDebug("📋 [WebSocket Server] Processing FETCH_TABLE_METADATA request");
                        const { tableName } = payload;
                        const delegate = await getScopedDelegate();
                        let metadata: TableMetadata | undefined;
                        if (delegate.fetchTableMetadata) {
                            metadata = await delegate.fetchTableMetadata(tableName);
                        }
                        wsDebug(`📋 [WebSocket Server] Fetched metadata for table '${tableName}'. (${metadata?.columns?.length ?? 0} columns)`);
                        const response = {
                            type: "FETCH_TABLE_METADATA_SUCCESS",
                            payload: { metadata },
                            requestId
                        };
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    // Route subscription messages to RealtimeService
                    case "subscribe_collection":
                    case "subscribe_entity":
                    case "unsubscribe": {
                        wsDebug("🔄 [WebSocket Server] Routing subscription message to RealtimeService:", type);
                        // Attach auth context from the WS session so RLS-aware refetches work
                        const session = clientSessions.get(clientId);
                        const authContext = session?.user
                            ? { userId: session.user.userId, roles: session.user.roles ?? [] }
                            : undefined;
                        // Let RealtimeService handle these messages
                        await realtimeService.handleClientMessage(clientId, {
                            type,
                            payload,
                            subscriptionId: payload?.subscriptionId
                        }, authContext);
                        break;
                    }

                    default:
                        console.error("❌ [WebSocket Server] Unknown message type:", type);
                }
            } catch (error: unknown) {
                console.error("💥 [WebSocket Server] Error handling message:", error);
                if (error instanceof Error) {
                    console.error("Stack trace:", error.stack);
                }
                const errorMessage = process.env.NODE_ENV === "production"
                    ? "An unexpected error occurred"
                    : (error instanceof Error ? error.message : "An unexpected error occurred");
                const errorResponse = {
                    type: "ERROR",
                    requestId,
                    payload: {
                        error: {
                            message: errorMessage,
                            code: "INTERNAL_ERROR"
                        }
                    }
                };
                ws.send(JSON.stringify(errorResponse));
            }
        });
    });
}
