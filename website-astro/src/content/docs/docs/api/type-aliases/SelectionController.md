---
slug: "docs/api/type-aliases/SelectionController"
title: "SelectionController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SelectionController

# Type Alias: SelectionController\<M\>

> **SelectionController**\<`M`\> = `object`

Defined in: [types/src/types/collections.ts:531](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Use this controller to retrieve the selected entities or modify them in
an [EntityCollection](../interfaces/EntityCollection)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### isEntitySelected()

> **isEntitySelected**: (`entity`) => `boolean`

Defined in: [types/src/types/collections.ts:534](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`boolean`

***

### selectedEntities

> **selectedEntities**: [`Entity`](../interfaces/Entity)\<`M`\>[]

Defined in: [types/src/types/collections.ts:532](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### setSelectedEntities

> **setSelectedEntities**: `Dispatch`\<`SetStateAction`\<[`Entity`](../interfaces/Entity)\<`M`\>[]\>\>

Defined in: [types/src/types/collections.ts:533](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### toggleEntitySelection()

> **toggleEntitySelection**: (`entity`, `newSelectedState?`) => `void`

Defined in: [types/src/types/collections.ts:535](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

##### newSelectedState?

`boolean`

#### Returns

`void`
