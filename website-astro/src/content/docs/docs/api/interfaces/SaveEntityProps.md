---
slug: "docs/api/interfaces/SaveEntityProps"
title: "SaveEntityProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SaveEntityProps

# Interface: SaveEntityProps\<M\>

Defined in: [types/src/controllers/data\_driver.ts:52](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

**`Internal`**

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection?

> `optional` **collection**: [`EntityCollection`](EntityCollection)\<`M`, `any`\>

Defined in: [types/src/controllers/data\_driver.ts:57](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### entityId?

> `optional` **entityId**: `string` \| `number`

Defined in: [types/src/controllers/data\_driver.ts:55](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### path

> **path**: `string`

Defined in: [types/src/controllers/data\_driver.ts:53](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### previousValues?

> `optional` **previousValues**: `Partial`\<`M`\>

Defined in: [types/src/controllers/data\_driver.ts:56](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### status

> **status**: [`EntityStatus`](../type-aliases/EntityStatus)

Defined in: [types/src/controllers/data\_driver.ts:58](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

***

### values

> **values**: `Partial`\<[`EntityValues`](../type-aliases/EntityValues)\<`M`\>\>

Defined in: [types/src/controllers/data\_driver.ts:54](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/data_driver.ts)
