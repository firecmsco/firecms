import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { pool } from "./db/connection";
import { drizzle } from "drizzle-orm/node-postgres";
import { EntityService } from "./db/entityService";
import { RealtimeService } from "./services/realtimeService";
import { PostgresDataSourceDelegate } from "./services/dataSourceDelegate";
import {
    DeleteEntityProps,
    FetchCollectionProps,
    FetchEntityProps,
    SaveEntityProps
} from "./types";
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

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
});

// REST API Routes

// Fetch collection
app.post("/api/collections/fetch", async (req, res) => {
    try {
        const request: FetchCollectionProps = req.body;
        const entities = await dataSourceDelegate.fetchCollection(request);
        res.json({ entities });
    } catch (error: any) {
        console.error("Error fetching collection:", error);
        res.status(500).json({
            error: "Failed to fetch collection",
            details: error.message
        });
    }
});

// Fetch entity
app.post("/api/entities/fetch", async (req, res) => {
    try {
        const request: FetchEntityProps = req.body;
        const entity = await dataSourceDelegate.fetchEntity(request);
        res.json({ entity });
    } catch (error: any) {
        console.error("Error fetching entity:", error);
        res.status(500).json({
            error: "Failed to fetch entity",
            details: error.message
        });
    }
});

// Save entity
app.post("/api/entities/save", async (req, res) => {
    try {
        const request: SaveEntityProps = req.body;
        const entity = await dataSourceDelegate.saveEntity(request);
        res.json({ entity });
    } catch (error: any) {
        console.error("Error saving entity:", error);
        res.status(500).json({
            error: "Failed to save entity",
            details: error.message
        });
    }
});

// Delete entity
app.delete("/api/entities/delete", async (req, res) => {
    try {
        const request: DeleteEntityProps = req.body;
        await dataSourceDelegate.deleteEntity(request);
        res.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting entity:", error);
        res.status(500).json({
            error: "Failed to delete entity",
            details: error.message
        });
    }
});

// Check unique field
app.post("/api/entities/check-unique", async (req, res) => {
    try {
        const {
            path,
            name,
            value,
            entityId,
            collection
        } = req.body;
        const isUnique = await dataSourceDelegate.checkUniqueField(path, name, value, entityId, collection);
        res.json({ isUnique });
    } catch (error: any) {
        console.error("Error checking unique field:", error);
        res.status(500).json({
            error: "Failed to check unique field",
            details: error.message
        });
    }
});

// Generate entity ID
app.post("/api/entities/generate-id", async (req, res) => {
    try {
        const {
            path,
            collection
        } = req.body;
        const id = dataSourceDelegate.generateEntityId(path, collection);
        res.json({ id });
    } catch (error: any) {
        console.error("Error generating entity ID:", error);
        res.status(500).json({
            error: "Failed to generate entity ID",
            details: error.message
        });
    }
});

// Count entities
app.post("/api/collections/count", async (req, res) => {
    try {
        const request: FetchCollectionProps = req.body;
        const count = await dataSourceDelegate.countEntities!(request);
        res.json({ count });
    } catch (error: any) {
        console.error("Error counting entities:", error);
        res.status(500).json({
            error: "Failed to count entities",
            details: error.message
        });
    }
});

// WebSocket connection handling
wss.on("connection", (ws, req) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`WebSocket client connected: ${clientId}`);

    realtimeService.addClient(clientId, ws);

    ws.on("close", () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
    });
});

// Error handling middleware
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
        error: "Internal server error",
        details: error.message
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("📡 WebSocket server ready for real-time connections");
    console.log("🗄️  PostgreSQL backend with Drizzle ORM initialized");
    console.log("🔄 Real-time sync enabled via WebSockets");
    console.log(`📚 ${collectionRegistry.getAll().length} collections registered`);
});

export { app, server, dataSourceDelegate };
