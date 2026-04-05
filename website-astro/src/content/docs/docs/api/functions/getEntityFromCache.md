---
slug: "docs/api/functions/getEntityFromCache"
title: "getEntityFromCache"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / getEntityFromCache

# Function: getEntityFromCache()

> **getEntityFromCache**(`path`): `object` \| `undefined`

Defined in: [core/src/util/entity\_cache.ts:167](https://github.com/rebasepro/rebase/blob/main/packages/core/src/util/entity_cache.ts)

Retrieves an entity from the in-memory cache or `sessionStorage`.
If the entity is not in the cache but exists in `sessionStorage`, it loads it into the cache.

## Parameters

### path

`string`

The unique path/key for the entity.

## Returns

`object` \| `undefined`

The cached entity or `undefined` if not found.
