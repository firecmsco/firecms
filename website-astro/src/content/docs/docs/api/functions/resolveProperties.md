---
slug: "docs/api/functions/resolveProperties"
title: "resolveProperties"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / resolveProperties

# Function: resolveProperties()

> **resolveProperties**\<`M`\>(`properties`): [`Properties`](../type-aliases/Properties)

Defined in: [common/src/util/resolutions.ts:168](https://github.com/rebaseco/rebase/blob/main/packages/common/src/util/resolutions.ts)

Resolve enums and arrays for properties

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### properties

#### authController

[`AuthController`](../type-aliases/AuthController)

#### entityId?

`string` \| `number`

#### ignoreMissingFields?

`boolean`

#### index?

`number`

#### path?

`string`

#### previousValues?

`Partial`\<`M`\>

#### properties

[`Properties`](../type-aliases/Properties)

#### propertyConfigs?

`Record`\<`string`, [`PropertyConfig`](../type-aliases/PropertyConfig)\>

#### propertyKey?

`string`

#### values?

`Partial`\<`M`\>

## Returns

[`Properties`](../type-aliases/Properties)
