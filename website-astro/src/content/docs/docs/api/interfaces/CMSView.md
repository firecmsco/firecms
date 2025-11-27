---
slug: "docs/api/interfaces/CMSView"
title: "CMSView"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / CMSView

# Interface: CMSView

Defined in: [types/navigation.ts:185](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Custom additional views created by the developer, added to the main
navigation.

## Properties

### description?

> `optional` **description**: `string`

Defined in: [types/navigation.ts:200](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Optional description of this view. You can use Markdown

***

### group?

> `optional` **group**: `string`

Defined in: [types/navigation.ts:228](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Optional field used to group top level navigation entries under a
navigation view.
This prop is ignored for admin views.

***

### hideFromNavigation?

> `optional` **hideFromNavigation**: `boolean`

Defined in: [types/navigation.ts:215](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Should this view be hidden from the main navigation panel.
It will still be accessible if you reach the specified path

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [types/navigation.ts:209](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Icon key to use in this view.
You can use any of the icons in the Material specs:
https://fonts.google.com/icons
e.g. 'account_tree' or 'person'
Find all the icons in https://firecms.co/docs/icons

***

### name

> **name**: `string`

Defined in: [types/navigation.ts:195](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Name of this view

***

### path

> **path**: `string`

Defined in: [types/navigation.ts:190](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

CMS Path you can reach this view from.

***

### view

> **view**: `ReactNode`

Defined in: [types/navigation.ts:221](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Component to be rendered. This can be any React component, and can use
any of the provided hooks
