/**
 * @firecms/postgresql
 *
 * PostgreSQL data source client for FireCMS
 * This package provides a WebSocket-based client for connecting FireCMS applications
 * to PostgreSQL backends with real-time synchronization capabilities.
 */

// Core client functionality
export * from "./postgres_client";

// React hooks and data source implementation
export * from "./usePostgresDataSource";

// Re-export commonly used FireCMS core types
export type {
    Entity,
    EntityCollection,
    DataSource,
    FetchCollectionProps,
    FetchEntityProps,
    SaveEntityProps,
    DeleteEntityProps,
    ListenCollectionProps,
    ListenEntityProps
} from "@firecms/core";
