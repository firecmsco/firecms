---
slug: "docs/api/functions/resolvedSelectedEntityView"
title: "resolvedSelectedEntityView"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / resolvedSelectedEntityView

# Function: resolvedSelectedEntityView()

> **resolvedSelectedEntityView**\<`M`\>(`customViews`, `customizationController`, `selectedTab?`, `canEdit?`): `object`

Defined in: [common/src/util/resolutions.ts:350](https://github.com/rebasepro/rebase/blob/main/packages/common/src/util/resolutions.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### customViews

(`string` \| [`EntityCustomView`](../type-aliases/EntityCustomView)\<`M`\>)[] | `undefined`

### customizationController

[`CustomizationController`](../type-aliases/CustomizationController)

### selectedTab?

`string`

### canEdit?

`boolean`

## Returns

`object`

### resolvedEntityViews

> **resolvedEntityViews**: [`EntityCustomView`](../type-aliases/EntityCustomView)\<`M`\>[]

### selectedEntityView

> **selectedEntityView**: [`EntityCustomView`](../type-aliases/EntityCustomView)\<`M`\> \| `undefined`

### selectedSecondaryForm

> **selectedSecondaryForm**: [`EntityCustomView`](../type-aliases/EntityCustomView)\<`M`\> \| `undefined`
