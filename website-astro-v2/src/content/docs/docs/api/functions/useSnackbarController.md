---
slug: "docs/api/functions/useSnackbarController"
title: "useSnackbarController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / useSnackbarController

# Function: useSnackbarController()

> **useSnackbarController**(): `object`

Defined in: [hooks/useSnackbarController.tsx:42](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useSnackbarController.tsx)

Hook to retrieve the SnackbarContext.

Consider that in order to use this hook you need to have a parent
`FireCMS`

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
