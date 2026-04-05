---
slug: "docs/api/type-aliases/EntityCardProps"
title: "EntityCardProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityCardProps

# Type Alias: EntityCardProps\<M\>

> **EntityCardProps**\<`M`\> = `object`

Defined in: [core/src/components/EntityCollectionView/EntityCard.tsx:32](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCard.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection

> **collection**: [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

Defined in: [core/src/components/EntityCollectionView/EntityCard.tsx:34](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCard.tsx)

***

### entity

> **entity**: [`Entity`](../interfaces/Entity)\<`M`\>

Defined in: [core/src/components/EntityCollectionView/EntityCard.tsx:33](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCard.tsx)

***

### highlighted?

> `optional` **highlighted**: `boolean`

Defined in: [core/src/components/EntityCollectionView/EntityCard.tsx:37](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCard.tsx)

***

### onClick()?

> `optional` **onClick**: (`entity`) => `void`

Defined in: [core/src/components/EntityCollectionView/EntityCard.tsx:35](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCard.tsx)

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`void`

***

### onSelectionChange()?

> `optional` **onSelectionChange**: (`entity`, `selected`) => `void`

Defined in: [core/src/components/EntityCollectionView/EntityCard.tsx:38](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCard.tsx)

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

##### selected

`boolean`

#### Returns

`void`

***

### selected?

> `optional` **selected**: `boolean`

Defined in: [core/src/components/EntityCollectionView/EntityCard.tsx:36](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCard.tsx)

***

### selectionEnabled?

> `optional` **selectionEnabled**: `boolean`

Defined in: [core/src/components/EntityCollectionView/EntityCard.tsx:39](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCard.tsx)

***

### size?

> `optional` **size**: [`CollectionSize`](CollectionSize)

Defined in: [core/src/components/EntityCollectionView/EntityCard.tsx:43](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCard.tsx)

Size of the card - affects checkbox styling
