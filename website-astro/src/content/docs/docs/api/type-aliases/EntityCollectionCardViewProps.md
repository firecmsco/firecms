---
slug: "docs/api/type-aliases/EntityCollectionCardViewProps"
title: "EntityCollectionCardViewProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityCollectionCardViewProps

# Type Alias: EntityCollectionCardViewProps\<M\>

> **EntityCollectionCardViewProps**\<`M`\> = `object`

Defined in: [core/src/components/EntityCollectionView/EntityCollectionCardView.tsx:17](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionCardView.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection

> **collection**: [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

Defined in: [core/src/components/EntityCollectionView/EntityCollectionCardView.tsx:18](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionCardView.tsx)

***

### emptyComponent?

> `optional` **emptyComponent**: `React.ReactNode`

Defined in: [core/src/components/EntityCollectionView/EntityCollectionCardView.tsx:24](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionCardView.tsx)

***

### highlightedEntities?

> `optional` **highlightedEntities**: [`Entity`](../interfaces/Entity)\<`M`\>[]

Defined in: [core/src/components/EntityCollectionView/EntityCollectionCardView.tsx:23](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionCardView.tsx)

***

### initialScroll?

> `optional` **initialScroll**: `number`

Defined in: [core/src/components/EntityCollectionView/EntityCollectionCardView.tsx:30](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionCardView.tsx)

***

### onEntityClick()?

> `optional` **onEntityClick**: (`entity`) => `void`

Defined in: [core/src/components/EntityCollectionView/EntityCollectionCardView.tsx:20](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionCardView.tsx)

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`void`

***

### onScroll()?

> `optional` **onScroll**: (`props`) => `void`

Defined in: [core/src/components/EntityCollectionView/EntityCollectionCardView.tsx:25](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionCardView.tsx)

#### Parameters

##### props

###### scrollDirection

`"forward"` \| `"backward"`

###### scrollOffset

`number`

###### scrollUpdateWasRequested

`boolean`

#### Returns

`void`

***

### selectionController?

> `optional` **selectionController**: [`SelectionController`](SelectionController)\<`M`\>

Defined in: [core/src/components/EntityCollectionView/EntityCollectionCardView.tsx:21](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionCardView.tsx)

***

### selectionEnabled?

> `optional` **selectionEnabled**: `boolean`

Defined in: [core/src/components/EntityCollectionView/EntityCollectionCardView.tsx:22](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionCardView.tsx)

***

### size?

> `optional` **size**: [`CollectionSize`](CollectionSize)

Defined in: [core/src/components/EntityCollectionView/EntityCollectionCardView.tsx:39](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionCardView.tsx)

Size of the cards in the grid view.
- "xs": Extra small cards, most cards per row
- "s": Small cards
- "m": Medium cards (default)
- "l": Large cards
- "xl": Extra large cards, fewest cards per row

***

### tableController

> **tableController**: [`EntityTableController`](EntityTableController)\<`M`\>

Defined in: [core/src/components/EntityCollectionView/EntityCollectionCardView.tsx:19](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionCardView.tsx)
