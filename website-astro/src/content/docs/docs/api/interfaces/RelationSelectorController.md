---
slug: "docs/api/interfaces/RelationSelectorController"
title: "RelationSelectorController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RelationSelectorController

# Interface: RelationSelectorController

Defined in: [core/src/hooks/data/useRelationSelector.tsx:37](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

## Properties

### entityToRelationItem()

> **entityToRelationItem**: (`entity`, `relation`) => `RelationItem`

Defined in: [core/src/hooks/data/useRelationSelector.tsx:44](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

#### Parameters

##### entity

[`Entity`](Entity)\<`any`\>

##### relation

[`EntityRelation`](../classes/EntityRelation)

#### Returns

`RelationItem`

***

### error

> **error**: `Error` \| `undefined`

Defined in: [core/src/hooks/data/useRelationSelector.tsx:40](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

***

### hasMore

> **hasMore**: `boolean`

Defined in: [core/src/hooks/data/useRelationSelector.tsx:43](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/src/hooks/data/useRelationSelector.tsx:39](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

***

### items

> **items**: `RelationItem`[]

Defined in: [core/src/hooks/data/useRelationSelector.tsx:38](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

***

### loadMore()

> **loadMore**: () => `void`

Defined in: [core/src/hooks/data/useRelationSelector.tsx:42](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

#### Returns

`void`

***

### search()

> **search**: (`searchString`) => `void`

Defined in: [core/src/hooks/data/useRelationSelector.tsx:41](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

#### Parameters

##### searchString

`string`

#### Returns

`void`
