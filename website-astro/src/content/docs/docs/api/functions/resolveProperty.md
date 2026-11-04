---
slug: "docs/api/functions/resolveProperty"
title: "resolveProperty"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / resolveProperty

# Function: resolveProperty()

> **resolveProperty**\<`T`, `M`\>(`propertyOrBuilder`): [`ResolvedProperty`](/docs/api/type-aliases/ResolvedProperty)\<`T`\> \| `null`

Defined in: [util/resolutions.ts:104](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/resolutions.ts)

Resolve property builders, enums and arrays.

## Type Parameters

### T

`T` *extends* [`CMSType`](/docs/api/type-aliases/CMSType) = [`CMSType`](/docs/api/type-aliases/CMSType)

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Parameters

### propertyOrBuilder

#### authController

[`AuthController`](/docs/api/type-aliases/AuthController)

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

`Record`\<`string`, [`PropertyConfig`](/docs/api/type-aliases/PropertyConfig)\<`any`\>\>

#### propertyKey?

`string`

#### propertyOrBuilder

[`PropertyOrBuilder`](/docs/api/type-aliases/PropertyOrBuilder)\<`T`, `M`\> \| [`ResolvedProperty`](/docs/api/type-aliases/ResolvedProperty)\<`T`\>

#### values?

`Partial`\<`M`\>

## Returns

[`ResolvedProperty`](/docs/api/type-aliases/ResolvedProperty)\<`T`\> \| `null`
