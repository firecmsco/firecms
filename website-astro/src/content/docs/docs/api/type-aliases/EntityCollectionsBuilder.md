---
slug: "docs/api/type-aliases/EntityCollectionsBuilder"
title: "EntityCollectionsBuilder"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityCollectionsBuilder

# Type Alias: EntityCollectionsBuilder()\<EC\>

> **EntityCollectionsBuilder**\<`EC`\> = (`params`) => `EC`[] \| `Promise`\<`EC`[]\>

Defined in: [types/firecms.tsx:28](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Use this callback to build entity collections dynamically.
You can use the user to decide which collections to show.
You can also use the data source to fetch additional data to build the
collections.
Note: you can use any type of synchronous or asynchronous code here,
including fetching data from external sources, like using the Firestore
APIs directly, or a REST API.

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection) = [`EntityCollection`](../interfaces/EntityCollection)

## Parameters

### params

#### authController

[`AuthController`](AuthController)

#### dataSource

[`DataSourceDelegate`](../interfaces/DataSourceDelegate)

#### user

[`User`](User) \| `null`

## Returns

`EC`[] \| `Promise`\<`EC`[]\>
