---
slug: "docs/api/interfaces/SideDialogsController"
title: "SideDialogsController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SideDialogsController

# Interface: SideDialogsController

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:7](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

Controller to open the side dialog

## Properties

### close()

> **close**: () => `void`

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:12](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

Close the last panel

#### Returns

`void`

***

### open()

> **open**: (`panelProps`) => `void`

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:29](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

Open one or multiple side panels

#### Parameters

##### panelProps

[`SideDialogPanelProps`](SideDialogPanelProps) | [`SideDialogPanelProps`](SideDialogPanelProps)[]

#### Returns

`void`

***

### replace()

> **replace**: (`panelProps`) => `void`

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:35](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

Replace the last open panel with the given one

#### Parameters

##### panelProps

[`SideDialogPanelProps`](SideDialogPanelProps) | [`SideDialogPanelProps`](SideDialogPanelProps)[]

#### Returns

`void`

***

### setSidePanels()

> **setSidePanels**: (`panels`) => `void`

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:23](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

Override the current side panels

#### Parameters

##### panels

[`SideDialogPanelProps`](SideDialogPanelProps)[]

#### Returns

`void`

***

### sidePanels

> **sidePanels**: [`SideDialogPanelProps`](SideDialogPanelProps)[]

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:17](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

List of side panels currently open
