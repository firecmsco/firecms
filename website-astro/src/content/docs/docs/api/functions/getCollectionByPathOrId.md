---
slug: "docs/api/functions/getCollectionByPathOrId"
title: "getCollectionByPathOrId"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / getCollectionByPathOrId

# Function: getCollectionByPathOrId()

> **getCollectionByPathOrId**(`pathOrId`, `collections`): [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`

Defined in: [util/navigation\_utils.ts:127](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/navigation_utils.ts)

Find the corresponding view at any depth for a given path.
Note that path or segments of the paths can be collection aliases.

## Parameters

### pathOrId

`string`

### collections

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

## Returns

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`
