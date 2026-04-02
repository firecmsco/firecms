---
slug: "docs/api/type-aliases/UseResolvedViewsProps"
title: "UseResolvedViewsProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / UseResolvedViewsProps

# Type Alias: UseResolvedViewsProps\<USER\>

> **UseResolvedViewsProps**\<`USER`\> = `object`

Defined in: [core/src/hooks/navigation/useResolvedViews.tsx:20](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedViews.tsx)

## Type Parameters

### USER

`USER` *extends* [`User`](User)

## Properties

### adminMode?

> `optional` **adminMode**: `"content"` \| `"studio"` \| `"settings"`

Defined in: [core/src/hooks/navigation/useResolvedViews.tsx:26](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedViews.tsx)

***

### adminViews?

> `optional` **adminViews**: [`CMSView`](../interfaces/CMSView)[] \| [`CMSViewsBuilder`](CMSViewsBuilder)

Defined in: [core/src/hooks/navigation/useResolvedViews.tsx:23](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedViews.tsx)

***

### authController

> **authController**: [`AuthController`](AuthController)\<`USER`\>

Defined in: [core/src/hooks/navigation/useResolvedViews.tsx:21](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedViews.tsx)

***

### data

> **data**: [`RebaseData`](../interfaces/RebaseData)

Defined in: [core/src/hooks/navigation/useResolvedViews.tsx:24](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedViews.tsx)

***

### effectiveRoleController?

> `optional` **effectiveRoleController**: [`EffectiveRoleController`](../interfaces/EffectiveRoleController)

Defined in: [core/src/hooks/navigation/useResolvedViews.tsx:27](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedViews.tsx)

***

### plugins?

> `optional` **plugins**: [`RebasePlugin`](RebasePlugin)[]

Defined in: [core/src/hooks/navigation/useResolvedViews.tsx:25](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedViews.tsx)

***

### userManagement?

> `optional` **userManagement**: [`UserManagementDelegate`](../interfaces/UserManagementDelegate)

Defined in: [core/src/hooks/navigation/useResolvedViews.tsx:28](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedViews.tsx)

***

### views?

> `optional` **views**: [`CMSView`](../interfaces/CMSView)[] \| [`CMSViewsBuilder`](CMSViewsBuilder)

Defined in: [core/src/hooks/navigation/useResolvedViews.tsx:22](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedViews.tsx)
