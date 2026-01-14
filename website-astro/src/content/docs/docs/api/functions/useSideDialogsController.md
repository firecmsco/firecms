---
slug: "docs/api/functions/useSideDialogsController"
title: "useSideDialogsController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / useSideDialogsController

# Function: useSideDialogsController()

> **useSideDialogsController**(): [`SideDialogsController`](../interfaces/SideDialogsController)

Defined in: [hooks/useSideDialogsController.tsx:21](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useSideDialogsController.tsx)

Hook to retrieve the side dialogs' controller.

This hook allows you to open and close side dialogs. This is the mechanism
used when open a side entity dialog, or when selecting a reference.

If you want to open a side entity dialog, you can use the [useSideEntityController](useSideEntityController)
hook.

If you want to select a reference, you can use the [useReferenceDialog](useReferenceDialog)

Consider that in order to use this hook you need to have a parent
`FireCMS`

## Returns

[`SideDialogsController`](../interfaces/SideDialogsController)
