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

const db = drizzle(pool, { schema: tables });
export type Database = typeof db;

// Initialize services
const entityService = new EntityService(db, tables);
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

    // Message handling
    ws.on("message", async (message) => {
        try {
            const { type, payload } = JSON.parse(message.toString());

            switch (type) {
                case "FETCH_COLLECTION":
                    {
                        const request: FetchCollectionProps = payload;
                        const entities = await dataSourceDelegate.fetchCollection(request);
                        ws.send(JSON.stringify({ type: "FETCH_COLLECTION_SUCCESS", payload: { entities } }));
                    }
                    break;

                case "FETCH_ENTITY":
                    {
                        const request: FetchEntityProps = payload;
                        const entity = await dataSourceDelegate.fetchEntity(request);
                        ws.send(JSON.stringify({ type: "FETCH_ENTITY_SUCCESS", payload: { entity } }));
                    }
                    break;

                case "SAVE_ENTITY":
                    {
                        const request: SaveEntityProps = payload;
                        console.log("Saving entity with request:", request);
                        const entity = await dataSourceDelegate.saveEntity(request);
                        ws.send(JSON.stringify({ type: "SAVE_ENTITY_SUCCESS", payload: { entity } }));
                    }
                    break;

                case "DELETE_ENTITY":
                    {
                        const request: DeleteEntityProps = payload;
                        await dataSourceDelegate.deleteEntity(request);
                        ws.send(JSON.stringify({ type: "DELETE_ENTITY_SUCCESS", payload: { success: true } }));
                    }
                    break;

                case "CHECK_UNIQUE_FIELD":
                    {
                        const { path, name, value, entityId, collection } = payload;
                        const isUnique = await dataSourceDelegate.checkUniqueField(path, name, value, entityId, collection);
                        ws.send(JSON.stringify({ type: "CHECK_UNIQUE_FIELD_SUCCESS", payload: { isUnique } }));
                    }
                    break;

                case "GENERATE_ENTITY_ID":
                    {
                        const { path, collection } = payload;
                        const id = dataSourceDelegate.generateEntityId(path, collection);
                        ws.send(JSON.stringify({ type: "GENERATE_ENTITY_ID_SUCCESS", payload: { id } }));
                    }
                    break;

                case "COUNT_ENTITIES":
                    {
                        const request: FetchCollectionProps = payload;
                        const count = await dataSourceDelegate.countEntities!(request);
                        ws.send(JSON.stringify({ type: "COUNT_ENTITIES_SUCCESS", payload: { count } }));
                    }
                    break;

                default:
                    console.error("Unknown message type:", type);
            }
        } catch (error) {
            console.error("Error handling message:", error);
            ws.send(JSON.stringify({
                type: "ERROR",
                payload: {
                    error: "Internal server error",
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message
                }
            }));
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
    console.log("🗄️  PostgreSQL backend with Drizzle ORM initialized");
    console.log("🔄 Real-time sync enabled via WebSockets");
    console.log(`📚 ${collectionRegistry.getAll().length} collections registered`);
});

export { app, server, dataSourceDelegate };
