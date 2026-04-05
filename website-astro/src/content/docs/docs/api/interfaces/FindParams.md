---
slug: "docs/api/interfaces/FindParams"
title: "FindParams"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / FindParams

# Interface: FindParams

Defined in: [types/src/controllers/data.ts:10](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data.ts)

Parameters for querying a collection.
Uses PostgREST-style filter syntax for consistency between
the SDK (HTTP) and framework (in-process) contexts.

## Properties

### include?

> `optional` **include**: `string`[]

Defined in: [types/src/controllers/data.ts:34](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data.ts)

Relations to include in the response

***

### limit?

> `optional` **limit**: `number`

Defined in: [types/src/controllers/data.ts:12](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data.ts)

Maximum number of items to return (default: 20)

***

### offset?

> `optional` **offset**: `number`

Defined in: [types/src/controllers/data.ts:14](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data.ts)

Number of items to skip

***

### orderBy?

> `optional` **orderBy**: `string`

Defined in: [types/src/controllers/data.ts:32](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data.ts)

Sort order. Format: "field:direction".

#### Example

```ts
"created_at:desc", "name:asc"
```

***

### page?

> `optional` **page**: `number`

Defined in: [types/src/controllers/data.ts:16](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data.ts)

Page number (1-indexed), alternative to offset

***

### searchString?

> `optional` **searchString**: `string`

Defined in: [types/src/controllers/data.ts:36](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data.ts)

Full-text search string

***

### where?

> `optional` **where**: `Record`\<`string`, `string`\>

Defined in: [types/src/controllers/data.ts:27](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data.ts)

PostgREST-style filter object.
Keys are field names, values use "operator.value" format.
Operators: eq, neq, gt, gte, lt, lte, in, nin, cs (array-contains), csa (array-contains-any)

#### Example

```ts
{ status: "eq.published" }
{ age: "gte.18" }
{ role: "in.(admin,editor)" }
```
