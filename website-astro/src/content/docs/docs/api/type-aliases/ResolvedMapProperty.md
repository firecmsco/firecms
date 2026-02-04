---
slug: "docs/api/type-aliases/ResolvedMapProperty"
title: "ResolvedMapProperty"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / ResolvedMapProperty

# Type Alias: ResolvedMapProperty\<T\>

> **ResolvedMapProperty**\<`T`\> = `Omit`\<[`MapProperty`](../interfaces/MapProperty), `"properties"` \| `"type"` \| `"propertiesOrder"`\> & `object`

Defined in: [types/resolved\_entities.ts:140](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/resolved_entities.ts)

## Type Declaration

### dataType

> **dataType**: `"map"`

### fromBuilder

> **fromBuilder**: `boolean`

### properties?

> `optional` **properties**: [`ResolvedProperties`](ResolvedProperties)\<`T`\>

### propertiesOrder?

> `optional` **propertiesOrder**: `Extract`\<keyof `T`, `string`\>[]

### resolved

> **resolved**: `true`

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `any`\> = `any`
