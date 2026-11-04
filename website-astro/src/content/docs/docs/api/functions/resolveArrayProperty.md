---
slug: "docs/api/functions/resolveArrayProperty"
title: "resolveArrayProperty"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / resolveArrayProperty

# Function: resolveArrayProperty()

> **resolveArrayProperty**\<`T`, `M`\>(`__namedParameters`): [`ResolvedArrayProperty`](/docs/api/type-aliases/ResolvedArrayProperty)

Defined in: [util/resolutions.ts:258](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/resolutions.ts)

## Type Parameters

### T

`T` *extends* `any`[]

### M

`M`

## Parameters

### \_\_namedParameters

#### authController

[`AuthController`](/docs/api/type-aliases/AuthController)

#### entityId?

`string`

#### fromBuilder?

`boolean`

#### ignoreMissingFields?

`boolean` = `false`

#### index?

`number`

#### path?

`string`

#### previousValues?

`Partial`\<`M`\>

#### property

[`ResolvedArrayProperty`](/docs/api/type-aliases/ResolvedArrayProperty)\<`T`, `ArrayT`\> \| [`ArrayProperty`](/docs/api/interfaces/ArrayProperty)\<`T`, `any`\>

#### propertyConfigs?

`Record`\<`string`, [`PropertyConfig`](/docs/api/type-aliases/PropertyConfig)\>

#### propertyKey?

`string`

#### values?

`Partial`\<`M`\>

## Returns

[`ResolvedArrayProperty`](/docs/api/type-aliases/ResolvedArrayProperty)
