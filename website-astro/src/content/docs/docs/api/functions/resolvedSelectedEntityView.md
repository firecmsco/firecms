---
slug: "docs/api/functions/resolvedSelectedEntityView"
title: "resolvedSelectedEntityView"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / resolvedSelectedEntityView

# Function: resolvedSelectedEntityView()

> **resolvedSelectedEntityView**\<`M`\>(`customViews`, `customizationController`, `selectedTab?`, `canEdit?`): `object`

Defined in: [util/resolutions.ts:453](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/resolutions.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### customViews

(`string` \| [`EntityCustomView`](/docs/api/type-aliases/EntityCustomView)\<`M`\>)[] | `undefined`

### customizationController

[`CustomizationController`](/docs/api/type-aliases/CustomizationController)

### selectedTab?

`string`

### canEdit?

`boolean`

## Returns

`object`

### resolvedEntityViews

> **resolvedEntityViews**: [`EntityCustomView`](/docs/api/type-aliases/EntityCustomView)\<`M`\>[]

### selectedEntityView

> **selectedEntityView**: [`EntityCustomView`](/docs/api/type-aliases/EntityCustomView)\<`M`\> \| `undefined`

### selectedSecondaryForm

> **selectedSecondaryForm**: [`EntityCustomView`](/docs/api/type-aliases/EntityCustomView)\<`M`\> \| `undefined`
