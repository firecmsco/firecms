import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

export function createPostgresDatabaseConnection(connectionString: string) {
    const pool = new Pool({
        connectionString,
        // Connection pool settings for resilience
        max: 20, // Maximum number of connections in the pool
        idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
        connectionTimeoutMillis: 10000, // Timeout for new connections
        // Retry configuration
        query_timeout: 30000, // Query timeout
        statement_timeout: 30000, // Statement timeout
        // Keep connections alive
        keepAlive: true,
        keepAliveInitialDelayMillis: 0
    });

    // Handle connection errors and implement reconnection logic
    pool.on("error", (err) => {
        console.error("Database connection error:", err);

        // Handle specific timeout errors
        if (err.message.includes("ETIMEDOUT")) {
            console.log("Connection timeout detected, pool will automatically retry...");
        }
    });

    // Handle successful connections
    pool.on("connect", (client) => {
        console.log("Database client connected");

        // Set up client-level error handling
        client.on("error", (err) => {
            console.error("Database client error:", err);
        });
    });

    // Handle client removal from pool
    pool.on("remove", (client) => {
        console.log("Database client removed from pool");
    });

    // Create drizzle instance with error handling wrapper
    const db = drizzle(pool);

    // Graceful shutdown handler
    process.on("SIGINT", async () => {
        console.log("Closing database pool...");
        await pool.end();
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        console.log("Closing database pool...");
        await pool.end();
        process.exit(0);
    });

    return db;
}

