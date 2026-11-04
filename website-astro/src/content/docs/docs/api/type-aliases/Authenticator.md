---
slug: "docs/api/type-aliases/Authenticator"
title: "Authenticator"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / Authenticator

# Type Alias: Authenticator()\<USER\>

> **Authenticator**\<`USER`\> = (`props`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: [types/auth.tsx:72](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

Implement this function to allow access to specific users.

## Type Parameters

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User) = [`User`](/docs/api/type-aliases/User)

## Parameters

### props

#### authController

[`AuthController`](/docs/api/type-aliases/AuthController)\<`USER`\>

AuthController

#### dataSourceDelegate

[`DataSourceDelegate`](/docs/api/interfaces/DataSourceDelegate)

Connector to your database, e.g. your Firestore database

#### storageSource

[`StorageSource`](/docs/api/interfaces/StorageSource)

Used storage implementation

#### user

`USER` \| `null`

Logged-in user or null

## Returns

`boolean` \| `Promise`\<`boolean`\>
