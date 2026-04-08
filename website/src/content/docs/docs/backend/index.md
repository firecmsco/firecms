---
title: Backend Overview
sidebar_label: Backend
slug: docs/backend
description: The Rebase backend provides a complete server with REST API, authentication, storage, WebSocket real-time, and entity history — all initialized with a single function call.
---

## Overview

The Rebase backend is a **Node.js server** built on [Hono](https://hono.dev/) that provides:

- **REST API** — Auto-generated CRUD endpoints for each collection
- **Authentication** — JWT tokens, Google OAuth, user/role management
- **Storage** — File upload/download with local filesystem or S3
- **WebSocket** — Real-time data sync via PostgreSQL LISTEN/NOTIFY
- **Entity History** — Audit trail for every data change

Everything is initialized with a single function:

```typescript
import { initializeRebaseBackend } from "@rebasepro/backend";

const instance = await initializeRebaseBackend({
    app,
    server,
    collections,
    driver: {
        connection: db,
        schema: { tables, enums, relations }
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET!,
    },
    storage: { type: "local", basePath: "./uploads" },
    history: true,
    enableSwagger: process.env.NODE_ENV !== "production"
});
```

## What Gets Created

After initialization, these routes are mounted:

| Path | Purpose |
|------|---------|
| `/api/auth/*` | Authentication (signup, login, refresh, Google OAuth) |
| `/api/admin/*` | User and role management (admin-only) |
| `/api/storage/*` | File upload, download, and deletion |
| `/api/data/collections` | Collection metadata endpoint |
| `/api/data/:slug` | CRUD operations per collection (GET, POST, PUT, DELETE) |
| `/api/data/:slug/:id/history` | Entity change history (when enabled) |
| `/api/data/docs` | OpenAPI spec (when `enableSwagger: true`) |
| `/api/data/swagger` | Swagger UI (dev mode, when `enableSwagger: true`) |
| WebSocket on upgrade | Real-time subscriptions |

## Configuration Reference

```typescript
interface RebaseBackendConfig {
    // HTTP framework
    app: Hono;               // Hono application instance
    server: Server;           // Node.js HTTP server (for WebSocket attachment)
    basePath?: string;        // Route prefix (default: "/api")

    // Collections
    collections?: EntityCollection[];  // Your collection definitions
    collectionsDir?: string;  // Auto-load collections from a directory

    // Database driver (see Driver Configuration)
    driver: DriverConfig | Record<string, DriverConfig>;

    // Authentication
    auth?: AuthConfig;

    // File storage
    storage?: BackendStorageConfig | Record<string, BackendStorageConfig>;

    // Entity history
    history?: boolean | HistoryConfig;

    // OpenAPI/Swagger
    enableSwagger?: boolean;

    // Logging
    logging?: { level?: "error" | "warn" | "info" | "debug" };
}
```

## The Backend Instance

`initializeRebaseBackend` returns a `RebaseBackendInstance` with access to all services:

```typescript
const instance = await initializeRebaseBackend(config);

// Access services
instance.driver              // Default data driver
instance.driverRegistry      // All drivers (for multi-database)
instance.realtimeService     // Default realtime service
instance.userService         // User management
instance.roleService         // Role management
instance.storageController   // Default storage
instance.storageRegistry     // All storage backends
instance.collectionRegistry  // Collection metadata
instance.historyService      // Entity history
```

## REST API

The REST API is auto-generated from your collections. Every collection gets these endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/data/:slug` | List entities (with filter, sort, limit, search) |
| `GET` | `/api/data/:slug/:id` | Get a single entity |
| `POST` | `/api/data/:slug` | Create a new entity |
| `PUT` | `/api/data/:slug/:id` | Update an entity |
| `DELETE` | `/api/data/:slug/:id` | Delete an entity |

### Query Parameters

| Param | Description | Example |
|-------|-------------|---------|
| `filter` | JSON-encoded filter conditions | `?filter={"active":["==",true]}` |
| `orderBy` | Sort field | `?orderBy=created_at` |
| `order` | Sort direction | `?order=desc` |
| `limit` | Page size | `?limit=25` |
| `startAfter` | Cursor for pagination | `?startAfter=encodedCursor` |
| `search` | Full-text search | `?search=laptop` |

## WebSocket

The WebSocket server attaches to the same HTTP server and provides real-time subscriptions:

- Subscribe to **collection changes** — get notified when any entity in a collection is created, updated, or deleted
- Subscribe to **entity changes** — get notified when a specific entity changes
- Automatic **reconnection** handling in the client SDK

The backend uses PostgreSQL `LISTEN/NOTIFY` internally. For multi-instance deployments, provide a `connectionString` in your driver config to enable cross-instance broadcasting.

## Error Handling

The backend includes an error handler that catches all exceptions and returns structured error responses:

```json
{
    "error": {
        "message": "Entity not found",
        "code": "not-found",
        "status": 404
    }
}
```

If initialization fails (e.g., database connection error), the server still starts but returns 503 for all API requests, with a descriptive error message in the logs.

## Next Steps

- **[Authentication](/docs/auth)** — JWT, Google OAuth, user management
- **[Storage](/docs/storage)** — Local and S3 file storage
- **[Entity Callbacks](/docs/collections/callbacks)** — Lifecycle hooks
- **[Entity History](/docs/backend/history)** — Audit trail
