---
slug: "docs/api/interfaces/FindResponse"
title: "FindResponse"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / FindResponse

# Interface: FindResponse\<M\>

Defined in: [types/src/controllers/data.ts:43](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Paginated response from a collection query.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### data

> **data**: [`Entity`](Entity)\<`M`\>[]

Defined in: [types/src/controllers/data.ts:45](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Array of entities matching the query

***

### meta

> **meta**: `object`

Defined in: [types/src/controllers/data.ts:47](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Pagination metadata

#### hasMore

> **hasMore**: `boolean`

#### limit

> **limit**: `number`

#### offset

> **offset**: `number`

#### total

> **total**: `number`
