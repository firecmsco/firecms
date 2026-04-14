---
title: Schema as Code
sidebar_label: Schema as Code
slug: docs/architecture/schema-as-code
description: How Rebase uses TypeScript collections as the single source of truth for your database schema, UI, and API.
---

## The Core Idea

In Rebase, your **TypeScript collection definitions are the single source of truth**. From one set of TypeScript objects, Rebase generates:

- **PostgreSQL tables** via Drizzle ORM schema generation
- **CRUD UI** — forms, tables, validation, field types
- **REST API** endpoints with filtering, sorting, and pagination
- **Client SDK** — type-safe data operations
- **RLS policies** — Row Level Security in Postgres

This means your schema is:
- **Version controlled** — every change is a git commit
- **Type-safe** — TypeScript catches errors at compile time
- **Reviewable** — schema changes go through pull requests
- **Portable** — the same definition works across frontend, backend, and CLI

## Visual Editing with AST Manipulation

Rebase also provides a **visual collection editor** in Studio mode. When a non-developer uses the visual editor to add a field:

1. The Studio does **not** directly modify the database
2. Instead, it uses [ts-morph](https://ts-morph.com/) to parse your TypeScript source file as an AST
3. It inserts the new property definition precisely into the `properties` block
4. **All existing code, callbacks, and custom logic are preserved untouched**
5. The file is saved, triggering hot reload

This "UI as Code Generator" approach means visual edits produce the same clean TypeScript a developer would write by hand.

## Schema Generation Pipeline

```
TypeScript Collections
        │
        ▼
  rebase schema generate
        │
        ▼
  Drizzle Schema (schema.generated.ts)
        │
        ▼
  rebase db generate
        │
        ▼
  SQL Migration Files
        │
        ▼
  rebase db migrate
        │
        ▼
  PostgreSQL Tables
```

### Example

Given this collection:

```typescript
const productsCollection: EntityCollection = {
    slug: "products",
    table: "products",
    properties: {
        name: { type: "string", name: "Name", validation: { required: true } },
        price: { type: "number", name: "Price", columnType: "numeric" },
        active: { type: "boolean", name: "Active", defaultValue: true },
        created_at: { type: "date", name: "Created", autoValue: "on_create" }
    }
};
```

Rebase generates this Drizzle schema:

```typescript
// schema.generated.ts
import { pgTable, varchar, numeric, boolean, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    price: numeric("price"),
    active: boolean("active").default(true),
    created_at: timestamp("created_at").defaultNow()
});
```

Which produces this SQL:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    price NUMERIC,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Next Steps

- **[Collections](/docs/collections)** — Full collection configuration reference
- **[Drizzle Schema Generation](/docs/backend/schema-generation)** — Detailed column type mappings
