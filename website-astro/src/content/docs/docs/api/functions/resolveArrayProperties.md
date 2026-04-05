---
slug: "docs/api/functions/resolveArrayProperties"
title: "resolveArrayProperties"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / resolveArrayProperties

# Function: resolveArrayProperties()

> **resolveArrayProperties**\<`M`\>(`__namedParameters`): [`Property`](../type-aliases/Property)[]

Defined in: [common/src/util/resolutions.ts:202](https://github.com/rebasepro/rebase/blob/main/packages/common/src/util/resolutions.ts)

## Type Parameters

### M

`M`

## Parameters

### \_\_namedParameters

#### authController

[`AuthController`](../type-aliases/AuthController)

#### entityId?

`string` \| `number`

#### ignoreMissingFields?

`boolean` = `false`

#### index?

`number`

#### path?

`string`

#### previousValues?

`Partial`\<`M`\>

#### property

[`ArrayProperty`](../interfaces/ArrayProperty)

#### propertyConfigs?

`Record`\<`string`, [`PropertyConfig`](../type-aliases/PropertyConfig)\>

#### propertyKey?

`string`

#### values?

`Partial`\<`M`\>

## Returns

[`Property`](../type-aliases/Property)[]
