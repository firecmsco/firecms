---
title: Additional Columns
sidebar_label: Additional Columns
slug: docs/frontend/additional-columns
description: Add computed/virtual columns to collection tables that derive values from entity data.
---

## Overview

Additional columns let you display computed or derived data in the collection table without storing it in the database.

## Defining Additional Columns

```typescript
const ordersCollection: EntityCollection = {
    slug: "orders",
    additionalFields: [
        {
            key: "total_display",
            name: "Total",
            Builder: ({ entity }) => {
                const total = entity.values.items?.reduce(
                    (sum, item) => sum + (item.price * item.quantity), 0
                ) ?? 0;
                return <span>${total.toFixed(2)}</span>;
            }
        },
        {
            key: "status_badge",
            name: "Status",
            Builder: ({ entity }) => {
                const color = entity.values.status === "completed" ? "green" : "orange";
                return (
                    <span style={{ color }}>
                        {entity.values.status}
                    </span>
                );
            },
            dependencies: ["status"]  // Re-render when these fields change
        }
    ],
    properties: { /* ... */ }
};
```

## Builder Props

| Prop | Type | Description |
|------|------|-------------|
| `entity` | `Entity` | The entity for this row |
| `context` | `RebaseContext` | Full Rebase context |

## Next Steps

- **[Entity Actions](/docs/frontend/entity-actions)** — Custom action buttons
- **[Custom Fields](/docs/frontend/custom-fields)** — Custom form fields
