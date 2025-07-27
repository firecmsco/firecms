import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { pool } from "./db/connection";
import { drizzle } from "drizzle-orm/node-postgres";
import { EntityService } from "./db/entityService";
import { RealtimeService } from "./services/realtimeService";
import { PostgresDataSourceDelegate } from "./services/dataSourceDelegate";
import { DeleteEntityProps, FetchCollectionProps, FetchEntityProps, SaveEntityProps } from "./types";
import { tables } from "./example";
import { collectionRegistry } from "./collections/registry";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const db = drizzle(pool);
export type Database = typeof db;

const realtimeService = new RealtimeService(db, tables);
const dataSourceDelegate = new PostgresDataSourceDelegate(db, realtimeService, tables);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check - only HTTP endpoint we keep
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
});

// WebSocket connection handling - now handles all operations
wss.on("connection", (ws, req) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`WebSocket client connected: ${clientId}`);

    realtimeService.addClient(clientId, ws);

    ws.on("close", () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
    });

    // Route all messages through RealtimeService for unified handling
    ws.on("message", async (message) => {
        try {
            const { type, payload } = JSON.parse(message.toString());

            console.log("🚀 [WebSocket Server] Received message from client:", clientId);
            console.log("🚀 [WebSocket Server] Message type:", type);
            console.log("🚀 [WebSocket Server] Message payload:", payload);

            switch (type) {
                case "FETCH_COLLECTION":
                    {
                        console.log("📋 [WebSocket Server] Processing FETCH_COLLECTION request");
                        const request: FetchCollectionProps = payload;
                        const entities = await dataSourceDelegate.fetchCollection(request);
                        console.log("📋 [WebSocket Server] FETCH_COLLECTION result - entities count:", entities.length);
                        const response = { type: "FETCH_COLLECTION_SUCCESS", payload: { entities } };
                        console.log("📋 [WebSocket Server] Sending FETCH_COLLECTION_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                    break;

                case "FETCH_ENTITY":
                    {
                        console.log("📄 [WebSocket Server] Processing FETCH_ENTITY request");
                        const request: FetchEntityProps = payload;
                        const entity = await dataSourceDelegate.fetchEntity(request);
                        console.log("📄 [WebSocket Server] FETCH_ENTITY result:", entity);
                        const response = { type: "FETCH_ENTITY_SUCCESS", payload: { entity } };
                        console.log("📄 [WebSocket Server] Sending FETCH_ENTITY_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                    break;

                case "SAVE_ENTITY":
                    {
                        console.log("💾 [WebSocket Server] Processing SAVE_ENTITY request");
                        const request: SaveEntityProps = payload;
                        console.log("💾 [WebSocket Server] Saving entity with request:", request);
                        const entity = await dataSourceDelegate.saveEntity(request);
                        console.log("💾 [WebSocket Server] SAVE_ENTITY result:", entity);
                        const response = { type: "SAVE_ENTITY_SUCCESS", payload: { entity } };
                        console.log("💾 [WebSocket Server] Sending SAVE_ENTITY_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                    break;

                case "DELETE_ENTITY":
                    {
                        console.log("🗑️ [WebSocket Server] Processing DELETE_ENTITY request");
                        const request: DeleteEntityProps = payload;
                        console.log("🗑️ [WebSocket Server] Deleting entity:", request.entity);
                        await dataSourceDelegate.deleteEntity(request);
                        console.log("🗑️ [WebSocket Server] DELETE_ENTITY completed successfully");
                        const response = { type: "DELETE_ENTITY_SUCCESS", payload: { success: true } };
                        console.log("🗑️ [WebSocket Server] Sending DELETE_ENTITY_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                    break;

                case "CHECK_UNIQUE_FIELD":
                    {
                        console.log("🔍 [WebSocket Server] Processing CHECK_UNIQUE_FIELD request");
                        const { path, name, value, entityId, collection } = payload;
                        const isUnique = await dataSourceDelegate.checkUniqueField(path, name, value, entityId, collection);
                        console.log("🔍 [WebSocket Server] CHECK_UNIQUE_FIELD result:", isUnique);
                        const response = { type: "CHECK_UNIQUE_FIELD_SUCCESS", payload: { isUnique } };
                        console.log("🔍 [WebSocket Server] Sending CHECK_UNIQUE_FIELD_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                    break;

                case "GENERATE_ENTITY_ID":
                    {
                        console.log("🆔 [WebSocket Server] Processing GENERATE_ENTITY_ID request");
                        const { path, collection } = payload;
                        const id = dataSourceDelegate.generateEntityId(path, collection);
                        console.log("🆔 [WebSocket Server] GENERATE_ENTITY_ID result:", id);
                        const response = { type: "GENERATE_ENTITY_ID_SUCCESS", payload: { id } };
                        console.log("🆔 [WebSocket Server] Sending GENERATE_ENTITY_ID_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                    break;

                case "COUNT_ENTITIES":
                    {
                        console.log("🔢 [WebSocket Server] Processing COUNT_ENTITIES request");
                        const request: FetchCollectionProps = payload;
                        const count = await dataSourceDelegate.countEntities!(request);
                        console.log("🔢 [WebSocket Server] COUNT_ENTITIES result:", count);
                        const response = { type: "COUNT_ENTITIES_SUCCESS", payload: { count } };
                        console.log("🔢 [WebSocket Server] Sending COUNT_ENTITIES_SUCCESS response");
                        ws.send(JSON.stringify(response));
                    }
                    break;

                // Route subscription messages to RealtimeService
                case "subscribe_collection":
                case "subscribe_entity":
                case "unsubscribe":
                    console.log("🔄 [WebSocket Server] Routing subscription message to RealtimeService:", type);
                    // Let RealtimeService handle these messages
                    await realtimeService.handleClientMessage(clientId, { type, payload, subscriptionId: payload?.subscriptionId });
                    break;

                default:
                    console.error("❌ [WebSocket Server] Unknown message type:", type);
            }
        } catch (error: any) {
            console.error("💥 [WebSocket Server] Error handling message:", error);
            const errorResponse = {
                type: "ERROR",
                payload: {
                    error: "Internal server error",
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message || "Unknown error"
                }
            };
            console.error("💥 [WebSocket Server] Sending error response:", errorResponse);
            ws.send(JSON.stringify(errorResponse));
        }
    });
});

// Error handling middleware
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
        message: error.message
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("📡 WebSocket server ready for all operations");
    console.log("🗄️ PostgreSQL backend with Drizzle ORM initialized");
    console.log("🔄 Real-time sync enabled via WebSockets");
    console.log(`📚 ${collectionRegistry.getAll().length} collections registered`);
});

export { app, server, dataSourceDelegate };
