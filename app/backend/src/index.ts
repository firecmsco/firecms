import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { createPostgresDatabaseConnection, initializeFireCMSBackend } from "@firecms/backend";

import { tables, enums, relations } from "./schema.generated";
import { collections } from "shared";

import * as dotenv from "dotenv";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment from app root level
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const server = createServer(app);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
}
const db = createPostgresDatabaseConnection(databaseUrl);

initializeFireCMSBackend({
    collections,
    tables,
    enums,
    relations,
    db,
    server
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve static files from frontend build in production
if (process.env.NODE_ENV === "production") {
    const frontendBuildPath = path.join(__dirname, "../../frontend/dist");
    app.use(express.static(frontendBuildPath));

    // Serve index.html for all non-API routes (SPA support)
    app.get("*", (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
            return next();
        }
        res.sendFile(path.join(frontendBuildPath, "index.html"));
    });
}

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
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
});

export { app, server };
