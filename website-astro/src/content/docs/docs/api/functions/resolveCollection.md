---
slug: "docs/api/functions/resolveCollection"
title: "resolveCollection"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / resolveCollection

# Function: resolveCollection()

> **resolveCollection**\<`M`\>(`__namedParameters`): [`ResolvedEntityCollection`](/docs/api/type-aliases/ResolvedEntityCollection)\<`M`\>

Defined in: [util/resolutions.ts:34](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/resolutions.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### \_\_namedParameters

#### authController

[`AuthController`](/docs/api/type-aliases/AuthController)

#### collection

[`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`M`, `any`\> \| [`ResolvedEntityCollection`](/docs/api/type-aliases/ResolvedEntityCollection)\<`M`\>

#### entityId?

`string`

#### ignoreMissingFields?

`boolean` = `false`

#### path

`string`

#### previousValues?

`Partial`\<`M`\>

#### propertyConfigs?

`Record`\<`string`, [`PropertyConfig`](/docs/api/type-aliases/PropertyConfig)\>

#### userConfigPersistence?

[`UserConfigurationPersistence`](/docs/api/interfaces/UserConfigurationPersistence)

#### values?

`Partial`\<`M`\>

## Returns

[`ResolvedEntityCollection`](/docs/api/type-aliases/ResolvedEntityCollection)\<`M`\>
