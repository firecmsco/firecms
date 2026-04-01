---
slug: "docs/api/functions/resolveNavigationFrom"
title: "resolveNavigationFrom"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / resolveNavigationFrom

# Function: resolveNavigationFrom()

> **resolveNavigationFrom**\<`M`, `USER`\>(`path`): `Promise`\<[`ResolvedNavigationEntry`](../type-aliases/ResolvedNavigationEntry)\<`M`\>[]\>

Defined in: [core/src/hooks/useResolvedNavigationFrom.tsx:58](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useResolvedNavigationFrom.tsx)

Use this function to retrieve an array of navigation entries (resolved
collection, entity or entity custom_view) for the given path. You need to pass the app context
that you receive in different callbacks, such as the save hooks.

It will take into account the `navigation` provided at the `Rebase` level.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### path

#### context

[`RebaseContext`](../type-aliases/RebaseContext)\<`USER`\>

#### path

`string`

## Returns

`Promise`\<[`ResolvedNavigationEntry`](../type-aliases/ResolvedNavigationEntry)\<`M`\>[]\>
