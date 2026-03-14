---
slug: "docs/api/functions/useSnackbarController"
title: "useSnackbarController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useSnackbarController

# Function: useSnackbarController()

> **useSnackbarController**(): `object`

Defined in: [hooks/useSnackbarController.tsx:42](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useSnackbarController.tsx)

Hook to retrieve the SnackbarContext.

Consider that in order to use this hook you need to have a parent
`Rebase`

## Returns

`object`

### close()

> **close**: () => `void`

#### Returns

`void`

### open()

> **open**: (`props`) => `void`

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

## See

SnackbarController
