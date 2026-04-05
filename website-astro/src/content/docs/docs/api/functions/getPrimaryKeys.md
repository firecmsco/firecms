---
slug: "docs/api/functions/getPrimaryKeys"
title: "getPrimaryKeys"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / getPrimaryKeys

# Function: getPrimaryKeys()

> **getPrimaryKeys**\<`M`\>(`collection`): `Extract`\<keyof `M`, `string`\>[]

Defined in: [common/src/util/collections.ts:113](https://github.com/rebasepro/rebase/blob/main/packages/common/src/util/collections.ts)

Returns the primary keys for an entity collection by inspecting the properties
and finding any properties with `isId`.
Fallbacks to `["id"]` if no properties are marked as `isId: true`.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### collection

[`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

## Returns

`Extract`\<keyof `M`, `string`\>[]
