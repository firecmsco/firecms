---
slug: "docs/api/type-aliases/ResolvedEntityCollection"
title: "ResolvedEntityCollection"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / ResolvedEntityCollection

# Type Alias: ResolvedEntityCollection\<M\>

> **ResolvedEntityCollection**\<`M`\> = `Omit`\<[`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`M`\>, `"properties"`\> & `object`

Defined in: [types/resolved\_entities.ts:21](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/resolved_entities.ts)

This is the same entity collection you define, only all the property builders
are resolved to regular `Property` objects.

## Type Declaration

### editable?

> `optional` **editable**: `boolean`

### originalCollection

> **originalCollection**: [`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`M`\>

### properties

> **properties**: [`ResolvedProperties`](/docs/api/type-aliases/ResolvedProperties)\<`M`\>

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`
