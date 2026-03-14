---
slug: "docs/api/functions/updateDateAutoValues"
title: "updateDateAutoValues"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / updateDateAutoValues

# Function: updateDateAutoValues()

> **updateDateAutoValues**\<`M`\>(`__namedParameters`): `M`

Defined in: [util/entities.ts:86](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/entities.ts)

Update the automatic values in an entity before save

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### \_\_namedParameters

#### inputValues

`Partial`\<[`EntityValues`](../type-aliases/EntityValues)\<`M`\>\>

#### properties

[`ResolvedProperties`](../type-aliases/ResolvedProperties)\<`M`\>

#### setDateToMidnight

(`input?`) => `any`

#### status

[`EntityStatus`](../type-aliases/EntityStatus)

#### timestampNowValue

`any`

## Returns

`M`
