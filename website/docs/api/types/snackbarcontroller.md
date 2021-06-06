---
id: "snackbarcontroller"
title: "Type alias: SnackbarController"
sidebar_label: "SnackbarController"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **SnackbarController**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `close` | () => `void` | Close the currently open snackbar |
| `isOpen` | `boolean` | Is there currently an open snackbar |
| `open` | (`props`: { `message`: `string` ; `title?`: `string` ; `type`: [SnackbarMessageType](snackbarmessagetype.md)  }) => `void` | Display a new snackbar. You need to specify the type and message. You can optionally specify a title |

#### Defined in

[contexts/SnackbarContext.tsx:18](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/SnackbarContext.tsx#L18)
