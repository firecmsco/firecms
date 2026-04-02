---
slug: "docs/api/type-aliases/CMSViewsBuilder"
title: "CMSViewsBuilder"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CMSViewsBuilder

# Type Alias: CMSViewsBuilder()

> **CMSViewsBuilder** = (`params`) => [`CMSView`](../interfaces/CMSView)[] \| `Promise`\<[`CMSView`](../interfaces/CMSView)[]\>

Defined in: [types/src/types/rebase.tsx:55](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Use this callback to build custom views dynamically.
You can use the user to decide which views to show.
You can also use the data API to fetch additional data to build the
views. Note: you can use any type of synchronous or asynchronous code here,
including fetching data from external sources, like using a REST API.

## Parameters

### params

#### authController

[`AuthController`](AuthController)

#### data

[`RebaseData`](../interfaces/RebaseData)

#### user

[`User`](User) \| `null`

## Returns

[`CMSView`](../interfaces/CMSView)[] \| `Promise`\<[`CMSView`](../interfaces/CMSView)[]\>
