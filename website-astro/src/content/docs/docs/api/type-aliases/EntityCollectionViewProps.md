---
slug: "docs/api/type-aliases/EntityCollectionViewProps"
title: "EntityCollectionViewProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityCollectionViewProps

# Type Alias: EntityCollectionViewProps\<M\>

> **EntityCollectionViewProps**\<`M`\> = `object` & [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

Defined in: [core/src/components/EntityCollectionView/EntityCollectionView.tsx:94](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionView.tsx)

## Type Declaration

### className?

> `optional` **className**: `string`

### idPath?

> `optional` **idPath**: `string`

Full path using navigation ids.

### isSubCollection?

> `optional` **isSubCollection**: `boolean`

Whether this is a subcollection or not.

### parentCollectionIds?

> `optional` **parentCollectionIds**: `string`[]

If this is a subcollection, specify the parent collection ids.

### path?

> `optional` **path**: `string`

Complete path where this collection is located.
It defaults to the collection path if not provided.

### updateUrl?

> `optional` **updateUrl**: `boolean`

If true, this view will store its filter and sorting status in the url params

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>
