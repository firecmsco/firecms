---
slug: "docs/api/functions/getCollectionByPathOrId"
title: "getCollectionByPathOrId"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / getCollectionByPathOrId

# Function: getCollectionByPathOrId()

> **getCollectionByPathOrId**(`pathOrId`, `collections`): [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`

Defined in: [util/navigation\_utils.ts:127](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/navigation_utils.ts)

Find the corresponding view at any depth for a given path.
Note that path or segments of the paths can be collection aliases.

## Parameters

### pathOrId

`string`

### collections

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

## Returns

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\> \| `undefined`
