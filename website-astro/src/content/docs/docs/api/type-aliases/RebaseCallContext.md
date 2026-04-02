---
slug: "docs/api/type-aliases/RebaseCallContext"
title: "RebaseCallContext"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RebaseCallContext

# Type Alias: RebaseCallContext\<USER\>

> **RebaseCallContext**\<`USER`\> = `object`

Defined in: [types/src/rebase\_context.tsx:22](https://github.com/rebaseco/rebase/blob/main/packages/types/src/rebase_context.tsx)

Context that is provided to entity callbacks (hooks).
It contains only the dependencies that are available in both the frontend and the backend.

## Type Parameters

### USER

`USER` *extends* [`User`](User) = [`User`](User)

## Properties

### data

> **data**: [`RebaseData`](../interfaces/RebaseData)

Defined in: [types/src/rebase\_context.tsx:28](https://github.com/rebaseco/rebase/blob/main/packages/types/src/rebase_context.tsx)

Unified data access — `context.data.products.create(...)`.
Access any collection as a dynamic property.

***

### storageSource

> **storageSource**: [`StorageSource`](../interfaces/StorageSource)

Defined in: [types/src/rebase\_context.tsx:33](https://github.com/rebaseco/rebase/blob/main/packages/types/src/rebase_context.tsx)

Used storage implementation

***

### user?

> `optional` **user**: `USER`

Defined in: [types/src/rebase\_context.tsx:38](https://github.com/rebaseco/rebase/blob/main/packages/types/src/rebase_context.tsx)

Set by the backend when callbacks are executed on the server.
