---
slug: "docs/api/functions/getArrayResolvedProperties"
title: "getArrayResolvedProperties"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / getArrayResolvedProperties

# Function: getArrayResolvedProperties()

> **getArrayResolvedProperties**\<`M`\>(`__namedParameters`): [`ResolvedProperty`](/docs/api/type-aliases/ResolvedProperty)[]

Defined in: [util/resolutions.ts:225](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/resolutions.ts)

## Type Parameters

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

#### ignoreMissingFields

`boolean`

#### index?

`number`

#### path?

`string`

#### previousValues?

`Partial`\<`M`\>

#### property

[`ResolvedArrayProperty`](/docs/api/type-aliases/ResolvedArrayProperty)\<`T`, `ArrayT`\> \| [`ArrayProperty`](/docs/api/interfaces/ArrayProperty)\<`any`, `any`\>

#### propertyConfigs?

`Record`\<`string`, [`PropertyConfig`](/docs/api/type-aliases/PropertyConfig)\>

#### propertyKey?

`string`

#### propertyValue

`any`

#### values?

`Partial`\<`M`\>

## Returns

[`ResolvedProperty`](/docs/api/type-aliases/ResolvedProperty)[]
