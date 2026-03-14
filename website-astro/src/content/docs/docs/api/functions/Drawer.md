---
slug: "docs/api/functions/Drawer"
title: "Drawer"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / Drawer

# Function: Drawer()

> **Drawer**(`__namedParameters`): `Element`

Defined in: [app/Drawer.tsx:11](https://github.com/rebaseco/rebase/blob/main/packages/core/src/app/Drawer.tsx)

This component is in charge of rendering the drawer.
If you add this component under your [Scaffold](../variables/Scaffold), it will be rendered
as a drawer, and the open and close functionality will be handled automatically.
If you want to customise the drawer, you can create your own component and pass it as a child.
For custom drawers, you can use the [useApp](useApp) to open and close the drawer.

## Parameters

### \_\_namedParameters

#### children?

`ReactNode`

#### className?

`string`

#### style?

`CSSProperties`

## Returns

`Element`
