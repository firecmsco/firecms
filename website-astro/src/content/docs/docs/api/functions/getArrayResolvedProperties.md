---
slug: "docs/api/functions/getArrayResolvedProperties"
title: "getArrayResolvedProperties"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / getArrayResolvedProperties

# Function: getArrayResolvedProperties()

> **getArrayResolvedProperties**\<`M`\>(`__namedParameters`): [`ResolvedProperty`](../type-aliases/ResolvedProperty)[]

Defined in: [util/resolutions.ts:225](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/resolutions.ts)

## Type Parameters

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

#### ignoreMissingFields

`boolean`

#### index?

`number`

#### path?

`string`

#### previousValues?

`Partial`\<`M`\>

#### property

[`ResolvedArrayProperty`](../type-aliases/ResolvedArrayProperty)\<`T`, `ArrayT`\> \| [`ArrayProperty`](../interfaces/ArrayProperty)\<`any`, `any`\>

#### propertyConfigs?

`Record`\<`string`, [`PropertyConfig`](../type-aliases/PropertyConfig)\>

#### propertyKey?

`string`

#### propertyValue

`any`

#### values?

`Partial`\<`M`\>

## Returns

[`ResolvedProperty`](../type-aliases/ResolvedProperty)[]
