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

### dataSource

> **dataSource**: [`DataSource`](../interfaces/DataSource)

Defined in: [types/src/rebase\_context.tsx:27](https://github.com/rebaseco/rebase/blob/main/packages/types/src/rebase_context.tsx)

Connector to your database, e.g. your Firestore database

***

### storageSource

> **storageSource**: [`StorageSource`](../interfaces/StorageSource)

Defined in: [types/src/rebase\_context.tsx:32](https://github.com/rebaseco/rebase/blob/main/packages/types/src/rebase_context.tsx)

Used storage implementation

***

### user?

> `optional` **user**: `USER`

Defined in: [types/src/rebase\_context.tsx:37](https://github.com/rebaseco/rebase/blob/main/packages/types/src/rebase_context.tsx)

Set by the backend when callbacks are executed on the server.
