---
slug: "docs/api/type-aliases/ResolvedArrayProperty"
title: "ResolvedArrayProperty"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / ResolvedArrayProperty

# Type Alias: ResolvedArrayProperty\<T, ArrayT\>

> **ResolvedArrayProperty**\<`T`, `ArrayT`\> = `Omit`\<[`ArrayProperty`](/docs/api/interfaces/ArrayProperty), `"of"` \| `"oneOf"` \| `"dataType"`\> & `object`

Defined in: [types/resolved\_entities.ts:121](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/resolved_entities.ts)

## Type Declaration

### dataType

> **dataType**: `"array"`

### fromBuilder

> **fromBuilder**: `boolean`

### of?

> `optional` **of**: [`ResolvedProperty`](/docs/api/type-aliases/ResolvedProperty)\<`any`\> \| [`ResolvedProperty`](/docs/api/type-aliases/ResolvedProperty)\<`any`\>[]

### oneOf?

> `optional` **oneOf**: `object`

#### oneOf.properties

> **properties**: [`ResolvedProperties`](/docs/api/type-aliases/ResolvedProperties)

#### oneOf.typeField?

> `optional` **typeField**: `string`

#### oneOf.valueField?

> `optional` **valueField**: `string`

### resolved

> **resolved**: `true`

### resolvedProperties

> **resolvedProperties**: [`ResolvedProperty`](/docs/api/type-aliases/ResolvedProperty)\<`any`\>[]

## Type Parameters

### T

`T` *extends* `ArrayT`[] = `any`[]

### ArrayT

`ArrayT` *extends* [`CMSType`](/docs/api/type-aliases/CMSType) = [`CMSType`](/docs/api/type-aliases/CMSType)
