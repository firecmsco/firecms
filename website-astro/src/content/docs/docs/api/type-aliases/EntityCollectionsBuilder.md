---
slug: "docs/api/type-aliases/EntityCollectionsBuilder"
title: "EntityCollectionsBuilder"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityCollectionsBuilder

# Type Alias: EntityCollectionsBuilder()\<EC\>

> **EntityCollectionsBuilder**\<`EC`\> = (`params`) => `EC`[] \| `Promise`\<`EC`[]\>

Defined in: [types/src/types/rebase.tsx:41](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Use this callback to build entity collections dynamically.
You can use the user to decide which collections to show, or how to render them.
You can also use the data API to fetch additional data to build the
collections (e.g., for enums).

Note: The underlying schema of the collections built here must map to your
strictly typed static backend schema. You cannot define new database columns
or arbitrary schemas here that aren't represented in your backend constraints.

Note: you can use any type of synchronous or asynchronous code here,
including fetching data from external sources, like using a REST API.

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection) = [`EntityCollection`](../interfaces/EntityCollection)

## Parameters

### params

#### authController

[`AuthController`](AuthController)

#### data

[`RebaseData`](../interfaces/RebaseData)

#### user

[`User`](User) \| `null`

## Returns

`EC`[] \| `Promise`\<`EC`[]\>
