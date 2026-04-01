---
slug: "docs/api/interfaces/JoinStep"
title: "JoinStep"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / JoinStep

# Interface: JoinStep

Defined in: [types/src/types/relations.ts:321](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/relations.ts)

Defines a single, explicit step in a multi-join path.

Each step represents one JOIN operation in the sequence. The `from` columns
refer to the previous table in the chain (or the source table for the first step),
and the `to` columns refer to the current table being joined.

## Examples

```typescript
{
  table: "authors",
  on: {
    from: "author_id",  // Column from previous table (e.g., posts.author_id)
    to: "id"           // Column from current table (authors.id)
  }
}
```

```typescript
{
  table: "order_items",
  on: {
    from: ["order_id", "store_id"],    // Multiple columns from previous table
    to: ["order_id", "store_id"]       // Corresponding columns in current table
  }
}
```

## Properties

### on

> **on**: `object`

Defined in: [types/src/types/relations.ts:347](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/relations.ts)

The join condition for this step. Defines how the previous table
connects to the current table.

- `from`: Column name(s) on the PREVIOUS table in the join chain
- `to`: Column name(s) on the CURRENT table (specified in `table`)

For the first step, `from` refers to the source collection's table.
For subsequent steps, `from` refers to the table from the previous step.

Both `from` and `to` support:
- Single column: `"user_id"`
- Multiple columns: `["company_id", "region_id"]` for composite keys

When using arrays, both `from` and `to` must have the same length,
and columns are matched by position (index 0 with index 0, etc.).

#### from

> **from**: `string` \| `string`[]

#### to

> **to**: `string` \| `string`[]

***

### table

> **table**: `string`

Defined in: [types/src/types/relations.ts:328](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/relations.ts)

The database table name to join TO in this step.
This is the table you're joining into, not the table you're joining from.

#### Example

```ts
"authors", "user_roles", "product_categories"
```
