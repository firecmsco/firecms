---
slug: "docs/api/interfaces/FetchCollectionProps"
title: "FetchCollectionProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / FetchCollectionProps

# Interface: FetchCollectionProps\<M\>

Defined in: [types/datasource.ts:29](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection?

> `optional` **collection**: [`EntityCollection`](EntityCollection)\<`M`, `any`\> \| [`ResolvedEntityCollection`](../type-aliases/ResolvedEntityCollection)\<`M`\>

Defined in: [types/datasource.ts:31](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### filter?

> `optional` **filter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/datasource.ts:32](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### limit?

> `optional` **limit**: `number`

Defined in: [types/datasource.ts:33](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### order?

> `optional` **order**: `"desc"` \| `"asc"`

Defined in: [types/datasource.ts:37](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### orderBy?

> `optional` **orderBy**: `string`

Defined in: [types/datasource.ts:35](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### path

> **path**: `string`

Defined in: [types/datasource.ts:30](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### searchString?

> `optional` **searchString**: `string`

Defined in: [types/datasource.ts:36](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

***

### startAfter?

> `optional` **startAfter**: `any`

Defined in: [types/datasource.ts:34](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)
