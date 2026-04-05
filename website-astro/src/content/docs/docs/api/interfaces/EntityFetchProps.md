---
slug: "docs/api/interfaces/EntityFetchProps"
title: "EntityFetchProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityFetchProps

# Interface: EntityFetchProps\<M, USER\>

Defined in: [core/src/hooks/data/useEntityFetch.tsx:10](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useEntityFetch.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`, `USER`\>

Defined in: [core/src/hooks/data/useEntityFetch.tsx:14](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useEntityFetch.tsx)

***

### databaseId?

> `optional` **databaseId**: `string`

Defined in: [core/src/hooks/data/useEntityFetch.tsx:13](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useEntityFetch.tsx)

***

### entityId?

> `optional` **entityId**: `string` \| `number`

Defined in: [core/src/hooks/data/useEntityFetch.tsx:12](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useEntityFetch.tsx)

***

### path

> **path**: `string`

Defined in: [core/src/hooks/data/useEntityFetch.tsx:11](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useEntityFetch.tsx)

***

### useCache?

> `optional` **useCache**: `boolean`

Defined in: [core/src/hooks/data/useEntityFetch.tsx:15](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/useEntityFetch.tsx)
