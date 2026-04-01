---
slug: "docs/api/interfaces/SearchOptions"
title: "SearchOptions"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SearchOptions

# Interface: SearchOptions\<M\>

Defined in: [types/src/types/backend.ts:57](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Options for searching entities

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### databaseId?

> `optional` **databaseId**: `string`

Defined in: [types/src/types/backend.ts:62](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

***

### filter?

> `optional` **filter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/src/types/backend.ts:58](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

***

### limit?

> `optional` **limit**: `number`

Defined in: [types/src/types/backend.ts:61](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

***

### order?

> `optional` **order**: `"desc"` \| `"asc"`

Defined in: [types/src/types/backend.ts:60](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

***

### orderBy?

> `optional` **orderBy**: `string`

Defined in: [types/src/types/backend.ts:59](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)
