import { RealtimeService } from "./services/realtimeService";
import { PostgresDataSourceDelegate } from "./services/dataSourceDelegate";
import { DeleteEntityProps, FetchCollectionProps, FetchEntityProps, SaveEntityProps } from "@firecms/types";
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
    dataSourceDelegate: PostgresDataSourceDelegate,
    authConfig?: AuthConfig
) {
    const wss = new WebSocketServer({ server });
    const requireAuth = authConfig?.requireAuth !== false && authConfig?.jwtSecret;

    wss.on("connection", (ws) => {
        const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
                if (type === "AUTHENTICATE") {
                    const { token } = payload || {};
                    if (!token) {
                        ws.send(JSON.stringify({
                            type: "AUTH_ERROR",
                            requestId,
                            payload: { error: "Token is required" }
                        }));
                        return;
                    }

                    const user = extractUserFromToken(token);
                    if (user) {
                        const session = clientSessions.get(clientId);
                        if (session) {
                            session.user = user;
                            session.authenticated = true;
                        }
                        ws.send(JSON.stringify({
                            type: "AUTH_SUCCESS",
                            requestId,
                            payload: { userId: user.userId, roles: user.roles }
                        }));
                        console.debug(`🔐 [WebSocket Server] Client ${clientId} authenticated as ${user.userId}`);
                    } else {
                        ws.send(JSON.stringify({
                            type: "AUTH_ERROR",
                            requestId,
                            payload: { error: "Invalid or expired token" }
                        }));
                    }
                    return;
                }

                // Check authentication for protected operations
                if (requireAuth) {
                    const session = clientSessions.get(clientId);
                    if (!session?.authenticated) {
                        ws.send(JSON.stringify({
                            type: "ERROR",
                            requestId,
                            payload: {
                                error: "Authentication required",
                                code: "UNAUTHORIZED"
                            }
                        }));
                        return;
                    }
                }

                switch (type) {
                    case "FETCH_COLLECTION": {
                        console.debug("📋 [WebSocket Server] Processing FETCH_COLLECTION request");
                        const request: FetchCollectionProps = payload;
                        const entities = await dataSourceDelegate.fetchCollection(request);
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
                        const entity = await dataSourceDelegate.fetchEntity(request);
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
                        const entity = await dataSourceDelegate.saveEntity(request);
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
                        await dataSourceDelegate.deleteEntity(request);
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
                        const isUnique = await dataSourceDelegate.checkUniqueField(path, name, value, entityId, collection);
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

                    case "GENERATE_ENTITY_ID": {
                        console.debug("🆔 [WebSocket Server] Processing GENERATE_ENTITY_ID request");
                        const {
                            path,
                            collection
                        } = payload;
                        const id = dataSourceDelegate.generateEntityId(path, collection);
                        console.debug("🆔 [WebSocket Server] GENERATE_ENTITY_ID result:", id);
                        const response = {
                            type: "GENERATE_ENTITY_ID_SUCCESS",
                            payload: { id },
                            requestId
                        };
                        console.debug("🆔 [WebSocket Server] Sending GENERATE_ENTITY_ID_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                        break;

                    case "COUNT_ENTITIES": {
                        const request: FetchCollectionProps = payload;
                        const count = await dataSourceDelegate.countEntities!(request);
                        const response = {
                            type: "COUNT_ENTITIES_SUCCESS",
                            payload: { count },
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
            } catch (error: any) {
                console.error("💥 [WebSocket Server] Error handling message:", error);
                const errorResponse = {
                    type: "ERROR",
                    requestId,
                    payload: {
                        error: "Internal server error",
                        code: "INTERNAL_SERVER_ERROR",
                        message: error.message || "Internal unknown error"
                    }
                };
                console.error("💥 [WebSocket Server] Sending error response:", errorResponse);
                ws.send(JSON.stringify(errorResponse));
            }
        });
    });
}
