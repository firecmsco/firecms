import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { createPostgresDatabaseConnection, initializeRebaseAPI, initializeRebaseBackend, serveSPA } from "@rebasepro/backend";

import { enums, relations, tables } from "./schema.generated";

import * as dotenv from "dotenv";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment from app root level
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const server = createServer(app);

// PostgreSQL connection (required, default driver)
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
}
const { db, connectionString } = createPostgresDatabaseConnection(databaseUrl);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Initialize async function
async function startServer() {

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET environment variable is not set");
    }

    // ================================================================
    // Multi-Driver Configuration
    // ================================================================

    // Build driver configuration
    // Default driver is always PostgreSQL (required for auth)
    const drivers: Record<string, any> = {
        "(default)": {
            connection: db,
            schema: { tables, enums, relations },
            adminConnectionString: process.env.ADMIN_CONNECTION_STRING || process.env.DATABASE_URL,
            // Pass connectionString to enable cross-instance realtime via Postgres LISTEN/NOTIFY.
            // This is optional — omit it to run in single-instance mode.
            connectionString
        }
    };

    // Initialize Rebase Backend with auth (now async)
    // Auth, admin, and storage routes are automatically mounted
    const backend = await initializeRebaseBackend({
        collectionsDir: path.resolve(__dirname, "../../shared/collections"),
        server,
        app, // Express app for mounting auth/storage routes
        // Multi-driver configuration
        driver: drivers,
        auth: {
            jwtSecret,
            accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h",
            refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
            google: process.env.GOOGLE_CLIENT_ID ? {
                clientId: process.env.GOOGLE_CLIENT_ID
            } : undefined,
            seedDefaultRoles: true,
            allowRegistration: process.env.ALLOW_REGISTRATION === "true",
            // Email configuration for password reset and email verification
            email: process.env.SMTP_HOST ? {
                from: process.env.SMTP_FROM || "noreply@rebase.pro",
                appName: process.env.APP_NAME || "Rebase",
                resetPasswordUrl: process.env.FRONTEND_URL || "http://localhost:5173",
                verifyEmailUrl: process.env.FRONTEND_URL || "http://localhost:5173",
                smtp: {
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT || "587"),
                    secure: process.env.SMTP_SECURE === "true",
                    auth: process.env.SMTP_USER ? {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS || ""
                    } : undefined
                }
            } : undefined
        },
        // Storage configuration - local filesystem storage
        storage: {
            type: "local",
            basePath: path.resolve(__dirname, "../../uploads")
        }
    });

    // OPTIONAL: Initialize REST/GraphQL API for external integrations
    await initializeRebaseAPI(app, backend, {
        basePath: "/api",
        collectionsDir: path.resolve(__dirname, "../../shared/collections"),
        enableGraphQL: true,
        enableREST: true,
        cors: {
            origin: true,
            credentials: true
        }
    });

    // Serve SPA in production
    if (process.env.NODE_ENV === "production") {
        serveSPA(app, {
            frontendPath: path.join(__dirname, "../../frontend/dist"),
            excludePaths: ["/health"]
        });
    }

    app.get("/health", (req, res) => {
        const driverList = Object.keys(drivers).join(", ");
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            authEnabled: true,
            drivers: driverList
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
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log("📋 API endpoints:");
        console.log(`   • REST API: http://localhost:${PORT}/api`);
        console.log(`   • Swagger API Docs: http://localhost:${PORT}/api/swagger`);
        console.log(`   • GraphQL API: http://localhost:${PORT}/api/graphql`);
        console.log(`   • Auth API: http://localhost:${PORT}/api/auth`);
        console.log(`   • Health Check: http://localhost:${PORT}/health`);
        console.log("🔐 JWT Authentication enabled");
        console.log("📡 WebSocket server ready for all operations");
        console.log(`🗄️ Drivers: ${Object.keys(drivers).join(", ")}`);
        console.log("🔄 Real-time sync enabled via WebSockets");
    });
}

// Start the server
startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});

export { app, server };
