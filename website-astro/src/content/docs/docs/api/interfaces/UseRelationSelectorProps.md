---
slug: "docs/api/interfaces/UseRelationSelectorProps"
title: "UseRelationSelectorProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / UseRelationSelectorProps

# Interface: UseRelationSelectorProps\<M\>

Defined in: [core/src/hooks/data/useRelationSelector.tsx:6](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`\>

Defined in: [core/src/hooks/data/useRelationSelector.tsx:14](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

The collection that represents the relation entities

***

### descriptionProperty?

> `optional` **descriptionProperty**: keyof `M`

Defined in: [core/src/hooks/data/useRelationSelector.tsx:34](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

Property name to use as the secondary display field

***

### forceFilter?

> `optional` **forceFilter**: `Partial`\<`Record`\<`string`, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [core/src/hooks/data/useRelationSelector.tsx:18](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

Force filter to be applied to the relation search

***

### getDescriptionFromEntity()?

> `optional` **getDescriptionFromEntity**: (`entity`) => `string` \| `undefined`

Defined in: [core/src/hooks/data/useRelationSelector.tsx:30](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

Function to extract the description from an entity

#### Parameters

##### entity

[`Entity`](Entity)\<`M`\>

#### Returns

`string` \| `undefined`

***

### getLabelFromEntity()?

> `optional` **getLabelFromEntity**: (`entity`) => `string`

Defined in: [core/src/hooks/data/useRelationSelector.tsx:26](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

Function to extract the label from an entity

#### Parameters

##### entity

[`Entity`](Entity)\<`M`\>

#### Returns

`string`

***

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [core/src/hooks/data/useRelationSelector.tsx:22](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

Page size for pagination

***

### path

> **path**: `string`

Defined in: [core/src/hooks/data/useRelationSelector.tsx:10](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/data/useRelationSelector.tsx)

Full path where the relation data is located
