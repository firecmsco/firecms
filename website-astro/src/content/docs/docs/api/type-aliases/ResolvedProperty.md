---
slug: "docs/api/type-aliases/ResolvedProperty"
title: "ResolvedProperty"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / ResolvedProperty

# Type Alias: ResolvedProperty\<T\>

> **ResolvedProperty**\<`T`\> = `T` *extends* `string` ? [`ResolvedStringProperty`](ResolvedStringProperty) : `T` *extends* `number` ? [`ResolvedNumberProperty`](ResolvedNumberProperty) : `T` *extends* `boolean` ? [`ResolvedBooleanProperty`](ResolvedBooleanProperty) : `T` *extends* `Date` ? [`ResolvedTimestampProperty`](ResolvedTimestampProperty) : `T` *extends* [`GeoPoint`](../classes/GeoPoint) ? [`ResolvedGeopointProperty`](ResolvedGeopointProperty) : `T` *extends* [`EntityReference`](../classes/EntityReference) ? [`ResolvedReferenceProperty`](ResolvedReferenceProperty) : `T` *extends* [`CMSType`](CMSType)[] ? [`ResolvedArrayProperty`](ResolvedArrayProperty)\<`T`\> : `T` *extends* `Record`\<`string`, `any`\> ? [`ResolvedMapProperty`](ResolvedMapProperty)\<`T`\> : `any`

Defined in: [types/resolved\_entities.ts:33](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/resolved_entities.ts)

## Type Parameters

### T

`T` *extends* [`CMSType`](CMSType) = [`CMSType`](CMSType)
