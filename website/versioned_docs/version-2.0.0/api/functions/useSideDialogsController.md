---
id: "useSideDialogsController"
title: "Function: useSideDialogsController"
sidebar_label: "useSideDialogsController"
sidebar_position: 0
custom_edit_url: null
---

▸ **useSideDialogsController**(): [`SideDialogsController`](../interfaces/SideDialogsController.md)

Hook to retrieve the side dialogs' controller.

This hook allows you to open and close side dialogs. This is the mechanism
used when open a side entity dialog, or when selecting a reference.

If you want to open a side entity dialog, you can use the [useSideEntityController](useSideEntityController.md)
hook.

If you want to select a reference, you can use the [useReferenceDialog](useReferenceDialog.md)

Consider that in order to use this hook you need to have a parent
`FireCMS`

#### Returns

[`SideDialogsController`](../interfaces/SideDialogsController.md)

#### Defined in

[packages/firecms_core/src/hooks/useSideDialogsController.tsx:21](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useSideDialogsController.tsx#L21)
