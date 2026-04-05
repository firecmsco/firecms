---
slug: "docs/api/interfaces/CMSView"
title: "CMSView"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CMSView

# Interface: CMSView

Defined in: [types/src/controllers/navigation.ts:196](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Custom additional views created by the developer, added to the main
navigation.

## Properties

### description?

> `optional` **description**: `string`

Defined in: [types/src/controllers/navigation.ts:211](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Optional description of this view. You can use Markdown

***

### group?

> `optional` **group**: `string`

Defined in: [types/src/controllers/navigation.ts:239](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Optional field used to group top level navigation entries under a
navigation view.
This prop is ignored for admin views.

***

### hideFromNavigation?

> `optional` **hideFromNavigation**: `boolean`

Defined in: [types/src/controllers/navigation.ts:226](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Should this view be hidden from the main navigation panel.
It will still be accessible if you reach the specified path

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [types/src/controllers/navigation.ts:220](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Icon key to use in this view.
You can use any of the icons in the Material specs:
https://fonts.google.com/icons
e.g. 'account_tree' or 'person'
Find all the icons in https://rebase.pro/docs/icons

***

### name

> **name**: `string`

Defined in: [types/src/controllers/navigation.ts:206](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Name of this view

***

### nestedRoutes?

> `optional` **nestedRoutes**: `boolean`

Defined in: [types/src/controllers/navigation.ts:245](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

If true, a wildcard route (slug/*) is automatically registered
alongside the base route, enabling nested navigation within this view.

***

### slug

> **slug**: `string`

Defined in: [types/src/controllers/navigation.ts:201](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

CMS Path you can reach this view from.

***

### view

> **view**: `ReactNode`

Defined in: [types/src/controllers/navigation.ts:232](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Component to be rendered. This can be any React component, and can use
any of the provided hooks
