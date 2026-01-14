---
slug: "docs/api/functions/useEntityFetch"
title: "useEntityFetch"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / useEntityFetch

# Function: useEntityFetch()

> **useEntityFetch**\<`M`, `USER`\>(`path`): [`EntityFetchResult`](../interfaces/EntityFetchResult)\<`M`\>

Defined in: [hooks/data/useEntityFetch.tsx:39](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/useEntityFetch.tsx)

This hook is used to fetch an entity.
It gives real time updates if the datasource supports it.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### path

[`EntityFetchProps`](../interfaces/EntityFetchProps)\<`M`, `USER`\>

## Returns

[`EntityFetchResult`](../interfaces/EntityFetchResult)\<`M`\>
