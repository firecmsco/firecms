---
slug: "docs/api/functions/useResolvedViews"
title: "useResolvedViews"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useResolvedViews

# Function: useResolvedViews()

> **useResolvedViews**\<`USER`\>(`props`): [`UseResolvedViewsResult`](../type-aliases/UseResolvedViewsResult)

Defined in: [core/src/hooks/navigation/useResolvedViews.tsx:47](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedViews.tsx)

Hook that resolves view and admin view props (which may be async builders or arrays)
into concrete CMSView[]. Also injects Users/Roles admin views when userManagement
is provided.

Uses refs for potentially-unstable dependencies (driver, authController,
plugins) to avoid re-triggering effects when their object identity changes.

## Type Parameters

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### props

[`UseResolvedViewsProps`](../type-aliases/UseResolvedViewsProps)\<`USER`\>

## Returns

[`UseResolvedViewsResult`](../type-aliases/UseResolvedViewsResult)
