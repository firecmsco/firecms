---
slug: "docs/api/interfaces/SaveEntityProps"
title: "SaveEntityProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SaveEntityProps

# Interface: SaveEntityProps\<M\>

Defined in: [types/src/controllers/datasource.ts:52](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection?

> `optional` **collection**: [`EntityCollection`](EntityCollection)\<`M`, `any`\>

Defined in: [types/src/controllers/datasource.ts:57](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### entityId?

> `optional` **entityId**: `string` \| `number`

Defined in: [types/src/controllers/datasource.ts:55](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### path

> **path**: `string`

Defined in: [types/src/controllers/datasource.ts:53](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### previousValues?

> `optional` **previousValues**: `Partial`\<`M`\>

Defined in: [types/src/controllers/datasource.ts:56](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### status

> **status**: [`EntityStatus`](../type-aliases/EntityStatus)

Defined in: [types/src/controllers/datasource.ts:58](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

***

### values

> **values**: `Partial`\<[`EntityValues`](../type-aliases/EntityValues)\<`M`\>\>

Defined in: [types/src/controllers/datasource.ts:54](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)
