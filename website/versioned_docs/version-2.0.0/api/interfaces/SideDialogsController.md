---
id: "SideDialogsController"
title: "Interface: SideDialogsController"
sidebar_label: "SideDialogsController"
sidebar_position: 0
custom_edit_url: null
---

Controller to open the side dialog

## Properties

### close

• **close**: () => `void`

#### Type declaration

▸ (): `void`

Close the last panel

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/side_dialogs_controller.tsx:10](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_dialogs_controller.tsx#L10)

___

### open

• **open**: (`panelProps`: [`SideDialogPanelProps`](SideDialogPanelProps.md) \| [`SideDialogPanelProps`](SideDialogPanelProps.md)[]) => `void`

#### Type declaration

▸ (`panelProps`): `void`

Open one or multiple side panels

##### Parameters

| Name | Type |
| :------ | :------ |
| `panelProps` | [`SideDialogPanelProps`](SideDialogPanelProps.md) \| [`SideDialogPanelProps`](SideDialogPanelProps.md)[] |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/side_dialogs_controller.tsx:21](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_dialogs_controller.tsx#L21)

___

### replace

• **replace**: (`panelProps`: [`SideDialogPanelProps`](SideDialogPanelProps.md) \| [`SideDialogPanelProps`](SideDialogPanelProps.md)[]) => `void`

#### Type declaration

▸ (`panelProps`): `void`

Replace the last open panel with the given one

##### Parameters

| Name | Type |
| :------ | :------ |
| `panelProps` | [`SideDialogPanelProps`](SideDialogPanelProps.md) \| [`SideDialogPanelProps`](SideDialogPanelProps.md)[] |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/side_dialogs_controller.tsx:27](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_dialogs_controller.tsx#L27)

___

### sidePanels

• **sidePanels**: [`SideDialogPanelProps`](SideDialogPanelProps.md)[]

List of side panels currently open

#### Defined in

[packages/firecms_core/src/types/side_dialogs_controller.tsx:15](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_dialogs_controller.tsx#L15)
