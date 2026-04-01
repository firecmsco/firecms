---
slug: "docs/api/functions/getCollectionBySlugWithin"
title: "getCollectionBySlugWithin"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / getCollectionBySlugWithin

# Function: getCollectionBySlugWithin()

> **getCollectionBySlugWithin**(`slugOrPath`, `collections`): [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`

Defined in: [common/src/util/navigation\_utils.ts:125](https://github.com/rebaseco/rebase/blob/main/packages/common/src/util/navigation_utils.ts)

Find the corresponding view at any depth for a given path.
Note that path or segments of the paths can be collection aliases.

## Parameters

### slugOrPath

`string`

### collections

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

## Returns

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`
