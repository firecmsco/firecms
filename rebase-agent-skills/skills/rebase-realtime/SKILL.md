---
name: rebase-realtime
description: Guide for the Rebase WebSocket realtime engine. Use this skill when the user needs real-time data synchronization, table change broadcasts, or live updates in their application.
---

# Rebase Realtime Engine

Rebase includes a built-in WebSocket-based realtime engine that broadcasts table changes to connected clients instantly.

## Overview

The realtime engine:
- Monitors database changes for all managed collections
- Broadcasts insert, update, and delete events via WebSocket
- Supports per-collection subscriptions
- Respects authentication and RLS policies

## Architecture

```
[Client] ←→ [WebSocket Server] ←→ [PostgreSQL LISTEN/NOTIFY]
```

The backend Hono server includes the WebSocket server on the same HTTP port. Changes are detected via PostgreSQL's LISTEN/NOTIFY mechanism and broadcast to subscribed clients.

## Server-Side Setup

The realtime engine is automatically initialized when you create the Rebase backend with a PostgreSQL bootstrapper that has `connectionString` set:

```typescript
import { initializeRebaseBackend, HonoEnv } from "@rebasepro/server-core";
import { createPostgresDatabaseConnection, createPostgresBootstrapper } from "@rebasepro/server-postgresql";

const { db, connectionString } = createPostgresDatabaseConnection(process.env.DATABASE_URL!);

const backend = await initializeRebaseBackend({
    server,
    app,
    bootstrappers: [
        createPostgresBootstrapper({
            connection: db,
            schema: { tables, enums, relations },
            adminConnectionString: process.env.DATABASE_URL,
            // Pass connectionString to enable cross-instance realtime
            // via Postgres LISTEN/NOTIFY. Omit for single-instance mode.
            connectionString
        })
    ],
    // Realtime (WebSocket) is automatically enabled
});

// The WebSocket runs on the same HTTP server
server.listen(3001);
```

## Client-Side Subscription

### JavaScript/TypeScript Client

```typescript
const ws = new WebSocket("ws://localhost:3001/ws");

ws.onopen = () => {
    // Subscribe to a collection
    ws.send(JSON.stringify({
        type: "subscribe",
        collection: "products",
        token: "<jwt-token>"  // Authentication required
    }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
        case "insert":
            console.log("New document:", message.data);
            break;
        case "update":
            console.log("Updated document:", message.data);
            break;
        case "delete":
            console.log("Deleted document ID:", message.id);
            break;
    }
};

// Unsubscribe
ws.send(JSON.stringify({
    type: "unsubscribe",
    collection: "products"
}));
```

### React Integration

In Rebase Studio, realtime is built into the data views. The spreadsheet, card, and kanban views automatically refresh when data changes.

## Message Types

### Client → Server

| Type | Payload | Description |
|------|---------|-------------|
| `subscribe` | `{ collection, token }` | Subscribe to collection changes |
| `unsubscribe` | `{ collection }` | Unsubscribe from collection |
| `ping` | `{}` | Keep-alive heartbeat |

### Server → Client

| Type | Payload | Description |
|------|---------|-------------|
| `insert` | `{ collection, data }` | New document created |
| `update` | `{ collection, id, data }` | Document updated |
| `delete` | `{ collection, id }` | Document deleted |
| `pong` | `{}` | Heartbeat response |
| `error` | `{ message }` | Error notification |

## References

- **WebSocket API:** See [references/websocket-api.md](references/websocket-api.md) for the complete protocol specification.
- **Client Libraries:** See [references/client-integration.md](references/client-integration.md) for framework-specific integration guides.
