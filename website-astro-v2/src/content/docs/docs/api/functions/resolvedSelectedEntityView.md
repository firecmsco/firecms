---
slug: "docs/api/functions/resolvedSelectedEntityView"
title: "resolvedSelectedEntityView"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / resolvedSelectedEntityView

# Function: resolvedSelectedEntityView()

> **resolvedSelectedEntityView**\<`M`\>(`customViews`, `customizationController`, `selectedTab?`, `canEdit?`): `object`

Defined in: [util/resolutions.ts:453](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/resolutions.ts)

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
