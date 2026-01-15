---
slug: "docs/api/interfaces/CollectionFetchProps"
title: "CollectionFetchProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / CollectionFetchProps

# Interface: CollectionFetchProps\<M\>

Defined in: [hooks/data/useCollectionFetch.tsx:10](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`\>

Defined in: [hooks/data/useCollectionFetch.tsx:20](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx)

collection of the entity displayed by this collection

***

### filterValues?

> `optional` **filterValues**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [hooks/data/useCollectionFetch.tsx:30](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx)

Filter the fetched data by the property

***

### itemCount?

> `optional` **itemCount**: `number`

Defined in: [hooks/data/useCollectionFetch.tsx:25](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx)

Number of entities to fetch

***

### path

> **path**: `string`

Defined in: [hooks/data/useCollectionFetch.tsx:15](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx)

Absolute collection path

***

### searchString?

> `optional` **searchString**: `string`

Defined in: [hooks/data/useCollectionFetch.tsx:40](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx)

Search string

***

### sortBy?

> `optional` **sortBy**: \[`Extract`\<keyof `M`, `string`\>, `"desc"` \| `"asc"`\]

Defined in: [hooks/data/useCollectionFetch.tsx:35](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx)

Sort the results by
