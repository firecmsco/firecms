---
title: Relations
sidebar_label: Relations
slug: docs/collections/relations
description: Define one-to-one, one-to-many, and many-to-many SQL relations between collections with foreign keys, junction tables, and multi-hop joins.
---

## Overview

Relations define how collections are connected at the database level. They enable Rebase to:

- Render **relation picker fields** in entity forms
- Resolve **related entities** when displaying previews
- Generate **foreign key constraints** in the Drizzle schema
- Support **cascade delete/update** behaviors

Relations are defined in the `relations` array of a collection:

```typescript
const postsCollection: EntityCollection = {
    slug: "posts",
    name: "Posts",
    table: "posts",
    properties: {
        title: { type: "string", name: "Title" },
        content: { type: "string", name: "Content", multiline: true },
        author: { type: "relation", name: "Author", relationName: "author" }
    },
    relations: [
        {
            relationName: "author",
            target: () => usersCollection,
            cardinality: "one",
            localKey: "author_id"
        }
    ]
};
```

## Relation Types

### One-to-One / Many-to-One

A foreign key on **this** table points to another table's primary key.

```typescript
relations: [
    {
        relationName: "author",
        target: () => usersCollection,
        cardinality: "one",          // This entity has ONE author
        direction: "owning",         // The FK is on THIS table
        localKey: "author_id"        // Column on the posts table
    }
]
```

This creates: `posts.author_id → users.id`

### One-to-Many (Inverse)

The foreign key is on the **target** table, pointing back to this entity.

```typescript
// On the Users collection:
relations: [
    {
        relationName: "posts",
        target: () => postsCollection,
        cardinality: "many",          // This user has MANY posts
        direction: "inverse",         // The FK is on the TARGET table
        foreignKeyOnTarget: "author_id"  // Column on the posts table
    }
]
```

### Many-to-Many (Junction Table)

Two collections connected through an intermediate junction table.

```typescript
// On the Users collection:
relations: [
    {
        relationName: "roles",
        target: () => rolesCollection,
        cardinality: "many",
        direction: "owning",
        through: {
            table: "user_roles",         // Junction table name
            sourceColumn: "user_id",     // FK to this collection
            targetColumn: "role_id"      // FK to target collection
        }
    }
]
```

This creates:
```sql
CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);
```

## Relation Properties

To render a relation field in a form, add a property with `type: "relation"`:

```typescript
properties: {
    author: {
        type: "relation",
        name: "Author",
        relationName: "author",    // Must match a relation in the relations array
        widget: "select"           // "select" (dropdown) or "dialog" (full picker)
    }
}
```

## Multi-Hop Joins

For complex relationships that traverse multiple tables, use `joinPath`:

```typescript
// Users → Permissions through Roles
relations: [
    {
        relationName: "permissions",
        target: () => permissionsCollection,
        cardinality: "many",
        joinPath: [
            {
                table: "user_roles",
                on: { from: "id", to: "user_id" }
            },
            {
                table: "roles",
                on: { from: "role_id", to: "id" }
            },
            {
                table: "role_permissions",
                on: { from: "id", to: "role_id" }
            },
            {
                table: "permissions",
                on: { from: "permission_id", to: "id" }
            }
        ]
    }
]
```

### Composite Key Joins

```typescript
joinPath: [
    {
        table: "customers",
        on: {
            from: ["company_code", "region_id"],  // Multiple columns
            to: ["code", "region_id"]
        }
    }
]
```

## Cascade Rules

Control what happens when related entities are updated or deleted:

```typescript
relations: [
    {
        relationName: "author",
        target: () => usersCollection,
        cardinality: "one",
        localKey: "author_id",
        onDelete: "cascade",    // Delete posts when user is deleted
        onUpdate: "cascade"     // Update FK when user ID changes
    }
]
```

| Action | Behavior |
|--------|----------|
| `"cascade"` | Propagate the change to related rows |
| `"restrict"` | Prevent the operation if related rows exist |
| `"no action"` | Same as restrict (defer to constraint check) |
| `"set null"` | Set the FK column to NULL |
| `"set default"` | Set the FK column to its default value |

## Full Relation Interface

```typescript
interface Relation {
    relationName?: string;
    target: () => EntityCollection;
    cardinality: "one" | "many";
    direction?: "owning" | "inverse";
    inverseRelationName?: string;
    localKey?: string;
    foreignKeyOnTarget?: string;
    through?: {
        table: string;
        sourceColumn: string;
        targetColumn: string;
    };
    joinPath?: JoinStep[];
    onUpdate?: "cascade" | "restrict" | "no action" | "set null" | "set default";
    onDelete?: "cascade" | "restrict" | "no action" | "set null" | "set default";
    overrides?: Partial<EntityCollection>;
    validation?: { required?: boolean };
}
```

## Next Steps

- **[Security Rules](/docs/collections/security-rules)** — Row Level Security
- **[Properties](/docs/collections/properties)** — Property types reference
