---
slug: "docs/api/functions/resolveCollection"
title: "resolveCollection"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / resolveCollection

# Function: resolveCollection()

> **resolveCollection**\<`M`\>(`__namedParameters`): [`ResolvedEntityCollection`](../type-aliases/ResolvedEntityCollection)\<`M`\>

Defined in: [util/resolutions.ts:34](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/resolutions.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### \_\_namedParameters

#### authController

[`AuthController`](../type-aliases/AuthController)

#### collection

[`EntityCollection`](../interfaces/EntityCollection)\<`M`, `any`\> \| [`ResolvedEntityCollection`](../type-aliases/ResolvedEntityCollection)\<`M`\>

#### entityId?

`string`

#### ignoreMissingFields?

`boolean` = `false`

#### path

`string`

#### previousValues?

`Partial`\<`M`\>

#### propertyConfigs?

`Record`\<`string`, [`PropertyConfig`](../type-aliases/PropertyConfig)\>

#### userConfigPersistence?

[`UserConfigurationPersistence`](../interfaces/UserConfigurationPersistence)

#### values?

`Partial`\<`M`\>

## Returns

[`ResolvedEntityCollection`](../type-aliases/ResolvedEntityCollection)\<`M`\>
