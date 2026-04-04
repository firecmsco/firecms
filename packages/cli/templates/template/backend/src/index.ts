import { Hono } from "hono";
import { cors } from "hono/cors";
import { getRequestListener } from "@hono/node-server";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createPostgresDatabaseConnection, initializeRebaseAPI, initializeRebaseBackend, serveSPA, HonoEnv } from "@rebasepro/backend";

import { enums, relations, tables } from "./schema.generated";

import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = new Hono<HonoEnv>();

// PostgreSQL connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
}
const { db, connectionString } = createPostgresDatabaseConnection(databaseUrl);

// Middleware
app.use("/*", cors());

async function startServer() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET environment variable is not set");
    }

    const PORT = parseInt(process.env.PORT || "3001", 10);

    // Create an http.Server instance. This allows us to pass it to WebSocket init
    // and defer listening until all routes are mounted.
    const server = createServer(getRequestListener(app.fetch));

    try {
        // Initialize Rebase Backend with auth
        const backend = await initializeRebaseBackend({
            collectionsDir: path.resolve(__dirname, "../../shared/collections"),
            server,
            app,
            driver: {
                "(default)": {
                    connection: db,
                    schema: { tables, enums, relations },
                    adminConnectionString: process.env.ADMIN_CONNECTION_STRING || process.env.DATABASE_URL,
                    // Pass connectionString to enable cross-instance realtime via Postgres LISTEN/NOTIFY.
                    // This is optional — omit it to run in single-instance mode.
                    connectionString
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

        app.get("/health", (c) => {
            return c.json({
                status: "ok",
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV
            });
        });

        // Error handling
        app.onError((err, c) => {
            console.error("Unhandled error:", err);
            return c.json({
                error: "Internal server error",
                message: err.message
            }, 500);
        });

        // Finally start listening
        server.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            console.log(`   • REST API: http://localhost:${PORT}/api`);
            console.log(`   • GraphQL: http://localhost:${PORT}/api/graphql`);
            console.log(`   • Swagger docs: http://localhost:${PORT}/api/swagger`);
            console.log(`   • Health: http://localhost:${PORT}/health`);
        });
    } catch (err) {
        console.error("Failed to initialize backend:", err);
        process.exit(1);
    }
}

startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});

export { app };
