---
id: "SnackbarController"
title: "Interface: SnackbarController"
sidebar_label: "SnackbarController"
sidebar_position: 0
custom_edit_url: null
---

Controller to display snackbars

## Properties

### isOpen

• **isOpen**: `boolean`

Is there currently an open snackbar

#### Defined in

[hooks/useSnackbarController.tsx:18](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useSnackbarController.tsx#L18)

## Methods

### close

▸ **close**(): `void`

Close the currently open snackbar

#### Returns

`void`

#### Defined in

[hooks/useSnackbarController.tsx:23](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useSnackbarController.tsx#L23)

___

### open

▸ **open**(`props`): `void`

Display a new snackbar. You need to specify the type and message.
You can optionally specify a title

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.message` | `string` |
| `props.title?` | `string` |
| `props.type` | [`SnackbarMessageType`](../types/SnackbarMessageType) |

#### Returns

`void`

#### Defined in

[hooks/useSnackbarController.tsx:29](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useSnackbarController.tsx#L29)
