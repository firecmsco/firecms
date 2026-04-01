---
slug: "docs/api/functions/useResolvedNavigationFrom"
title: "useResolvedNavigationFrom"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useResolvedNavigationFrom

# Function: useResolvedNavigationFrom()

> **useResolvedNavigationFrom**\<`M`, `USER`\>(`__namedParameters`): [`NavigationFrom`](../interfaces/NavigationFrom)\<`M`\>

Defined in: [core/src/hooks/useResolvedNavigationFrom.tsx:129](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useResolvedNavigationFrom.tsx)

Use this hook to retrieve an array of navigation entries (resolved
collection or entity) for the given path. You can use this hook
in any React component that lives under `Rebase`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### \_\_namedParameters

[`NavigationFromProps`](../interfaces/NavigationFromProps)

## Returns

[`NavigationFrom`](../interfaces/NavigationFrom)\<`M`\>
