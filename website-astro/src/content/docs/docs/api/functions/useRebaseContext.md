---
slug: "docs/api/functions/useRebaseContext"
title: "useRebaseContext"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useRebaseContext

# Function: useRebaseContext()

> **useRebaseContext**\<`USER`, `AuthControllerType`\>(): [`RebaseContext`](../type-aliases/RebaseContext)\<`USER`, `AuthControllerType`\>

Defined in: [core/src/hooks/useRebaseContext.tsx:26](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useRebaseContext.tsx)

Hook to retrieve the [RebaseContext](../type-aliases/RebaseContext).

Consider that in order to use this hook you need to have a parent
`Rebase` component.

## Type Parameters

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

### AuthControllerType

`AuthControllerType` *extends* [`AuthController`](../type-aliases/AuthController)\<`USER`\> = [`AuthController`](../type-aliases/AuthController)\<`USER`\>

## Returns

[`RebaseContext`](../type-aliases/RebaseContext)\<`USER`, `AuthControllerType`\>

## See

RebaseContext
