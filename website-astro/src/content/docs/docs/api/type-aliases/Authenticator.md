---
slug: "docs/api/type-aliases/Authenticator"
title: "Authenticator"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / Authenticator

# Type Alias: Authenticator()\<USER\>

> **Authenticator**\<`USER`\> = (`props`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: [types/src/controllers/auth.tsx:72](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/auth.tsx)

Implement this function to allow access to specific users.

## Type Parameters

### USER

`USER` *extends* [`User`](User) = [`User`](User)

## Parameters

### props

#### authController

[`AuthController`](AuthController)\<`USER`\>

AuthController

#### data

[`RebaseData`](../interfaces/RebaseData)

Unified data access API

#### storageSource

[`StorageSource`](../interfaces/StorageSource)

Used storage implementation

#### user

`USER` \| `null`

Logged-in user or null

## Returns

`boolean` \| `Promise`\<`boolean`\>
