---
slug: "docs/api/functions/traverseValuesProperties"
title: "traverseValuesProperties"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / traverseValuesProperties

# Function: traverseValuesProperties()

> **traverseValuesProperties**\<`M`\>(`inputValues`, `properties`, `operation`): `M` \| `undefined`

Defined in: [util/entities.ts:148](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/entities.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### inputValues

`Partial`\<[`EntityValues`](../type-aliases/EntityValues)\<`M`\>\>

### properties

[`ResolvedProperties`](../type-aliases/ResolvedProperties)\<`M`\>

### operation

(`value`, `property`) => `any`

## Returns

`M` \| `undefined`
