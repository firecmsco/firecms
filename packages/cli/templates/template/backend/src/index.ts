import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { createPostgresDatabaseConnection, initializeRebaseAPI, initializeRebaseBackend, serveSPA } from "@rebasepro/backend";

import { enums, relations, tables } from "./schema.generated";

import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const server = createServer(app);

// PostgreSQL connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
}
const db = createPostgresDatabaseConnection(databaseUrl);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

async function startServer() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET environment variable is not set");
    }

    // Initialize Rebase Backend with auth
    const backend = await initializeRebaseBackend({
        collectionsDir: path.resolve(__dirname, "../../shared/collections"),
        server,
        app,
        driver: {
            "(default)": {
                connection: db,
                schema: { tables, enums, relations },
                adminConnectionString: process.env.ADMIN_CONNECTION_STRING || process.env.DATABASE_URL
            }
        },
        auth: {
            jwtSecret,
            accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h",
            refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
            google: process.env.GOOGLE_CLIENT_ID ? {
                clientId: process.env.GOOGLE_CLIENT_ID
            } : undefined,
            seedDefaultRoles: true,
            allowRegistration: process.env.ALLOW_REGISTRATION === "true",
            email: process.env.SMTP_HOST ? {
                from: process.env.SMTP_FROM || "noreply@example.com",
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
        storage: {
            type: "local",
            basePath: path.resolve(__dirname, "../../uploads")
        }
    });

    // Initialize REST/GraphQL API
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
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        });
    });

    // Error handling
    app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error("Unhandled error:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        });
    });

    const PORT = process.env.PORT || 3001;

    server.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`   • REST API: http://localhost:${PORT}/api`);
        console.log(`   • GraphQL: http://localhost:${PORT}/api/graphql`);
        console.log(`   • Swagger docs: http://localhost:${PORT}/api/swagger`);
        console.log(`   • Health: http://localhost:${PORT}/health`);
    });
}

startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});

export { app, server };
