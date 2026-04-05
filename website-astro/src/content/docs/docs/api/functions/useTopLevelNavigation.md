---
slug: "docs/api/functions/useTopLevelNavigation"
title: "useTopLevelNavigation"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useTopLevelNavigation

# Function: useTopLevelNavigation()

> **useTopLevelNavigation**(`props`): [`UseTopLevelNavigationResult`](../type-aliases/UseTopLevelNavigationResult)

Defined in: [core/src/hooks/navigation/useTopLevelNavigation.ts:41](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/navigation/useTopLevelNavigation.ts)

Hook that computes the top-level NavigationResult from resolved collections,
views, and admin views. Pure computation — no async, no effects.

The `onNavigationEntriesUpdate` callback is embedded in the result for API
compatibility, but its reference is stable via useCallback.

## Parameters

### props

[`UseTopLevelNavigationProps`](../type-aliases/UseTopLevelNavigationProps)

## Returns

[`UseTopLevelNavigationResult`](../type-aliases/UseTopLevelNavigationResult)
