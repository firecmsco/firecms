import { Hono } from "hono";
import { cors } from "hono/cors";
import { getRequestListener } from "@hono/node-server";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import {
    createPostgresDatabaseConnection,
    initializeRebaseBackend,
    serveSPA,
    HonoEnv
} from "@rebasepro/backend";

import { enums, relations, tables } from "./schema.generated";

import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ─── Hono app ────────────────────────────────────────────────────────
// This is a standard Hono app. You own it — add middleware, routes,
// or anything else you need. Rebase mounts its routes onto this app.
const app = new Hono<HonoEnv>();

// ─── CORS ────────────────────────────────────────────────────────────
// Configure allowed origins for your deployment.
// In development: allow your Vite dev server.
// In production: replace with your actual domain(s).
const allowedOrigins = process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL || "https://yourdomain.com"]
    : ["http://localhost:5173", "http://localhost:3000"];

app.use("/*", cors({
    origin: allowedOrigins,
    credentials: true
}));

// ─── Database ────────────────────────────────────────────────────────
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
}
const { db, connectionString } = createPostgresDatabaseConnection(databaseUrl);

// ─── Start ───────────────────────────────────────────────────────────
async function startServer() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET environment variable is not set");
    }

    const PORT = parseInt(process.env.PORT || "3001", 10);

    // Create an http.Server so WebSocket can share the same port.
    const server = createServer(getRequestListener(app.fetch));

    try {
        // ─── Initialize Rebase Backend ───────────────────────────────
        const backend = await initializeRebaseBackend({
            collectionsDir: path.resolve(__dirname, "../../shared/collections"),
            server,
            app,
            driver: {
                connection: db,
                schema: { tables, enums, relations },
                adminConnectionString: process.env.ADMIN_CONNECTION_STRING || process.env.DATABASE_URL,
                connectionString
            },
            auth: {
                jwtSecret,
                accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h",
                refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
                google: process.env.GOOGLE_CLIENT_ID
                    ? { clientId: process.env.GOOGLE_CLIENT_ID }
                    : undefined,
                seedDefaultRoles: true,
                allowRegistration: process.env.ALLOW_REGISTRATION === "true"
            },
            storage: {
                type: "local",
                basePath: path.resolve(__dirname, "../../uploads")
            },
            history: true,
        });

        // ─── GraphQL (optional) ──────────────────────────────────────
        // Uncomment to expose a GraphQL API alongside the REST API.
        // Requires: pnpm add @hono/graphql-server graphql
        //
        // import { GraphQLSchemaGenerator } from "@rebasepro/backend";
        // import { graphqlServer } from "@hono/graphql-server";
        //
        // const collections = backend.collectionRegistry.getCollections();
        // const gqlSchema = new GraphQLSchemaGenerator(collections, backend.driver).generateSchema();
        // app.use("/api/data/graphql", graphqlServer({ schema: gqlSchema }));

        // ─── Your custom routes ──────────────────────────────────────
        // Add any custom endpoints here. This is a plain Hono app,
        // so you have full control.
        //
        // Example:
        //   app.get("/api/custom", (c) => c.json({ hello: "world" }));

        app.get("/health", (c) => {
            return c.json({
                status: "ok",
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV
            });
        });

        // ─── Serve frontend in production ────────────────────────────
        if (process.env.NODE_ENV === "production") {
            serveSPA(app, {
                frontendPath: path.join(__dirname, "../../frontend/dist"),
                excludePaths: ["/health"]
            });
        }

        // ─── Error handling ──────────────────────────────────────────
        app.onError((err, c) => {
            console.error("Unhandled error:", err);
            const isProduction = process.env.NODE_ENV === "production";
            return c.json({
                error: {
                    message: isProduction ? "Internal server error" : err.message,
                    code: "INTERNAL_ERROR"
                }
            }, 500);
        });

        // ─── Listen ─────────────────────────────────────────────────
        server.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            console.log(`   • API Base:     http://localhost:${PORT}/api`);
            console.log(`   • Health:       http://localhost:${PORT}/health`);
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
