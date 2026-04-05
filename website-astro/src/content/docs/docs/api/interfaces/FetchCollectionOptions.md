---
slug: "docs/api/interfaces/FetchCollectionOptions"
title: "FetchCollectionOptions"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / FetchCollectionOptions

# Interface: FetchCollectionOptions\<M\>

Defined in: [types/src/types/backend.ts:44](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Options for fetching a collection of entities

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### databaseId?

> `optional` **databaseId**: `string`

Defined in: [types/src/types/backend.ts:51](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

***

### filter?

> `optional` **filter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/src/types/backend.ts:45](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

***

### limit?

> `optional` **limit**: `number`

Defined in: [types/src/types/backend.ts:48](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

***

### order?

> `optional` **order**: `"desc"` \| `"asc"`

Defined in: [types/src/types/backend.ts:47](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

***

### orderBy?

> `optional` **orderBy**: `string`

Defined in: [types/src/types/backend.ts:46](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

***

### searchString?

> `optional` **searchString**: `string`

Defined in: [types/src/types/backend.ts:50](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

***

### startAfter?

> `optional` **startAfter**: `unknown`

Defined in: [types/src/types/backend.ts:49](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)
