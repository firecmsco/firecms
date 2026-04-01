---
slug: "docs/api/functions/RebaseRoutes"
title: "RebaseRoutes"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RebaseRoutes

# Function: RebaseRoutes()

> **RebaseRoutes**(`__namedParameters`): `Element`

Defined in: [core/src/core/RebaseRoutes.tsx:19](https://github.com/rebaseco/rebase/blob/main/packages/core/src/core/RebaseRoutes.tsx)

A drop-in replacement for react-router's `<Routes>` that preserves the
underlying view when a side dialog navigates the URL to a different path.

When opening a side dialog from e.g. `/posts` to `authors/123#side`,
the `base_location` stored in router state is used so the route tree
keeps rendering the original `/posts` view underneath the dialog overlay.

Additionally, registered views from `useNavigationStateController()` are
automatically routed — no need to manually map them to `<Route>` elements.
Views with `nestedRoutes: true` get a wildcard route (slug/*) as well.
Explicitly declared `children` routes take priority.

## Parameters

### \_\_namedParameters

#### children?

`ReactNode`

## Returns

`Element`
