---
id: "SideDialogPanelProps"
title: "Interface: SideDialogPanelProps"
sidebar_label: "SideDialogPanelProps"
sidebar_position: 0
custom_edit_url: null
---

Props used to open a side dialog

## Properties

### component

• **component**: `ReactNode`

The component type that will be rendered

#### Defined in

[packages/firecms_core/src/types/side_dialogs_controller.tsx:44](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_dialogs_controller.tsx#L44)

___

### key

• **key**: `string`

A key that identifies this panel

#### Defined in

[packages/firecms_core/src/types/side_dialogs_controller.tsx:39](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_dialogs_controller.tsx#L39)

___

### onClose

• `Optional` **onClose**: () => `void`

#### Type declaration

▸ (): `void`

Callback when the panel is closed

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/side_dialogs_controller.tsx:67](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_dialogs_controller.tsx#L67)

___

### parentUrlPath

• `Optional` **parentUrlPath**: `string`

If the navigation stack is empty (you landed in the `urlPath` url), what
url path to change to when the panel gets closed.

#### Defined in

[packages/firecms_core/src/types/side_dialogs_controller.tsx:62](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_dialogs_controller.tsx#L62)

___

### urlPath

• `Optional` **urlPath**: `string`

When open, change the URL to this path.
Note that if you want to restore state from a URL you need to add the
logic yourself by listening to URL updates, and probably call `open`.

#### Defined in

[packages/firecms_core/src/types/side_dialogs_controller.tsx:56](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_dialogs_controller.tsx#L56)

___

### width

• `Optional` **width**: `string`

Optional width of the panel

#### Defined in

[packages/firecms_core/src/types/side_dialogs_controller.tsx:49](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/side_dialogs_controller.tsx#L49)
