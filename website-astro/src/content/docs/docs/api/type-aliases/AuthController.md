---
slug: "docs/api/type-aliases/AuthController"
title: "AuthController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / AuthController

# Type Alias: AuthController\<USER, ExtraData\>

> **AuthController**\<`USER`, `ExtraData`\> = `object`

Defined in: [types/auth.tsx:12](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

Controller for retrieving the logged user or performing auth related operations.
Note that if you are implementing your AuthController, you probably will want
to do it as the result of a hook.

## Type Parameters

### USER

`USER` *extends* [`User`](User) = `any`

### ExtraData

`ExtraData` = `any`

## Properties

### authError?

> `optional` **authError**: `any`

Defined in: [types/auth.tsx:41](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

Error initializing the authentication

***

### authLoading

> **authLoading**: `boolean`

Defined in: [types/auth.tsx:31](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

Loading flag. It is used to display a loading screen when the user is
logging in or out.

***

### authProviderError?

> `optional` **authProviderError**: `any`

Defined in: [types/auth.tsx:46](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

Error dispatched by the auth provider

***

### extra

> **extra**: `ExtraData`

Defined in: [types/auth.tsx:58](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

***

### getAuthToken()

> **getAuthToken**: () => `Promise`\<`string`\>

Defined in: [types/auth.tsx:51](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

You can use this method to retrieve the auth token for the current user.

#### Returns

`Promise`\<`string`\>

***

### initialLoading?

> `optional` **initialLoading**: `boolean`

Defined in: [types/auth.tsx:25](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

Initial loading flag. It is used not to display the login screen
when the app first loads, and it has not been checked whether the user
is logged in or not.

***

### loginSkipped

> **loginSkipped**: `boolean`

Defined in: [types/auth.tsx:56](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

Has the user skipped the login process

***

### setExtra()

> **setExtra**: (`extra`) => `void`

Defined in: [types/auth.tsx:60](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

#### Parameters

##### extra

`ExtraData`

#### Returns

`void`

***

### setUser()?

> `optional` **setUser**: (`user`) => `void`

Defined in: [types/auth.tsx:62](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

#### Parameters

##### user

`USER` | `null`

#### Returns

`void`

***

### setUserRoles()?

> `optional` **setUserRoles**: (`roles`) => `void`

Defined in: [types/auth.tsx:64](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

#### Parameters

##### roles

[`Role`](Role)[]

#### Returns

`void`

***

### signOut()

> **signOut**: () => `Promise`\<`void`\>

Defined in: [types/auth.tsx:36](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

Sign out

#### Returns

`Promise`\<`void`\>

***

### user

> **user**: `USER` \| `null`

Defined in: [types/auth.tsx:18](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/auth.tsx)

The user currently logged in
The values can be: the user object, null if they skipped login
