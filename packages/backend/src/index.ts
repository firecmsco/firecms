/**
 * @firecms/backend
 *
 * PostgreSQL and Drizzle ORM backend implementation for FireCMS
 * This package provides a complete backend solution for FireCMS applications
 * using PostgreSQL as the database and Drizzle ORM for type-safe database operations.
 */

// Core database functionality
export * from "./init";
export * from "./db/connection";
export * from "./db/entityService";

export * from "./websocket";

// Services
export * from "./services/dataSourceDelegate";
export * from "./services/realtimeService";

// Collections
export * from "./collections/registry";

// API Server
export * from "./api/server";
export * from "./api/types";

// API Generation
export * from "./api";

// Types
export * from "./types";
export * from "./types/index";

// Utilities
export * from "./generate-drizzle-schema";
export * from "./utils/logging";
