---
slug: "docs/api/type-aliases/ResolvedProperty"
title: "ResolvedProperty"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / ResolvedProperty

# Type Alias: ResolvedProperty\<T\>

> **ResolvedProperty**\<`T`\> = `T` *extends* `string` ? [`ResolvedStringProperty`](/docs/api/type-aliases/ResolvedStringProperty) : `T` *extends* `number` ? [`ResolvedNumberProperty`](/docs/api/type-aliases/ResolvedNumberProperty) : `T` *extends* `boolean` ? [`ResolvedBooleanProperty`](/docs/api/type-aliases/ResolvedBooleanProperty) : `T` *extends* `Date` ? [`ResolvedTimestampProperty`](/docs/api/type-aliases/ResolvedTimestampProperty) : `T` *extends* [`GeoPoint`](/docs/api/classes/GeoPoint) ? [`ResolvedGeopointProperty`](/docs/api/type-aliases/ResolvedGeopointProperty) : `T` *extends* [`EntityReference`](/docs/api/classes/EntityReference) ? [`ResolvedReferenceProperty`](/docs/api/type-aliases/ResolvedReferenceProperty) : `T` *extends* [`CMSType`](/docs/api/type-aliases/CMSType)[] ? [`ResolvedArrayProperty`](/docs/api/type-aliases/ResolvedArrayProperty)\<`T`\> : `T` *extends* `Record`\<`string`, `any`\> ? [`ResolvedMapProperty`](/docs/api/type-aliases/ResolvedMapProperty)\<`T`\> : `any`

Defined in: [types/resolved\_entities.ts:33](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/resolved_entities.ts)

## Type Parameters

### T

`T` *extends* [`CMSType`](/docs/api/type-aliases/CMSType) = [`CMSType`](/docs/api/type-aliases/CMSType)
