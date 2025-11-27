---
slug: "docs/api/type-aliases/PropertyBuilderProps"
title: "PropertyBuilderProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / PropertyBuilderProps

# Type Alias: PropertyBuilderProps\<M\>

> **PropertyBuilderProps**\<`M`\> = `object`

Defined in: [types/properties.ts:248](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### authController

> **authController**: [`AuthController`](AuthController)

Defined in: [types/properties.ts:278](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Controller to manage authentication

***

### entityId?

> `optional` **entityId**: `string`

Defined in: [types/properties.ts:273](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Entity ID

***

### index?

> `optional` **index**: `number`

Defined in: [types/properties.ts:265](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Index of this property (only for arrays)

***

### path

> **path**: `string`

Defined in: [types/properties.ts:269](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Path of the entity in the data source

***

### previousValues?

> `optional` **previousValues**: `Partial`\<`M`\>

Defined in: [types/properties.ts:257](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Previous values of the entity before being saved

***

### propertyValue?

> `optional` **propertyValue**: `any`

Defined in: [types/properties.ts:261](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Current value of this property

***

### values

> **values**: `Partial`\<`M`\>

Defined in: [types/properties.ts:253](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Current values of the entity
