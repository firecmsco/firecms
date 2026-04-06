---
title: "Recipe: Webhook Integration"
sidebar_label: Webhooks
slug: docs/recipes/webhooks
description: Use entity callbacks to send webhooks to external services when data changes.
---

## Overview

Use `afterSave` and `afterDelete` callbacks to notify external services when data changes in Rebase.

## Slack Notification on New Order

```typescript
const ordersCollection: EntityCollection = {
    slug: "orders",
    name: "Orders",
    dbPath: "orders",
    callbacks: {
        afterSave: async ({ values, entityId, status }) => {
            if (status === "new") {
                await fetch(process.env.SLACK_WEBHOOK_URL!, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: `🛒 New order #${entityId}\nCustomer: ${values.customer_name}\nTotal: $${values.total}`
                    })
                });
            }
        }
    },
    properties: { /* ... */ }
};
```

## Sync to External API

```typescript
callbacks: {
    afterSave: async ({ values, entityId }) => {
        // Sync product to Shopify
        await fetch("https://your-shop.myshopify.com/admin/api/2024-01/products.json", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": process.env.SHOPIFY_TOKEN!
            },
            body: JSON.stringify({
                product: {
                    id: values.shopify_id,
                    title: values.name,
                    body_html: values.description,
                    variants: [{ price: values.price }]
                }
            })
        });
    },

    afterDelete: async ({ entityId, entity }) => {
        // Remove from Shopify
        if (entity.values.shopify_id) {
            await fetch(
                `https://your-shop.myshopify.com/admin/api/2024-01/products/${entity.values.shopify_id}.json`,
                {
                    method: "DELETE",
                    headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_TOKEN! }
                }
            );
        }
    }
}
```

## Error Handling

Use `afterSaveError` to handle failures gracefully:

```typescript
callbacks: {
    afterSave: async ({ values, entityId }) => {
        // This might fail
        await syncToExternalService(values);
    },
    afterSaveError: async ({ entityId, error }) => {
        // Log the error, send alert, or retry
        console.error(`Webhook failed for entity ${entityId}:`, error);
        await sendErrorAlert(entityId, error);
    }
}
```

## Next Steps

- **[Entity Callbacks](/docs/collections/callbacks)** — Full callback reference
- **[Blog CMS Recipe](/docs/recipes/blog-cms)** — Complete blog example
