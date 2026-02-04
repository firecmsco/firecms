---
slug: "docs/api/type-aliases/DataType"
title: "type"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / DataType

# Type Alias: DataType\<T\>

> **DataType**\<`T`\> = `T` *extends* `string` ? `"string"` : `T` *extends* `number` ? `"number"` : `T` *extends* `boolean` ? `"boolean"` : `T` *extends* `Date` ? `"date"` : `T` *extends* [`GeoPoint`](../classes/GeoPoint) ? `"geopoint"` : `T` *extends* [`Vector`](../classes/Vector) ? `"vector"` : `T` *extends* [`EntityReference`](../classes/EntityReference) ? `"reference"` : `T` *extends* `any`[] ? `"array"` : `T` *extends* `Record`\<`string`, `any`\> ? `"map"` : `never`

Defined in: [types/properties.ts:13](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Type Parameters

### T

`T` *extends* [`CMSType`](CMSType) = [`CMSType`](CMSType)
