---
slug: "docs/api/functions/resolveProperties"
title: "resolveProperties"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / resolveProperties

# Function: resolveProperties()

> **resolveProperties**\<`M`\>(`properties`): [`ResolvedProperties`](/docs/api/type-aliases/ResolvedProperties)\<`M`\>

Defined in: [util/resolutions.ts:366](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/resolutions.ts)

Resolve enums and arrays for properties

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### properties

#### authController

[`AuthController`](/docs/api/type-aliases/AuthController)

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

[`PropertiesOrBuilders`](/docs/api/type-aliases/PropertiesOrBuilders)\<`M`\>

#### propertyConfigs?

`Record`\<`string`, [`PropertyConfig`](/docs/api/type-aliases/PropertyConfig)\>

#### propertyKey?

`string`

#### values?

`Partial`\<`M`\>

## Returns

[`ResolvedProperties`](/docs/api/type-aliases/ResolvedProperties)\<`M`\>
