---
slug: "docs/api/interfaces/SecurityRule"
title: "SecurityRule"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SecurityRule

# Interface: SecurityRule

Defined in: [types/src/types/collections.ts:795](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Flexible Row Level Security rule for a collection.

Inspired by Supabase's approach to PostgreSQL RLS. Rules can range from
simple convenience shortcuts to fully custom SQL expressions, giving you the
full power of PostgreSQL Row Level Security.

The authenticated user's identity is available in raw SQL via:
- `auth.uid()`   — the user's ID
- `auth.roles()` — comma-separated app role IDs
- `auth.jwt()`   — full JWT claims as JSONB

These are set automatically per-transaction by the backend.

**How rules combine:** PostgreSQL evaluates all matching policies for an
operation. Permissive rules are OR'd together (any one passing is enough).
Restrictive rules are AND'd (all must pass). This mirrors Supabase behavior.

## Properties

### access?

> `optional` **access**: `"public"`

Defined in: [types/src/types/collections.ts:882](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

**Shortcut.** Grant unrestricted row access (no row filtering) for this operation.
Generates `USING (true)`.

This means "no row-level filter", NOT "anonymous/unauthenticated access".
Authentication is still enforced at the API layer — this only controls which
*rows* authenticated users can see.

Typically used alone for genuinely public read endpoints, or combined with
`roles` to give certain roles an unfiltered view of the table.

Cannot be combined with `using` / `withCheck` / `ownerField`.

#### Example

```ts
// Public read (any authenticated user sees all rows)
{ operation: "select", access: "public" }
```

***

### mode?

> `optional` **mode**: `"permissive"` \| `"restrictive"`

Defined in: [types/src/types/collections.ts:849](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Whether this policy is `"permissive"` (default) or `"restrictive"`.

- **permissive**: Multiple permissive policies for the same operation are
  OR'd together — if *any* passes, access is granted.
- **restrictive**: Restrictive policies are AND'd with all permissive
  policies — they act as additional gates that *must* also pass.

This is the same model as PostgreSQL / Supabase.

#### Default

```ts
"permissive"
```

***

### name?

> `optional` **name**: `string`

Defined in: [types/src/types/collections.ts:804](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Optional human-readable name for the policy.
If not provided, one will be auto-generated from the table name and operation.
Must be unique per table.

When using `operations` (array), each generated policy will have the
operation name appended, e.g. `"owner_access_select"`, `"owner_access_update"`.

***

### operation?

> `optional` **operation**: [`SecurityOperation`](../type-aliases/SecurityOperation)

Defined in: [types/src/types/collections.ts:815](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Which SQL operation this policy applies to.
Use this when the policy targets a single operation or all operations.

For multiple specific operations, use `operations` (array) instead.
If neither is specified, defaults to `"all"`.

#### Default

```ts
"all"
```

***

### operations?

> `optional` **operations**: [`SecurityOperation`](../type-aliases/SecurityOperation)[]

Defined in: [types/src/types/collections.ts:835](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Array of SQL operations this policy applies to.
The compiler will generate one PostgreSQL policy per operation, sharing
the same configuration.

This reduces boilerplate when the same rule applies to multiple (but not all)
operations.

Takes precedence over `operation` (singular) if both are specified.

#### Examples

```ts
// Same rule for select and update
{ operations: ["select", "update"], ownerField: "user_id" }
```

```ts
// Equivalent to operation: "all"
{ operations: ["all"], ownerField: "user_id" }
```

***

### ownerField?

> `optional` **ownerField**: `string`

Defined in: [types/src/types/collections.ts:863](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

**Shortcut.** The property (column) that stores the owner's user ID.
Generates a USING/WITH CHECK clause like:
  `<column> = auth.uid()`

Cannot be combined with `using` / `withCheck` / `access`.

#### Example

```ts
{ operation: "all", ownerField: "user_id" }
```

***

### pgRoles?

> `optional` **pgRoles**: `string`[]

Defined in: [types/src/types/collections.ts:1006](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

**Advanced.** Native PostgreSQL database roles the policy applies to.

By default, all generated policies target the `public` role (i.e.
every database connection). This is correct for most setups where
a single database role is used for all connections.

**Important:** These are NOT the same as the application-level `roles`
(admin, editor, viewer, etc.) — those are enforced in the USING/WITH
CHECK clauses via `auth.roles()`. This field controls the PostgreSQL
`TO` clause in `CREATE POLICY ... TO role_name`.

Use this if you have dedicated PostgreSQL roles (e.g. `app_read`,
`app_write`) and want policies to target specific ones.

#### Default

```ts
["public"]
```

#### Example

```ts
// Only apply this policy when connected as `app_role`
{ operation: "select", access: "public", pgRoles: ["app_role"] }
```

***

### roles?

> `optional` **roles**: `string`[]

Defined in: [types/src/types/collections.ts:906](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

**Shortcut.** Restrict this rule to users that have one of these
application-level roles.

**Important:** These are NOT native PostgreSQL database roles. They are
application roles managed by Rebase, stored in the `rebase_user_roles`
table, and injected into each transaction via `auth.roles()`.

Generates a condition like:
  `auth.roles() ~ '<role1>|<role2>'`

Can be combined with `ownerField`, `access`, or raw `using`/`withCheck`.
When combined, the role check is AND'd with the other condition.

#### Examples

```ts
// Only admins can delete
{ operation: "delete", roles: ["admin"] }
```

```ts
// Admins have unfiltered read access to all rows
{ operation: "select", roles: ["admin"], using: "true" }
```

***

### using?

> `optional` **using**: `string`

Defined in: [types/src/types/collections.ts:939](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Raw SQL expression for the `USING` clause.
This controls which *existing* rows are visible / can be modified / deleted.
Applied to SELECT, UPDATE, and DELETE.

You can reference columns via `{column_name}` which will be resolved to
`table.column_name` in the generated Drizzle code. You can also use any
valid PostgreSQL expression.

Cannot be combined with `ownerField` or `access`.

#### Examples

```ts
// Rows published in the last 30 days are visible
{ operation: "select", using: "{published_at} > now() - interval '30 days'" }
```

```ts
// Only the owner, or users with 'moderator' role
{
  operation: "select",
  using: "{user_id} = auth.uid() OR auth.roles() ~ 'moderator'"
}
```

```ts
// Cross-table subquery: only if user belongs to the org
{
  operation: "select",
  using: "EXISTS (SELECT 1 FROM org_members WHERE org_members.org_id = {org_id} AND org_members.user_id = auth.uid())"
}
```

***

### withCheck?

> `optional` **withCheck**: `string`

Defined in: [types/src/types/collections.ts:981](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/collections.ts)

Raw SQL expression for the `WITH CHECK` clause.
This controls which *new/updated* row values are allowed.
Applied to INSERT and UPDATE.

Same syntax as `using` — use `{column_name}` to reference columns.

**Important for UPDATE:** PostgreSQL evaluates two row states — the
*existing* row (`USING`) and the *incoming new* row (`WITH CHECK`).
If you only specify `using`, the same expression is used for both.
For security-sensitive updates, always specify `withCheck` explicitly
to constrain what the new row values can be.

If not provided on INSERT/UPDATE policies, falls back to `using`
(which matches PostgreSQL's own default behavior).

Cannot be combined with `ownerField` or `access`.

#### Examples

```ts
// Users can only insert rows where they are the owner
{ operation: "insert", withCheck: "{user_id} = auth.uid()" }
```

```ts
// Prevent changing the status to 'archived' unless admin
{
  operation: "update",
  using: "{user_id} = auth.uid()",
  withCheck: "{status} != 'archived' OR auth.roles() ~ 'admin'"
}
```

```ts
// Restrictive gate: prevent locking AND unlocking unless admin.
// `using` checks the old row state, `withCheck` checks the new.
{
  operation: "update",
  mode: "restrictive",
  using: "{is_locked} = false",
  withCheck: "{is_locked} = false"
}
```
