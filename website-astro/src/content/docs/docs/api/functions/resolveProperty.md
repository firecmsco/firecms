---
slug: "docs/api/functions/resolveProperty"
title: "resolveProperty"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / resolveProperty

# Function: resolveProperty()

> **resolveProperty**\<`T`, `M`\>(`propertyOrBuilder`): [`ResolvedProperty`](../type-aliases/ResolvedProperty)\<`T`\> \| `null`

Defined in: [util/resolutions.ts:104](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/resolutions.ts)

Resolve property builders, enums and arrays.

## Type Parameters

### T

`T` *extends* [`CMSType`](../type-aliases/CMSType) = [`CMSType`](../type-aliases/CMSType)

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Parameters

### propertyOrBuilder

#### authController

[`AuthController`](../type-aliases/AuthController)

#### entityId?

`string`

#### fromBuilder?

`boolean` = `false`

#### ignoreMissingFields?

`boolean` = `false`

#### index?

`number`

#### path?

`string`

#### previousValues?

`Partial`\<`M`\>

#### propertyConfigs?

`Record`\<`string`, [`PropertyConfig`](../type-aliases/PropertyConfig)\<`any`\>\>

#### propertyKey?

`string`

#### propertyOrBuilder

[`PropertyOrBuilder`](../type-aliases/PropertyOrBuilder)\<`T`, `M`\> \| [`ResolvedProperty`](../type-aliases/ResolvedProperty)\<`T`\>

#### values?

`Partial`\<`M`\>

## Returns

[`ResolvedProperty`](../type-aliases/ResolvedProperty)\<`T`\> \| `null`
