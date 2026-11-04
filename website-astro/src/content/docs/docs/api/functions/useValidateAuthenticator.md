---
slug: "docs/api/functions/useValidateAuthenticator"
title: "useValidateAuthenticator"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / useValidateAuthenticator

# Function: useValidateAuthenticator()

> **useValidateAuthenticator**\<`USER`\>(`authController`): `object`

Defined in: [hooks/useValidateAuthenticator.tsx:14](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useValidateAuthenticator.tsx)

This hook is used internally for validating an authenticator.

## Type Parameters

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User) = `any`

## Parameters

### authController

#### authController

[`AuthController`](/docs/api/type-aliases/AuthController)\<`USER`\>

#### authenticator?

`boolean` \| [`Authenticator`](/docs/api/type-aliases/Authenticator)\<`USER`\>

#### dataSourceDelegate

[`DataSourceDelegate`](/docs/api/interfaces/DataSourceDelegate)

#### disabled?

`boolean`

#### storageSource

[`StorageSource`](/docs/api/interfaces/StorageSource)

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
