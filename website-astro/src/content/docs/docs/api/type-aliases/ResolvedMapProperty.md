---
slug: "docs/api/type-aliases/ResolvedMapProperty"
title: "ResolvedMapProperty"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / ResolvedMapProperty

# Type Alias: ResolvedMapProperty\<T\>

> **ResolvedMapProperty**\<`T`\> = `Omit`\<[`MapProperty`](../interfaces/MapProperty), `"properties"` \| `"type"` \| `"propertiesOrder"`\> & `object`

Defined in: [types/resolved\_entities.ts:140](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/resolved_entities.ts)

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
