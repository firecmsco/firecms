---
slug: "docs/api/functions/traverseValuesProperties"
title: "traverseValuesProperties"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / traverseValuesProperties

# Function: traverseValuesProperties()

> **traverseValuesProperties**\<`M`\>(`inputValues`, `properties`, `operation`): `M` \| `undefined`

Defined in: [util/entities.ts:148](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/entities.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### inputValues

`Partial`\<[`EntityValues`](/docs/api/type-aliases/EntityValues)\<`M`\>\>

### properties

[`ResolvedProperties`](/docs/api/type-aliases/ResolvedProperties)\<`M`\>

### operation

(`value`, `property`) => `any`

## Returns

`M` \| `undefined`
