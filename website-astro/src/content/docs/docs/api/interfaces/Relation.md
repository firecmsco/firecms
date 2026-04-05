---
slug: "docs/api/interfaces/Relation"
title: "Relation"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / Relation

# Interface: Relation

Defined in: [types/src/types/relations.ts:12](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

Extended relation that combines base relation with Rebase UI config

## Properties

### cardinality

> **cardinality**: `"one"` \| `"many"`

Defined in: [types/src/types/relations.ts:28](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

The nature of the relationship, determining if one or many records are returned.

***

### direction?

> `optional` **direction**: `"owning"` \| `"inverse"`

Defined in: [types/src/types/relations.ts:36](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

Which side owns the persistence for this relationship.
- "owning": The foreign key (for one-to-one/many-to-one) or the junction table (for many-to-many) is managed by this collection.
- "inverse": The foreign key is on the target collection's table. This side of the relation is typically read-only.
Defaults to "owning".

***

### foreignKeyOnTarget?

> `optional` **foreignKeyOnTarget**: `string`

Defined in: [types/src/types/relations.ts:57](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

Column on the TARGET table that stores the foreign key to this entity.
Required when `direction` is "inverse".

#### Example

```ts
"post_id"
```

***

### inverseRelationName?

> `optional` **inverseRelationName**: `string`

Defined in: [types/src/types/relations.ts:43](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

The name of the inverse relation.
This is only needed when the inverse relation is not the same as the relation name.
For example, if the relation name is "posts", the inverse relation name might be "author".

***

### joinPath?

> `optional` **joinPath**: [`JoinStep`](JoinStep)[]

Defined in: [types/src/types/relations.ts:274](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

An explicit, ordered array of JOINs to perform to get from the source
to the target. Used for multi-hop relations, composite keys, or when you need
fine-grained control over the join logic.

When `joinPath` is provided, it overrides all other relation configuration
(localKey, foreignKeyOnTarget, through) and gives you complete control
over how tables are joined together.

#### Examples

```typescript
// Posts -> Authors relationship
{
  relationName: "author",
  target: () => authorsCollection,
  cardinality: "one",
  joinPath: [
    {
      table: "authors",
      on: {
        from: "author_id",  // Column on posts table
        to: "id"           // Column on authors table
      }
    }
  ]
}

// Generates: SELECT * FROM posts JOIN authors ON posts.author_id = authors.id
```

```typescript
// Users -> Permissions through Roles
{
  relationName: "permissions",
  target: () => permissionsCollection,
  cardinality: "many",
  joinPath: [
    {
      table: "user_roles",
      on: {
        from: "id",        // users.id
        to: "user_id"      // user_roles.user_id
      }
    },
    {
      table: "roles",
      on: {
        from: "role_id",   // user_roles.role_id
        to: "id"          // roles.id
      }
    },
    {
      table: "role_permissions",
      on: {
        from: "id",        // roles.id
        to: "role_id"      // role_permissions.role_id
      }
    },
    {
      table: "permissions",
      on: {
        from: "permission_id", // role_permissions.permission_id
        to: "id"              // permissions.id
      }
    }
  ]
}

// Generates:
// SELECT * FROM users
// JOIN user_roles ON users.id = user_roles.user_id
// JOIN roles ON user_roles.role_id = roles.id
// JOIN role_permissions ON roles.id = role_permissions.role_id
// JOIN permissions ON role_permissions.permission_id = permissions.id
```

```typescript
// Orders -> Customer by company_code + region
{
  relationName: "customer",
  target: () => customersCollection,
  cardinality: "one",
  joinPath: [
    {
      table: "customers",
      on: {
        from: ["company_code", "region_id"], // Multiple columns from orders
        to: ["code", "region_id"]            // Multiple columns on customers
      }
    }
  ]
}

// Generates:
// SELECT * FROM orders
// JOIN customers ON orders.company_code = customers.code
//               AND orders.region_id = customers.region_id
```

```typescript
// Users -> Friends (many-to-many self-reference)
{
  relationName: "friends",
  target: () => usersCollection, // Same collection
  cardinality: "many",
  joinPath: [
    {
      table: "friendships",
      on: {
        from: "id",         // users.id
        to: "user_id"       // friendships.user_id
      }
    },
    {
      table: "users",
      on: {
        from: "friend_id",  // friendships.friend_id
        to: "id"           // users.id (target)
      }
    }
  ]
}
```

```typescript
// Products -> Active Suppliers (only current, non-expired contracts)
{
  relationName: "activeSuppliers",
  target: () => suppliersCollection,
  cardinality: "many",
  joinPath: [
    {
      table: "product_supplier_contracts",
      on: {
        from: "id",           // products.id
        to: "product_id"      // contracts.product_id
      }
    },
    {
      table: "suppliers",
      on: {
        from: "supplier_id",  // contracts.supplier_id
        to: "id"             // suppliers.id
      }
    }
  ]
  // Note: Additional WHERE conditions for active/non-expired
  // would be handled in the query logic, not in joinPath
}
```

***

### localKey?

> `optional` **localKey**: `string`

Defined in: [types/src/types/relations.ts:50](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

Column on THIS table that stores the foreign key to the target.
Required when `direction` is "owning" and `cardinality` is "one".

#### Example

```ts
"author_id"
```

***

### onDelete?

> `optional` **onDelete**: [`OnAction`](../type-aliases/OnAction)

Defined in: [types/src/types/relations.ts:283](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

Action to perform on delete.

***

### onUpdate?

> `optional` **onUpdate**: [`OnAction`](../type-aliases/OnAction)

Defined in: [types/src/types/relations.ts:279](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

Action to perform on update.

***

### overrides?

> `optional` **overrides**: `Partial`\<[`EntityCollection`](EntityCollection)\<`any`, `any`\>\>

Defined in: [types/src/types/relations.ts:285](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

***

### relationName?

> `optional` **relationName**: `string`

Defined in: [types/src/types/relations.ts:18](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

The application-level name for this relationship.
If not provided, it will be inferred from the target collection path.

#### Example

```ts
"posts"
```

***

### target()

> **target**: () => [`EntityCollection`](EntityCollection)

Defined in: [types/src/types/relations.ts:23](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

The final collection you want to retrieve records from.

#### Returns

[`EntityCollection`](EntityCollection)

***

### through?

> `optional` **through**: `object`

Defined in: [types/src/types/relations.ts:113](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

Defines the junction table for a many-to-many relationship.
Required when `cardinality` is "many" and `direction` is "owning".

#### sourceColumn

> **sourceColumn**: `string`

#### table

> **table**: `string`

#### targetColumn

> **targetColumn**: `string`

#### Examples

```typescript
// Users collection
{
  relations: [{
    relationName: "roles",
    target: () => rolesCollection,
    cardinality: "many",
    through: {
      table: "user_roles",        // Junction table name
      sourceColumn: "user_id",    // Column that references this collection's ID
      targetColumn: "role_id"     // Column that references target collection's ID
    }
  }]
}

// This creates a junction table like:
// CREATE TABLE user_roles (
//   user_id INTEGER REFERENCES users(id),
//   role_id INTEGER REFERENCES roles(id),
//   PRIMARY KEY (user_id, role_id)
// );
```

```typescript
// Students and Courses with enrollment date
{
  relations: [{
    relationName: "courses",
    target: () => coursesCollection,
    cardinality: "many",
    through: {
      table: "enrollments",
      sourceColumn: "student_id",
      targetColumn: "course_id"
    }
  }]
}

// Junction table can have additional columns:
// CREATE TABLE enrollments (
//   student_id INTEGER REFERENCES students(id),
//   course_id INTEGER REFERENCES courses(id),
//   enrolled_at TIMESTAMP DEFAULT NOW(),
//   grade VARCHAR(2),
//   PRIMARY KEY (student_id, course_id)
// );
```

***

### validation?

> `optional` **validation**: `object`

Defined in: [types/src/types/relations.ts:287](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/relations.ts)

#### required?

> `optional` **required**: `boolean`
