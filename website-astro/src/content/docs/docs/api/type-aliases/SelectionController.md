---
slug: "docs/api/type-aliases/SelectionController"
title: "SelectionController"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / SelectionController

# Type Alias: SelectionController\<M\>

> **SelectionController**\<`M`\> = `object`

Defined in: [types/collections.ts:427](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Use this controller to retrieve the selected entities or modify them in
an [EntityCollection](/docs/api/interfaces/EntityCollection)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### isEntitySelected()

> **isEntitySelected**: (`entity`) => `boolean`

Defined in: [types/collections.ts:430](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Parameters

##### entity

[`Entity`](/docs/api/interfaces/Entity)\<`M`\>

#### Returns

`boolean`

***

### selectedEntities

> **selectedEntities**: [`Entity`](/docs/api/interfaces/Entity)\<`M`\>[]

Defined in: [types/collections.ts:428](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### setSelectedEntities

> **setSelectedEntities**: `Dispatch`\<`SetStateAction`\<[`Entity`](/docs/api/interfaces/Entity)\<`M`\>[]\>\>

Defined in: [types/collections.ts:429](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### toggleEntitySelection()

> **toggleEntitySelection**: (`entity`, `newSelectedState?`) => `void`

Defined in: [types/collections.ts:431](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Parameters

##### entity

[`Entity`](/docs/api/interfaces/Entity)\<`M`\>

##### newSelectedState?

`boolean`

#### Returns

`void`
