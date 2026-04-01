---
slug: "docs/api/functions/useBuildNavigationStateController"
title: "useBuildNavigationStateController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useBuildNavigationStateController

# Function: useBuildNavigationStateController()

> **useBuildNavigationStateController**\<`EC`, `USER`\>(`props`): [`NavigationStateController`](../type-aliases/NavigationStateController)

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:53](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

Main hook that resolves collections, views, and admin views into a
NavigationStateController. This is a thin composition of three focused hooks:

- useResolvedCollections: resolves collection props and registers with CollectionRegistry
- useResolvedViews: resolves view/admin view props and injects Users/Roles views
- useTopLevelNavigation: computes the NavigationResult from resolved data

The NavigationStateController type is preserved as a public API.

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### props

[`BuildNavigationStateProps`](../type-aliases/BuildNavigationStateProps)\<`EC`, `USER`\>

## Returns

[`NavigationStateController`](../type-aliases/NavigationStateController)
