---
slug: "docs/api/functions/useAuthController"
title: "useAuthController"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / useAuthController

# Function: useAuthController()

> **useAuthController**\<`USER`, `AuthControllerType`\>(): `AuthControllerType`

Defined in: [hooks/useAuthController.tsx:14](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useAuthController.tsx)

Hook to retrieve the AuthContext.

Consider that in order to use this hook you need to have a parent
`FireCMS`

## Type Parameters

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User) = [`User`](/docs/api/type-aliases/User)

### AuthControllerType

`AuthControllerType` *extends* [`AuthController`](/docs/api/type-aliases/AuthController)\<`USER`\> = [`AuthController`](/docs/api/type-aliases/AuthController)\<`USER`\>

## Returns

`AuthControllerType`

## See

AuthController
