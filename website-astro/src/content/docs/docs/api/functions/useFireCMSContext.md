---
slug: "docs/api/functions/useFireCMSContext"
title: "useFireCMSContext"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / useFireCMSContext

# Function: useFireCMSContext()

> **useFireCMSContext**\<`USER`, `AuthControllerType`\>(): [`FireCMSContext`](/docs/api/type-aliases/FireCMSContext)\<`USER`, `AuthControllerType`\>

Defined in: [hooks/useFireCMSContext.tsx:25](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useFireCMSContext.tsx)

Hook to retrieve the [FireCMSContext](/docs/api/type-aliases/FireCMSContext).

Consider that in order to use this hook you need to have a parent
`FireCMS` component.

## Type Parameters

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User) = [`User`](/docs/api/type-aliases/User)

### AuthControllerType

`AuthControllerType` *extends* [`AuthController`](/docs/api/type-aliases/AuthController)\<`USER`\> = [`AuthController`](/docs/api/type-aliases/AuthController)\<`USER`\>

## Returns

[`FireCMSContext`](/docs/api/type-aliases/FireCMSContext)\<`USER`, `AuthControllerType`\>

## See

FireCMSContext
