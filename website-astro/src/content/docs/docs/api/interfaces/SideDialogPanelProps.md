---
slug: "docs/api/interfaces/SideDialogPanelProps"
title: "SideDialogPanelProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / SideDialogPanelProps

# Interface: SideDialogPanelProps

Defined in: [types/side\_dialogs\_controller.tsx:43](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

Props used to open a side dialog

## Properties

### additional?

> `optional` **additional**: `any`

Defined in: [types/side\_dialogs\_controller.tsx:81](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

Use this prop to store additional data in the panel

***

### component

> **component**: `ReactNode`

Defined in: [types/side\_dialogs\_controller.tsx:53](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

The component type that will be rendered

***

### key

> **key**: `string`

Defined in: [types/side\_dialogs\_controller.tsx:48](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

A key that identifies this panel

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [types/side\_dialogs\_controller.tsx:76](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

Callback when the panel is closed

#### Returns

`void`

***

### parentUrlPath?

> `optional` **parentUrlPath**: `string`

Defined in: [types/side\_dialogs\_controller.tsx:71](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

If the navigation stack is empty (you landed in the `urlPath` url), what
url path to change to when the panel gets closed.

***

### urlPath?

> `optional` **urlPath**: `string`

Defined in: [types/side\_dialogs\_controller.tsx:65](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

When open, change the URL to this path.
Note that if you want to restore state from a URL you need to add the
logic yourself by listening to URL updates, and probably call `open`.

***

### width?

> `optional` **width**: `string`

Defined in: [types/side\_dialogs\_controller.tsx:58](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_dialogs_controller.tsx)

Optional width of the panel
