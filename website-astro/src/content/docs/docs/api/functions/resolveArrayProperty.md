---
slug: "docs/api/functions/resolveArrayProperty"
title: "resolveArrayProperty"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / resolveArrayProperty

# Function: resolveArrayProperty()

> **resolveArrayProperty**\<`T`, `M`\>(`__namedParameters`): [`ResolvedArrayProperty`](../type-aliases/ResolvedArrayProperty)

Defined in: [util/resolutions.ts:258](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/resolutions.ts)

## Type Parameters

### T

`T` *extends* `any`[]

### M

`M`

## Parameters

### \_\_namedParameters

#### authController

[`AuthController`](../type-aliases/AuthController)

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

[`ResolvedArrayProperty`](../type-aliases/ResolvedArrayProperty)\<`T`, `ArrayT`\> \| [`ArrayProperty`](../interfaces/ArrayProperty)\<`T`, `any`\>

#### propertyConfigs?

`Record`\<`string`, [`PropertyConfig`](../type-aliases/PropertyConfig)\>

#### propertyKey?

`string`

#### values?

`Partial`\<`M`\>

## Returns

[`ResolvedArrayProperty`](../type-aliases/ResolvedArrayProperty)
