---
slug: "docs/api/type-aliases/ResolvedArrayProperty"
title: "ResolvedArrayProperty"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / ResolvedArrayProperty

# Type Alias: ResolvedArrayProperty\<T, ArrayT\>

> **ResolvedArrayProperty**\<`T`, `ArrayT`\> = `Omit`\<[`ArrayProperty`](../interfaces/ArrayProperty), `"of"` \| `"oneOf"` \| `"type"`\> & `object`

Defined in: [types/resolved\_entities.ts:121](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/resolved_entities.ts)

## Type Declaration

### dataType

> **dataType**: `"array"`

### fromBuilder

> **fromBuilder**: `boolean`

### of?

> `optional` **of**: [`ResolvedProperty`](ResolvedProperty)\<`any`\> \| [`ResolvedProperty`](ResolvedProperty)\<`any`\>[]

### oneOf?

> `optional` **oneOf**: `object`

#### oneOf.properties

> **properties**: [`ResolvedProperties`](ResolvedProperties)

#### oneOf.typeField?

> `optional` **typeField**: `string`

#### oneOf.valueField?

> `optional` **valueField**: `string`

### resolved

> **resolved**: `true`

### resolvedProperties

> **resolvedProperties**: [`ResolvedProperty`](ResolvedProperty)\<`any`\>[]

## Type Parameters

### T

`T` *extends* `ArrayT`[] = `any`[]

### ArrayT

`ArrayT` *extends* [`CMSType`](CMSType) = [`CMSType`](CMSType)
