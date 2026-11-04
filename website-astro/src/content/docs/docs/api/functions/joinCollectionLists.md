---
slug: "docs/api/functions/joinCollectionLists"
title: "joinCollectionLists"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / joinCollectionLists

# Function: joinCollectionLists()

> **joinCollectionLists**(`targetCollections`, `sourceCollections`, `parentPaths`, `modifyCollection?`): [`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`any`, `any`\>[]

Defined in: [util/join\_collections.ts:36](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/join_collections.ts)

## Parameters

### targetCollections

[`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`any`, `any`\>[]

### sourceCollections

[`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`any`, `any`\>[] | `undefined`

### parentPaths

`string`[] = `[]`

### modifyCollection?

(`props`) => `void` \| [`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`any`, `any`\>

## Returns

[`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`any`, `any`\>[]
