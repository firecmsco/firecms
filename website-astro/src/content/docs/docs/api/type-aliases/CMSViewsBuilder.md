---
slug: "docs/api/type-aliases/CMSViewsBuilder"
title: "CMSViewsBuilder"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / CMSViewsBuilder

# Type Alias: CMSViewsBuilder()

> **CMSViewsBuilder** = (`params`) => [`CMSView`](../interfaces/CMSView)[] \| `Promise`\<[`CMSView`](../interfaces/CMSView)[]\>

Defined in: [types/firecms.tsx:43](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Use this callback to build custom views dynamically.
You can use the user to decide which views to show.
You can also use the data source to fetch additional data to build the
views. Note: you can use any type of synchronous or asynchronous code here,
including fetching data from external sources, like using the Firestore
APIs directly, or a REST API.

## Parameters

### params

#### authController

[`AuthController`](AuthController)

#### dataSource

[`DataSourceDelegate`](../interfaces/DataSourceDelegate)

#### user

[`User`](User) \| `null`

## Returns

[`CMSView`](../interfaces/CMSView)[] \| `Promise`\<[`CMSView`](../interfaces/CMSView)[]\>
