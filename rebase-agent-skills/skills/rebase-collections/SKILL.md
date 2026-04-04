---
name: rebase-collections
description: Comprehensive guide for defining Rebase collections, property types, validation, and schema configuration. Use this skill when the user needs help creating collections, adding properties, configuring field types, or understanding the schema-as-code approach.
---

# Rebase Collections

Rebase collections are the core building blocks of your data model. They define the structure, validation, and UI configuration of your data — all in TypeScript.

## Core Concepts

### Collections

A collection is defined as a TypeScript object implementing the `EntityCollection` interface. Each collection maps to a database table and generates:
- Full CRUD REST endpoints
- GraphQL queries and mutations
- Admin panel views (spreadsheet, forms, cards, kanban)

### Properties

Properties define the fields of your collection. Rebase supports 20+ built-in property types:

| Type | Description | PostgreSQL Column |
|------|-------------|-------------------|
| `string` | Text fields, URLs, emails | `VARCHAR` / `TEXT` |
| `number` | Integers and decimals | `INTEGER` / `DOUBLE PRECISION` |
| `boolean` | True/false toggles | `BOOLEAN` |
| `date` | Date and datetime values | `TIMESTAMP` |
| `map` | Nested objects (JSON) | `JSONB` |
| `array` | Lists of values | `JSONB` |
| `reference` | Foreign key to another collection | `UUID` with FK |
| `geopoint` | Latitude/longitude pairs | `JSONB` |

### Schema-as-Code

Collections are defined as standalone TypeScript files. The visual Studio edits these files via AST manipulation — it never runs raw SQL. This preserves custom callbacks and complex configuration.

## Defining a Collection

```typescript
import { EntityCollection } from "@rebasepro/core";

const productsCollection: EntityCollection = {
    name: "Products",
    dbPath: "products",
    properties: {
        name: {
            name: "Product Name",
            type: "string",
            validation: { required: true }
        },
        price: {
            name: "Price",
            type: "number",
            validation: { required: true, min: 0 }
        },
        description: {
            name: "Description",
            type: "string",
            multiline: true
        },
        published: {
            name: "Published",
            type: "boolean",
            defaultValue: false
        },
        created_at: {
            name: "Created At",
            type: "date",
            mode: "date_time",
            autoValue: "on_create"
        },
        category: {
            name: "Category",
            type: "string",
            enumValues: [
                { id: "electronics", label: "Electronics" },
                { id: "clothing", label: "Clothing" },
                { id: "books", label: "Books" }
            ]
        }
    }
};

export default productsCollection;
```

## Property Validation

Every property supports a `validation` object:

```typescript
validation: {
    required: true,           // Field is mandatory
    min: 0,                   // Minimum value (numbers) or length (strings)
    max: 1000,                // Maximum value or length
    matches: /^[a-z]+$/,      // Regex pattern (strings)
    email: true,              // Must be valid email
    url: true,                // Must be valid URL
    unique: true,             // Must be unique across all documents
    uniqueInArray: true,      // Must be unique within array
    requiredMessage: "...",   // Custom error message
}
```

## Relations

Collections can define relations to other collections:

```typescript
const ordersCollection: EntityCollection = {
    name: "Orders",
    dbPath: "orders",
    properties: {
        customer_id: {
            name: "Customer",
            type: "reference",
            path: "customers",     // References the customers collection
            previewProperties: ["name", "email"]
        },
        items: {
            name: "Items",
            type: "array",
            of: {
                type: "reference",
                path: "products"
            }
        }
    }
};
```

## Schema Migration Workflow

After modifying collections, apply changes to the database:

```bash
# All commands run from the app/ directory unless noted

# 1. Regenerate the Drizzle schema from your collection definitions
rebase schema generate

# 2a. Development — push changes directly
rebase db push

# 2b. Production — generate and review migration files
rebase db generate
rebase db migrate
```

## References

- **Property Types:** See [references/property-types.md](references/property-types.md) for the complete property type reference.
- **Validation Rules:** See [references/validation.md](references/validation.md) for all validation options.
- **Relations:** See [references/relations.md](references/relations.md) for one-to-many and many-to-many relation setup.
- **Migration Workflow:** See [references/migration-workflow.md](references/migration-workflow.md) for detailed migration steps.
