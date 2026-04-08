---
title: Security Rules (RLS)
sidebar_label: Security Rules
slug: docs/collections/security-rules
description: Define Row Level Security policies for your collections using convenience shortcuts or raw SQL expressions.
---

## Overview

Security rules let you define **Row Level Security (RLS)** policies for your PostgreSQL tables directly in your collection definitions. When the Drizzle schema is generated, Rebase creates the corresponding `CREATE POLICY` statements.

```typescript
const postsCollection: EntityCollection = {
    slug: "posts",
    dbPath: "posts",
    properties: { /* ... */ },
    securityRules: [
        { operation: "select", access: "public" },
        { operations: ["insert", "update", "delete"], ownerField: "author_id" }
    ]
};
```

## How It Works

1. You define `securityRules` on a collection
2. `rebase schema generate` creates Drizzle schema with RLS enabled
3. `rebase db push` or `rebase db migrate` applies the policies to PostgreSQL
4. Every query is filtered by the current user's context automatically

The authenticated user's identity is available in SQL via:

| Function | Returns |
|----------|---------|
| `auth.uid()` | The current user's ID |
| `auth.roles()` | Comma-separated app role IDs |
| `auth.jwt()` | Full JWT claims as JSONB |

These are set automatically per-transaction by the Rebase backend.

## Convenience Shortcuts

### Owner-based Access

The simplest pattern — users can only access rows they own:

```typescript
securityRules: [
    { operation: "all", ownerField: "user_id" }
]
```

This generates: `USING (user_id = auth.uid())`

### Public Access

Allow anyone (including unauthenticated users) to read:

```typescript
securityRules: [
    { operation: "select", access: "public" }
]
```

This generates: `USING (true)`

### Authenticated Access

Allow any authenticated user:

```typescript
securityRules: [
    { operation: "select", access: "authenticated" }
]
```

### Role-based Access

Restrict operations to specific roles:

```typescript
securityRules: [
    { operation: "all", roles: ["admin"] },
    { operation: "select", roles: ["editor", "viewer"] }
]
```

## Raw SQL Expressions

For complex logic, use `using` and `withCheck`:

```typescript
securityRules: [
    {
        operation: "select",
        using: "EXISTS (SELECT 1 FROM org_members WHERE org_members.org_id = {org_id} AND org_members.user_id = auth.uid())"
    }
]
```

- **`using`** — Filters which existing rows are visible (applies to SELECT, UPDATE, DELETE)
- **`withCheck`** — Validates new row values (applies to INSERT, UPDATE)

Column references use `{column_name}` syntax which gets resolved to the full table-qualified column.

## Combining Shortcuts and SQL

Mix convenience shortcuts with raw SQL:

```typescript
securityRules: [
    // Admins can do anything
    { operation: "all", roles: ["admin"], using: "true" },
    // Regular users can only see their own rows
    { operation: "select", ownerField: "user_id" },
    // Users can insert, but only for themselves
    { operation: "insert", withCheck: "{user_id} = auth.uid()" },
    // Locked rows cannot be updated
    { operation: "update", mode: "restrictive", using: "{is_locked} = false" }
]
```

## Permissive vs Restrictive

PostgreSQL has two policy modes:

- **Permissive** (default) — Multiple permissive policies are **OR'd** together. If any one passes, access is granted.
- **Restrictive** — Restrictive policies are **AND'd** together. All must pass.

```typescript
securityRules: [
    // Permissive: owners can access their rows
    { operation: "all", ownerField: "user_id" },
    // Restrictive: but locked rows cannot be updated
    { operation: "update", mode: "restrictive", using: "{is_locked} = false", withCheck: "{is_locked} = false" }
]
```

## Operations

| Operation | SQL Equivalent | Description |
|-----------|---------------|-------------|
| `"select"` | `SELECT` | Read rows |
| `"insert"` | `INSERT` | Create new rows |
| `"update"` | `UPDATE` | Modify existing rows |
| `"delete"` | `DELETE` | Remove rows |
| `"all"` | All of the above | Shorthand for all operations |

You can also use `operations` (plural) to apply one rule to multiple operations:

```typescript
{ operations: ["insert", "update", "delete"], ownerField: "author_id" }
```

## Full SecurityRule Interface

```typescript
interface SecurityRule {
    name?: string;              // Human-readable policy name
    operation?: SecurityOperation;   // Single operation
    operations?: SecurityOperation[]; // Multiple operations
    mode?: "permissive" | "restrictive"; // Default: "permissive"
    access?: "public" | "authenticated";
    ownerField?: string;        // Column containing the owner user ID
    roles?: string[];           // App roles that this policy applies to
    using?: string;             // Raw SQL USING expression
    withCheck?: string;         // Raw SQL WITH CHECK expression
}
```

## Examples

### Blog Platform

```typescript
securityRules: [
    // Anyone can read published posts
    { operation: "select", access: "public", using: "{status} = 'published'" },
    // Authors can see their own drafts
    { operation: "select", ownerField: "author_id" },
    // Authors can create and edit their own posts
    { operations: ["insert", "update"], ownerField: "author_id" },
    // Only admins can delete
    { operation: "delete", roles: ["admin"] }
]
```

### Multi-Tenant SaaS

```typescript
securityRules: [
    {
        operation: "all",
        using: "EXISTS (SELECT 1 FROM org_members WHERE org_members.org_id = {org_id} AND org_members.user_id = auth.uid())"
    }
]
```

## Next Steps

- **[Relations](/docs/collections/relations)** — Foreign keys and joins
- **[Entity Callbacks](/docs/collections/callbacks)** — Lifecycle hooks
