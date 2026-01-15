---
slug: "docs/api/interfaces/SnackbarController"
title: "SnackbarController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / SnackbarController

# Interface: SnackbarController

Defined in: [hooks/useSnackbarController.tsx:14](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useSnackbarController.tsx)

Controller to display snackbars

## Properties

### close()

> **close**: () => `void`

Defined in: [hooks/useSnackbarController.tsx:19](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useSnackbarController.tsx)

Close the currently open snackbar

#### Returns

`void`

***

### open()

> **open**: (`props`) => `void`

Defined in: [hooks/useSnackbarController.tsx:25](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useSnackbarController.tsx)

Display a new snackbar. You need to specify the type and message.
You can optionally specify a title

#### Parameters

##### props

###### autoHideDuration?

`number`

###### message

`ReactNode`

###### type

[`SnackbarMessageType`](../type-aliases/SnackbarMessageType)

#### Returns

`void`
