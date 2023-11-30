---
id: "SnackbarController"
title: "Interface: SnackbarController"
sidebar_label: "SnackbarController"
sidebar_position: 0
custom_edit_url: null
---

Controller to display snackbars

## Properties

### close

• **close**: () => `void`

#### Type declaration

▸ (): `void`

Close the currently open snackbar

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/hooks/useSnackbarController.tsx:19](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useSnackbarController.tsx#L19)

___

### open

• **open**: (`props`: \{ `autoHideDuration?`: `number` ; `message`: `ReactNode` ; `type`: [`SnackbarMessageType`](../types/SnackbarMessageType.md)  }) => `void`

#### Type declaration

▸ (`props`): `void`

Display a new snackbar. You need to specify the type and message.
You can optionally specify a title

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.autoHideDuration?` | `number` |
| `props.message` | `ReactNode` |
| `props.type` | [`SnackbarMessageType`](../types/SnackbarMessageType.md) |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/hooks/useSnackbarController.tsx:25](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useSnackbarController.tsx#L25)
