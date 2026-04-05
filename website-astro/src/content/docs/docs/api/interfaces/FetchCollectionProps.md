---
slug: "docs/api/interfaces/FetchCollectionProps"
title: "FetchCollectionProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / FetchCollectionProps

# Interface: FetchCollectionProps\<M\>

Defined in: [types/src/controllers/data\_driver.ts:28](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

**`Internal`**

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection?

> `optional` **collection**: [`EntityCollection`](EntityCollection)\<`M`, `any`\>

Defined in: [types/src/controllers/data\_driver.ts:30](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### filter?

> `optional` **filter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/src/controllers/data\_driver.ts:31](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### limit?

> `optional` **limit**: `number`

Defined in: [types/src/controllers/data\_driver.ts:32](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### order?

> `optional` **order**: `"desc"` \| `"asc"`

Defined in: [types/src/controllers/data\_driver.ts:36](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### orderBy?

> `optional` **orderBy**: `string`

Defined in: [types/src/controllers/data\_driver.ts:34](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### path

> **path**: `string`

Defined in: [types/src/controllers/data\_driver.ts:29](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### searchString?

> `optional` **searchString**: `string`

Defined in: [types/src/controllers/data\_driver.ts:35](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### startAfter?

> `optional` **startAfter**: `unknown`

Defined in: [types/src/controllers/data\_driver.ts:33](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)
