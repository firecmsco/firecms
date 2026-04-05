---
slug: "docs/api/interfaces/BackendInstance"
title: "BackendInstance"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / BackendInstance

# Interface: BackendInstance

Defined in: [types/src/types/backend.ts:359](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

A complete backend instance with all required services

## Properties

### collectionRegistry

> **collectionRegistry**: [`CollectionRegistryInterface`](CollectionRegistryInterface)

Defined in: [types/src/types/backend.ts:373](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Collection registry

***

### connection

> **connection**: [`DatabaseConnection`](DatabaseConnection)

Defined in: [types/src/types/backend.ts:378](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

The underlying database connection

***

### entityRepository

> **entityRepository**: [`EntityRepository`](EntityRepository)

Defined in: [types/src/types/backend.ts:363](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Entity repository for CRUD operations

***

### realtimeProvider

> **realtimeProvider**: [`RealtimeProvider`](RealtimeProvider)

Defined in: [types/src/types/backend.ts:368](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Realtime provider for subscriptions
