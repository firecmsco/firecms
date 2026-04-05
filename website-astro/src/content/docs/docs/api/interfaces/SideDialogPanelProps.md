---
slug: "docs/api/interfaces/SideDialogPanelProps"
title: "SideDialogPanelProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SideDialogPanelProps

# Interface: SideDialogPanelProps

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:42](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

Props used to open a side dialog

## Properties

### additional?

> `optional` **additional**: `unknown`

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:80](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

Use this prop to store additional data in the panel

***

### component

> **component**: `ReactNode`

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:52](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

The component type that will be rendered

***

### key

> **key**: `string`

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:47](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

A key that identifies this panel

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:75](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

Callback when the panel is closed

#### Returns

`void`

***

### parentUrlPath?

> `optional` **parentUrlPath**: `string`

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:70](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

If the navigation stack is empty (you landed in the `urlPath` url), what
url path to change to when the panel gets closed.

***

### urlPath?

> `optional` **urlPath**: `string`

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:64](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

When open, change the URL to this path.
Note that if you want to restore state from a URL you need to add the
logic yourself by listening to URL updates, and probably call `open`.

***

### width?

> `optional` **width**: `string`

Defined in: [types/src/controllers/side\_dialogs\_controller.tsx:57](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/side_dialogs_controller.tsx)

Optional width of the panel
