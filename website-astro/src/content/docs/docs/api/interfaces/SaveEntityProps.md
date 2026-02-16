---
slug: "docs/api/interfaces/SaveEntityProps"
title: "SaveEntityProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / SaveEntityProps

# Interface: SaveEntityProps\<M\>

Defined in: [types/datasource.ts:53](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection?

> `optional` **collection**: [`EntityCollection`](EntityCollection)\<`M`, `any`\> \| [`ResolvedEntityCollection`](../type-aliases/ResolvedEntityCollection)\<`M`\>

Defined in: [types/datasource.ts:58](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### entityId?

> `optional` **entityId**: `string`

Defined in: [types/datasource.ts:56](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### path

> **path**: `string`

Defined in: [types/datasource.ts:54](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### previousValues?

> `optional` **previousValues**: `Partial`\<`M`\>

Defined in: [types/datasource.ts:57](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### status

> **status**: [`EntityStatus`](../type-aliases/EntityStatus)

Defined in: [types/datasource.ts:59](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### values

> **values**: `Partial`\<[`EntityValues`](../type-aliases/EntityValues)\<`M`\>\>

Defined in: [types/datasource.ts:55](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)
