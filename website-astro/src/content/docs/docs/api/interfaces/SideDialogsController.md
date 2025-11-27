---
slug: "docs/api/interfaces/SideDialogsController"
title: "SideDialogsController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / SideDialogsController

# Interface: SideDialogsController

Defined in: [types/side\_dialogs\_controller.tsx:8](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

Controller to open the side dialog

## Properties

### close()

> **close**: () => `void`

Defined in: [types/side\_dialogs\_controller.tsx:13](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

Close the last panel

#### Returns

`void`

***

### open()

> **open**: (`panelProps`) => `void`

Defined in: [types/side\_dialogs\_controller.tsx:30](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

Open one or multiple side panels

#### Parameters

##### panelProps

[`SideDialogPanelProps`](SideDialogPanelProps) | [`SideDialogPanelProps`](SideDialogPanelProps)[]

#### Returns

`void`

***

### replace()

> **replace**: (`panelProps`) => `void`

Defined in: [types/side\_dialogs\_controller.tsx:36](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

Replace the last open panel with the given one

#### Parameters

##### panelProps

[`SideDialogPanelProps`](SideDialogPanelProps) | [`SideDialogPanelProps`](SideDialogPanelProps)[]

#### Returns

`void`

***

### setSidePanels()

> **setSidePanels**: (`panels`) => `void`

Defined in: [types/side\_dialogs\_controller.tsx:24](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

Override the current side panels

#### Parameters

##### panels

[`SideDialogPanelProps`](SideDialogPanelProps)[]

#### Returns

`void`

***

### sidePanels

> **sidePanels**: [`SideDialogPanelProps`](SideDialogPanelProps)[]

Defined in: [types/side\_dialogs\_controller.tsx:18](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

List of side panels currently open
