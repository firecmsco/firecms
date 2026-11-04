---
slug: "docs/api/type-aliases/DataType"
title: "DataType"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / DataType

# Type Alias: DataType\<T\>

> **DataType**\<`T`\> = `T` *extends* `string` ? `"string"` : `T` *extends* `number` ? `"number"` : `T` *extends* `boolean` ? `"boolean"` : `T` *extends* `Date` ? `"date"` : `T` *extends* [`GeoPoint`](/docs/api/classes/GeoPoint) ? `"geopoint"` : `T` *extends* [`Vector`](/docs/api/classes/Vector) ? `"vector"` : `T` *extends* [`EntityReference`](/docs/api/classes/EntityReference) ? `"reference"` : `T` *extends* `any`[] ? `"array"` : `T` *extends* `Record`\<`string`, `any`\> ? `"map"` : `never`

Defined in: [types/properties.ts:13](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Type Parameters

### T

`T` *extends* [`CMSType`](/docs/api/type-aliases/CMSType) = [`CMSType`](/docs/api/type-aliases/CMSType)
