---
title: Collections
sidebar_label: Collections
slug: docs/collections
description: Collections are the core building block of Rebase — each collection maps to a database table and defines its schema, relations, security, and UI behavior.
---

## What is a Collection?

A **collection** is a TypeScript object that describes a database table and how it should appear in the admin UI. It defines:

- **Schema** — Properties (columns), their types, and validation rules
- **Relations** — Foreign keys, junction tables, and join paths
- **Security** — Row Level Security policies
- **UI behavior** — View modes, inline editing, entity views, actions
- **Lifecycle hooks** — Callbacks for create, update, delete operations

```typescript
import { EntityCollection } from "@rebasepro/types";

export const productsCollection: EntityCollection = {
    slug: "products",              // URL path and API endpoint
    name: "Products",              // Display name (plural)
    singularName: "Product",       // Display name (singular)
    table: "products",            // PostgreSQL table name
    icon: "inventory_2",           // Material icon key

    properties: {
        name: {
            type: "string",
            name: "Product Name",
            validation: { required: true }
        },
        price: {
            type: "number",
            name: "Price",
            validation: { required: true, min: 0 }
        },
        category: {
            type: "string",
            name: "Category",
            enum: [
                { id: "electronics", label: "Electronics", color: "blueDark" },
                { id: "clothing", label: "Clothing", color: "pinkLight" },
                { id: "books", label: "Books", color: "orangeDark" }
            ]
        },
        description: {
            type: "string",
            name: "Description",
            multiline: true
        },
        active: {
            type: "boolean",
            name: "Active",
            defaultValue: true
        },
        created_at: {
            type: "date",
            name: "Created At",
            autoValue: "on_create",
            readOnly: true
        }
    }
};
```

## Key Properties

### Identification

| Property | Type | Description |
|----------|------|-------------|
| `slug` | `string` | **Required.** URL-safe identifier. Used in the admin UI URL and REST API path (`/api/data/{slug}`). |
| `name` | `string` | **Required.** Display name (plural). Shown in navigation and page headers. |
| `singularName` | `string` | Display name for a single entity. Used in "New Product", "Edit Product", etc. |
| `table` | `string` | **Required.** PostgreSQL table name. If different from `slug`, allows you to decouple URLs from table names. |
| `icon` | `string` | Material icon key. See [Google Fonts Icons](https://fonts.google.com/icons). |

### Schema

| Property | Type | Description |
|----------|------|-------------|
| `properties` | `Properties` | **Required.** Map of property key → property definition. Each key becomes a database column. |
| `relations` | `Relation[]` | SQL relations — foreign keys, junction tables. See [Relations](/docs/collections/relations). |
| `securityRules` | `SecurityRule[]` | Row Level Security policies. See [Security Rules](/docs/collections/security-rules). |

### UI Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `defaultViewMode` | `"table" \| "cards" \| "kanban"` | `"table"` | Default view mode |
| `enabledViews` | `ViewMode[]` | All three | Which view modes are available |
| `kanban` | `KanbanConfig` | — | Kanban configuration (column property) |
| `openEntityMode` | `"side_panel" \| "full_screen"` | `"full_screen"` | How entities open for editing |
| `inlineEditing` | `boolean` | `true` | Enable inline editing in the spreadsheet view |
| `defaultSize` | `"xs" \| "s" \| "m" \| "l" \| "xl"` | `"m"` | Default row height in the table |
| `pagination` | `boolean \| number` | `true` (50) | Enable pagination and/or set page size |
| `propertiesOrder` | `string[]` | — | Column order in the table view |
| `hideFromNavigation` | `boolean` | `false` | Hide from the sidebar navigation |

### Entity Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `formAutoSave` | `boolean` | `false` | Auto-save on field change |
| `hideIdFromForm` | `boolean` | `false` | Hide the entity ID from the form |
| `hideIdFromCollection` | `boolean` | `false` | Hide the ID column from the table |
| `includeJsonView` | `boolean` | `false` | Show a JSON tab in the entity view |
| `history` | `boolean` | `false` | Track changes in entity history |
| `alwaysApplyDefaultValues` | `boolean` | `false` | Apply default values on every save, not just creation |

### Advanced

| Property | Type | Description |
|----------|------|-------------|
| `callbacks` | `EntityCallbacks` | Lifecycle hooks (`beforeSave`, `afterSave`, `beforeDelete`, etc.) |
| `entityActions` | `EntityAction[]` | Custom actions on entities (archive, publish, etc.) |
| `Actions` | `React.ComponentType` | Custom toolbar actions component |
| `entityViews` | `EntityCustomView[]` | Custom tabs in the entity detail view |
| `additionalFields` | `AdditionalFieldDelegate[]` | Computed/virtual columns |
| `subcollections` | `() => EntityCollection[]` | Nested collections (e.g., order → line items) |
| `exportable` | `boolean \| ExportConfig` | Enable data export |
| `driver` | `string` | Database driver to use (default: `"(default)"`) |

## Collection Builder

For dynamic collections that change based on the user or external data, use a builder function:

```typescript
const collectionsBuilder: EntityCollectionsBuilder = ({ user, authController }) => {
    const collections = [productsCollection];

    if (authController.extra?.role === "admin") {
        collections.push(adminSettingsCollection);
    }

    return collections;
};
```

## Filtering and Sorting

You can set default or forced filters:

```typescript
{
    // Default filter — users can change it
    filter: { active: ["==", true] },

    // Forced filter — cannot be changed
    forceFilter: { tenant_id: ["==", currentTenantId] },

    // Default sort
    sort: ["created_at", "desc"]
}
```

## Next Steps

- **[Properties](/docs/collections/properties)** — All property types and options
- **[Relations](/docs/collections/relations)** — Foreign keys, junction tables, joins
- **[Security Rules](/docs/collections/security-rules)** — Row Level Security
- **[View Modes](/docs/collections/view-modes)** — Table, Cards, Kanban
- **[Entity Callbacks](/docs/collections/callbacks)** — Lifecycle hooks
