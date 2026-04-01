---
slug: "docs/api/functions/useSideDialogsController"
title: "useSideDialogsController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useSideDialogsController

# Function: useSideDialogsController()

> **useSideDialogsController**(): [`SideDialogsController`](../interfaces/SideDialogsController)

Defined in: [core/src/hooks/useSideDialogsController.tsx:21](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useSideDialogsController.tsx)

Hook to retrieve the side dialogs' controller.

This hook allows you to open and close side dialogs. This is the mechanism
used when open a side entity dialog, or when selecting a reference.

If you want to open a side entity dialog, you can use the [useSideEntityController](useSideEntityController)
hook.

If you want to select a reference, you can use the useReferenceDialog

Consider that in order to use this hook you need to have a parent
`Rebase`

## Returns

[`SideDialogsController`](../interfaces/SideDialogsController)
