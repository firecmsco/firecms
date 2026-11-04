---
slug: "docs/api/type-aliases/Property"
title: "Property"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / Property

# Type Alias: Property\<T\>

> **Property**\<`T`\> = `T` *extends* `string` ? [`StringProperty`](/docs/api/interfaces/StringProperty) : `T` *extends* `number` ? [`NumberProperty`](/docs/api/interfaces/NumberProperty) : `T` *extends* `boolean` ? [`BooleanProperty`](/docs/api/interfaces/BooleanProperty) : `T` *extends* `Date` ? [`DateProperty`](/docs/api/interfaces/DateProperty) : `T` *extends* [`GeoPoint`](/docs/api/classes/GeoPoint) ? [`GeopointProperty`](/docs/api/interfaces/GeopointProperty) : `T` *extends* [`EntityReference`](/docs/api/classes/EntityReference) ? [`ReferenceProperty`](/docs/api/interfaces/ReferenceProperty) : `T` *extends* [`CMSType`](/docs/api/type-aliases/CMSType)[] ? [`ArrayProperty`](/docs/api/interfaces/ArrayProperty)\<`T`\> : `T` *extends* `Record`\<`string`, `any`\> ? [`MapProperty`](/docs/api/interfaces/MapProperty)\<`T`\> : `AnyProperty`

Defined in: [types/properties.ts:53](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Type Parameters

### T

`T` *extends* [`CMSType`](/docs/api/type-aliases/CMSType) = `any`
