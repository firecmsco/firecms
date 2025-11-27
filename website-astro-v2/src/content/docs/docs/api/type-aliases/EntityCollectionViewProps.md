---
slug: "docs/api/type-aliases/EntityCollectionViewProps"
title: "EntityCollectionViewProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityCollectionViewProps

# Type Alias: EntityCollectionViewProps\<M\>

> **EntityCollectionViewProps**\<`M`\> = `object` & [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

Defined in: [components/EntityCollectionView/EntityCollectionView.tsx:91](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionView/EntityCollectionView.tsx)

## Type Declaration

### className?

> `optional` **className**: `string`

### fullIdPath?

> `optional` **fullIdPath**: `string`

Full path using navigation ids.

### fullPath?

> `optional` **fullPath**: `string`

Complete path where this collection is located.
It defaults to the collection path if not provided.

### isSubCollection?

> `optional` **isSubCollection**: `boolean`

Whether this is a subcollection or not.

### parentCollectionIds?

> `optional` **parentCollectionIds**: `string`[]

If this is a subcollection, specify the parent collection ids.

### updateUrl?

> `optional` **updateUrl**: `boolean`

If true, this view will store its filter and sorting status in the url params

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>
