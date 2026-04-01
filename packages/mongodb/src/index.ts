/**
 * @rebasepro/mongodb
 *
 * MongoDB backend implementation for Rebase
 * This package provides a complete backend solution for Rebase applications
 * using MongoDB as the database.
 *
 * The package implements the abstract interfaces from @rebasepro/backend
 * (EntityRepository, RealtimeProvider, CollectionRegistryInterface, etc.)
 */

// Connection
export * from "./connection";

// Factory functions
export * from "./factory";

// Database services
export * from "./db/MongoEntityService";
export * from "./db/MongoConditionBuilder";

// Services
export * from "./services/MongoRealtimeService";
export * from "./services/MongoDriver";
