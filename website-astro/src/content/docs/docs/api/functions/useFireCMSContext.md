---
slug: "docs/api/functions/useFireCMSContext"
title: "useFireCMSContext"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / useFireCMSContext

# Function: useFireCMSContext()

> **useFireCMSContext**\<`USER`, `AuthControllerType`\>(): [`FireCMSContext`](../type-aliases/FireCMSContext)\<`USER`, `AuthControllerType`\>

Defined in: [hooks/useFireCMSContext.tsx:25](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useFireCMSContext.tsx)

Hook to retrieve the [FireCMSContext](../type-aliases/FireCMSContext).

Consider that in order to use this hook you need to have a parent
`FireCMS` component.

## Type Parameters

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

### AuthControllerType

`AuthControllerType` *extends* [`AuthController`](../type-aliases/AuthController)\<`USER`\> = [`AuthController`](../type-aliases/AuthController)\<`USER`\>

## Returns

[`FireCMSContext`](../type-aliases/FireCMSContext)\<`USER`, `AuthControllerType`\>

## See

FireCMSContext
