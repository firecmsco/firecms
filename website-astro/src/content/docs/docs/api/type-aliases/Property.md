---
slug: "docs/api/type-aliases/Property"
title: "Property"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / Property

# Type Alias: Property\<T\>

> **Property**\<`T`\> = `T` *extends* `string` ? [`StringProperty`](../interfaces/StringProperty) : `T` *extends* `number` ? [`NumberProperty`](../interfaces/NumberProperty) : `T` *extends* `boolean` ? [`BooleanProperty`](../interfaces/BooleanProperty) : `T` *extends* `Date` ? [`DateProperty`](../interfaces/DateProperty) : `T` *extends* [`GeoPoint`](../classes/GeoPoint) ? [`GeopointProperty`](../interfaces/GeopointProperty) : `T` *extends* [`EntityReference`](../classes/EntityReference) ? [`ReferenceProperty`](../interfaces/ReferenceProperty) : `T` *extends* [`CMSType`](CMSType)[] ? [`ArrayProperty`](../interfaces/ArrayProperty)\<`T`\> : `T` *extends* `Record`\<`string`, `any`\> ? [`MapProperty`](../interfaces/MapProperty)\<`T`\> : `AnyProperty`

Defined in: [types/properties.ts:53](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Type Parameters

### T

`T` *extends* [`CMSType`](CMSType) = `any`
