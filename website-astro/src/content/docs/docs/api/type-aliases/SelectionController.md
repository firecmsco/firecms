---
slug: "docs/api/type-aliases/SelectionController"
title: "SelectionController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / SelectionController

# Type Alias: SelectionController\<M\>

> **SelectionController**\<`M`\> = `object`

Defined in: [types/collections.ts:427](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Use this controller to retrieve the selected entities or modify them in
an [EntityCollection](../interfaces/EntityCollection)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### isEntitySelected()

> **isEntitySelected**: (`entity`) => `boolean`

Defined in: [types/collections.ts:430](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`boolean`

***

### selectedEntities

> **selectedEntities**: [`Entity`](../interfaces/Entity)\<`M`\>[]

Defined in: [types/collections.ts:428](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### setSelectedEntities

> **setSelectedEntities**: `Dispatch`\<`SetStateAction`\<[`Entity`](../interfaces/Entity)\<`M`\>[]\>\>

Defined in: [types/collections.ts:429](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### toggleEntitySelection()

> **toggleEntitySelection**: (`entity`, `newSelectedState?`) => `void`

Defined in: [types/collections.ts:431](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

##### newSelectedState?

`boolean`

#### Returns

`void`
