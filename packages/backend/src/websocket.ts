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
}

const clientSessions = new Map<string, ClientSession>();

export function createPostgresWebSocket(
    server: Server,
    realtimeService: RealtimeService,
    driver: PostgresDataDriver,
    authConfig?: AuthConfig
) {
    const wss = new WebSocketServer({ server });
    const requireAuth = authConfig?.requireAuth !== false && authConfig?.jwtSecret;

    wss.on("connection", (ws) => {
        const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        console.debug(`WebSocket client connected: ${clientId}`);

        // Initialize client session
        clientSessions.set(clientId, { ws, authenticated: !requireAuth });
        realtimeService.addClient(clientId, ws);

        ws.on("close", () => {
            console.debug(`WebSocket client disconnected: ${clientId}`);
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

                console.debug(`[WS] ${clientId} → ${type}`, requestId ? `(${requestId})` : "");

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
                        console.debug(`[WS] replying AUTH_SUCCESS for requestId ${requestId}`);
                        ws.send(JSON.stringify({
                            type: "AUTH_SUCCESS",
                            requestId,
                            payload: { userId: user.userId, roles: user.roles }
                        }));
                        console.debug(`🔐 [WebSocket Server] Client ${clientId} authenticated as ${user.userId}`);
                    } else {
                        console.debug(`[WS] replying AUTH_ERROR for requestId ${requestId} (invalid token)`);
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
                        console.debug("📋 [WebSocket Server] Processing FETCH_COLLECTION request");
                        const request: FetchCollectionProps = payload;
                        const delegate = await getScopedDelegate();
                        const entities = await delegate.fetchCollection(request);
                        console.debug("📋 [WebSocket Server] FETCH_COLLECTION result - entities count:", entities.length);
                        const response = {
                            type: "FETCH_COLLECTION_SUCCESS",
                            payload: { entities },
                            requestId
                        };
                        console.debug("📋 [WebSocket Server] Sending FETCH_COLLECTION_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "FETCH_ENTITY": {
                        console.debug("📄 [WebSocket Server] Processing FETCH_ENTITY request");
                        const request: FetchEntityProps = payload;
                        const delegate = await getScopedDelegate();
                        const entity = await delegate.fetchEntity(request);
                        console.debug("📄 [WebSocket Server] FETCH_ENTITY result:", entity);
                        const response = {
                            type: "FETCH_ENTITY_SUCCESS",
                            payload: { entity },
                            requestId
                        };
                        console.debug("📄 [WebSocket Server] Sending FETCH_ENTITY_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "SAVE_ENTITY": {
                        console.debug("💾 [WebSocket Server] Processing SAVE_ENTITY request");
                        const request: SaveEntityProps = payload;
                        console.debug("💾 [WebSocket Server] Saving entity with request:", inspect(request, { depth: null, colors: true }));
                        const delegate = await getScopedDelegate();
                        const entity = await delegate.saveEntity(request);
                        console.debug("💾 [WebSocket Server] SAVE_ENTITY result:", inspect(entity, { depth: null, colors: true }));
                        const response = {
                            type: "SAVE_ENTITY_SUCCESS",
                            payload: { entity },
                            requestId
                        };
                        console.debug("💾 [WebSocket Server] Sending SAVE_ENTITY_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "DELETE_ENTITY": {
                        console.debug("🗑️ [WebSocket Server] Processing DELETE_ENTITY request");
                        const request: DeleteEntityProps = payload;
                        console.debug("🗑️ [WebSocket Server] Deleting entity:", request.entity);
                        const delegate = await getScopedDelegate();
                        await delegate.deleteEntity(request);
                        console.debug("🗑️ [WebSocket Server] DELETE_ENTITY completed successfully");
                        const response = {
                            type: "DELETE_ENTITY_SUCCESS",
                            payload: { success: true },
                            requestId
                        };
                        console.debug("🗑️ [WebSocket Server] Sending DELETE_ENTITY_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "CHECK_UNIQUE_FIELD": {
                        console.debug("🔍 [WebSocket Server] Processing CHECK_UNIQUE_FIELD request");
                        const {
                            path,
                            name,
                            value,
                            entityId,
                            collection
                        } = payload;
                        const delegate = await getScopedDelegate();
                        const isUnique = await delegate.checkUniqueField(path, name, value, entityId, collection);
                        console.debug("🔍 [WebSocket Server] CHECK_UNIQUE_FIELD result:", isUnique);
                        const response = {
                            type: "CHECK_UNIQUE_FIELD_SUCCESS",
                            payload: { isUnique },
                            requestId
                        };
                        console.debug("🔍 [WebSocket Server] Sending CHECK_UNIQUE_FIELD_SUCCESS response");
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
                        console.debug("⚡ [WebSocket Server] Processing EXECUTE_SQL request");
                        const { sql, options } = payload;
                        const delegate = await getScopedDelegate();
                        // @ts-ignore
                        const result = await delegate.executeSql(sql, options);
                        console.debug(`⚡ [WebSocket Server] SQL executed. Returned ${Array.isArray(result) ? result.length : 'non-array'} rows.`);
                        const response = {
                            type: "EXECUTE_SQL_SUCCESS",
                            payload: { result },
                            requestId
                        };
                        console.debug("⚡ [WebSocket Server] Sending EXECUTE_SQL_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "FETCH_DATABASES": {
                        console.debug("📚 [WebSocket Server] Processing FETCH_DATABASES request");
                        const delegate = await getScopedDelegate();
                        let databases: string[] = [];
                        if (delegate.fetchAvailableDatabases) {
                            databases = await delegate.fetchAvailableDatabases();
                        }
                        console.debug(`📚 [WebSocket Server] Fetched ${databases.length} databases.`);
                        const response = {
                            type: "FETCH_DATABASES_SUCCESS",
                            payload: { databases },
                            requestId
                        };
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "FETCH_ROLES": {
                        console.debug("👤 [WebSocket Server] Processing FETCH_ROLES request");
                        const delegate = await getScopedDelegate();
                        let roles: string[] = [];
                        if (delegate.fetchAvailableRoles) {
                            roles = await delegate.fetchAvailableRoles();
                        }
                        console.debug(`👤 [WebSocket Server] Fetched ${roles.length} roles.`);
                        const response = {
                            type: "FETCH_ROLES_SUCCESS",
                            payload: { roles },
                            requestId
                        };
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "FETCH_CURRENT_DATABASE": {
                        console.debug("📚 [WebSocket Server] Processing FETCH_CURRENT_DATABASE request");
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
                        console.debug("📋 [WebSocket Server] Processing FETCH_UNMAPPED_TABLES request");
                        const delegate = await getScopedDelegate();
                        let tables: string[] = [];
                        if (delegate.fetchUnmappedTables) {
                            tables = await delegate.fetchUnmappedTables(payload?.mappedPaths);
                        }
                        console.debug(`📋 [WebSocket Server] Fetched ${tables.length} unmapped tables.`);
                        const response = {
                            type: "FETCH_UNMAPPED_TABLES_SUCCESS",
                            payload: { tables },
                            requestId
                        };
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "FETCH_TABLE_METADATA": {
                        console.debug("📋 [WebSocket Server] Processing FETCH_TABLE_METADATA request");
                        const { tableName } = payload;
                        const delegate = await getScopedDelegate();
                        let metadata: TableMetadata | undefined;
                        if (delegate.fetchTableMetadata) {
                            metadata = await delegate.fetchTableMetadata(tableName);
                        }
                        console.debug(`📋 [WebSocket Server] Fetched metadata for table '${tableName}'. (${metadata?.columns?.length ?? 0} columns)`);
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
                    case "unsubscribe":
                        console.debug("🔄 [WebSocket Server] Routing subscription message to RealtimeService:", type);
                        // Let RealtimeService handle these messages
                        await realtimeService.handleClientMessage(clientId, {
                            type,
                            payload,
                            subscriptionId: payload?.subscriptionId
                        });
                        break;

                    default:
                        console.error("❌ [WebSocket Server] Unknown message type:", type);
                }
            } catch (error: unknown) {
                console.error("💥 [WebSocket Server] Error handling message:", error);
                if (error instanceof Error) {
                    console.error("Stack trace:", error.stack);
                }
                const errorResponse = {
                    type: "ERROR",
                    requestId,
                    payload: {
                        error: {
                            message: error instanceof Error ? error.message : "An unexpected error occurred",
                            code: "INTERNAL_ERROR"
                        }
                    }
                };
                ws.send(JSON.stringify(errorResponse));
            }
        });
    });
}
