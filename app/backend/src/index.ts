import express from "express";
import cors from "cors";
import { createServer } from "http";
import { collectionRegistry, createPostgresDatabaseConnection, createPostgresWebSocket } from "@firecms/backend";
import { tables } from "./tables";

import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);

const db = createPostgresDatabaseConnection(process.env.DATABASE_URL as string);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
});


createPostgresWebSocket(server, db, tables);

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

export { app, server };
