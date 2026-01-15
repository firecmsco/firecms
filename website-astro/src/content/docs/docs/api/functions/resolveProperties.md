---
slug: "docs/api/functions/resolveProperties"
title: "resolveProperties"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / resolveProperties

# Function: resolveProperties()

> **resolveProperties**\<`M`\>(`properties`): [`ResolvedProperties`](../type-aliases/ResolvedProperties)\<`M`\>

Defined in: [util/resolutions.ts:366](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/resolutions.ts)

Resolve enums and arrays for properties

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### properties

#### authController

[`AuthController`](../type-aliases/AuthController)

#### entityId?

`string`

#### fromBuilder?

`boolean`

#### ignoreMissingFields?

`boolean`

#### index?

`number`

#### path?

`string`

#### previousValues?

`Partial`\<`M`\>

#### properties

[`PropertiesOrBuilders`](../type-aliases/PropertiesOrBuilders)\<`M`\>

#### propertyConfigs?

`Record`\<`string`, [`PropertyConfig`](../type-aliases/PropertyConfig)\>

#### propertyKey?

`string`

#### values?

`Partial`\<`M`\>

## Returns

[`ResolvedProperties`](../type-aliases/ResolvedProperties)\<`M`\>
