---
slug: "docs/api/interfaces/SnackbarController"
title: "SnackbarController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SnackbarController

# Interface: SnackbarController

Defined in: [types/src/controllers/snackbar.ts:12](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/snackbar.ts)

Controller to display snackbars

## Properties

### close()

> **close**: () => `void`

Defined in: [types/src/controllers/snackbar.ts:17](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/snackbar.ts)

Close the currently open snackbar

#### Returns

`void`

***

### open()

> **open**: (`props`) => `void`

Defined in: [types/src/controllers/snackbar.ts:23](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/snackbar.ts)

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
