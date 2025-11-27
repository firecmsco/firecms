---
slug: "docs/api/functions/useValidateAuthenticator"
title: "useValidateAuthenticator"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / useValidateAuthenticator

# Function: useValidateAuthenticator()

> **useValidateAuthenticator**\<`USER`\>(`authController`): `object`

Defined in: [hooks/useValidateAuthenticator.tsx:14](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useValidateAuthenticator.tsx)

This hook is used internally for validating an authenticator.

## Type Parameters

### USER

`USER` *extends* [`User`](../type-aliases/User) = `any`

## Parameters

### authController

#### authController

[`AuthController`](../type-aliases/AuthController)\<`USER`\>

#### authenticator?

`boolean` \| [`Authenticator`](../type-aliases/Authenticator)\<`USER`\>

#### dataSourceDelegate

[`DataSourceDelegate`](../interfaces/DataSourceDelegate)

#### disabled?

`boolean`

#### storageSource

[`StorageSource`](../interfaces/StorageSource)

## Returns

`object`

### authLoading

> **authLoading**: `boolean`

### authVerified

> **authVerified**: `boolean`

### canAccessMainView

> **canAccessMainView**: `boolean`

### notAllowedError

> **notAllowedError**: `any`
