---
title: Entity History
sidebar_label: Entity History
slug: docs/backend/history
description: Track every change to your entities with a full audit trail — who changed what, when, and the complete before/after snapshot.
---

## Overview

Entity history records a snapshot of entity values on every create, update, and delete. This gives you a full audit trail with diffs.

## Enabling History

### Backend

Enable history in `initializeRebaseBackend`:

```typescript
await initializeRebaseBackend({
    // ...
    history: true
});
```

Or with custom retention settings:

```typescript
history: {
    maxEntries: 200,     // Per entity, oldest pruned first (default: 200)
    ttlDays: 90          // Entries older than this are pruned (default: 90)
}
```

### Per Collection

Mark which collections should track history:

```typescript
const ordersCollection: EntityCollection = {
    slug: "orders",
    history: true,       // Enable for this collection
    properties: { /* ... */ }
};
```

## How It Works

1. The backend creates a `rebase.entity_history` table automatically
2. On every create, update, or delete, a snapshot is recorded with:
   - Entity ID, collection slug, and table name
   - The full entity values (before and after)
   - Timestamp and user ID
   - Operation type (`insert`, `update`, `delete`)
3. Old entries are pruned periodically (every 6 hours)

## REST Endpoint

```
GET /api/data/:slug/:entityId/history
```

Returns a list of history entries for a specific entity, ordered by most recent first:

```json
{
    "data": [
        {
            "id": 42,
            "entity_id": "123",
            "collection_slug": "orders",
            "operation": "update",
            "values": { "status": "shipped", "total": 99.99 },
            "previous_values": { "status": "pending", "total": 99.99 },
            "user_id": "admin-user-id",
            "created_at": "2025-01-15T10:30:00Z"
        }
    ]
}
```

## Retention Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `maxEntries` | 200 | Maximum entries per entity. Oldest are pruned. |
| `ttlDays` | 90 | Entries older than this are deleted. |

The backend runs a global prune sweep every 6 hours.

## Next Steps

- **[Entity Callbacks](/docs/collections/callbacks)** — Lifecycle hooks
- **[Backend Overview](/docs/backend)** — Full backend configuration
