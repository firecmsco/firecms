---
slug: "docs/api/interfaces/FetchCollectionProps"
title: "FetchCollectionProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / FetchCollectionProps

# Interface: FetchCollectionProps\<M\>

Defined in: [types/src/controllers/datasource.ts:28](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection?

> `optional` **collection**: [`EntityCollection`](EntityCollection)\<`M`, `any`\>

Defined in: [types/src/controllers/datasource.ts:30](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### filter?

> `optional` **filter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/src/controllers/datasource.ts:31](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### limit?

> `optional` **limit**: `number`

Defined in: [types/src/controllers/datasource.ts:32](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### order?

> `optional` **order**: `"desc"` \| `"asc"`

Defined in: [types/src/controllers/datasource.ts:36](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### orderBy?

> `optional` **orderBy**: `string`

Defined in: [types/src/controllers/datasource.ts:34](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### path

> **path**: `string`

Defined in: [types/src/controllers/datasource.ts:29](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### searchString?

> `optional` **searchString**: `string`

Defined in: [types/src/controllers/datasource.ts:35](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### startAfter?

> `optional` **startAfter**: `unknown`

Defined in: [types/src/controllers/datasource.ts:33](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)
