---
slug: "docs/api/interfaces/CollectionFetchProps"
title: "CollectionFetchProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CollectionFetchProps

# Interface: CollectionFetchProps\<M\>

Defined in: [core/src/hooks/data/useCollectionFetch.tsx:9](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useCollectionFetch.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`\>

Defined in: [core/src/hooks/data/useCollectionFetch.tsx:19](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useCollectionFetch.tsx)

collection of the entity displayed by this collection

***

### filterValues?

> `optional` **filterValues**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [core/src/hooks/data/useCollectionFetch.tsx:29](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useCollectionFetch.tsx)

Filter the fetched data by the property

***

### itemCount?

> `optional` **itemCount**: `number`

Defined in: [core/src/hooks/data/useCollectionFetch.tsx:24](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useCollectionFetch.tsx)

Number of entities to fetch

***

### path

> **path**: `string`

Defined in: [core/src/hooks/data/useCollectionFetch.tsx:14](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useCollectionFetch.tsx)

Absolute collection path

***

### searchString?

> `optional` **searchString**: `string`

Defined in: [core/src/hooks/data/useCollectionFetch.tsx:39](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useCollectionFetch.tsx)

Search string

***

### sortBy?

> `optional` **sortBy**: \[`Extract`\<keyof `M`, `string`\>, `"desc"` \| `"asc"`\]

Defined in: [core/src/hooks/data/useCollectionFetch.tsx:34](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useCollectionFetch.tsx)

Sort the results by
