---
slug: "docs/api/type-aliases/AuthController"
title: "AuthController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / AuthController

# Type Alias: AuthController\<USER, ExtraData\>

> **AuthController**\<`USER`, `ExtraData`\> = `object`

Defined in: [types/src/controllers/auth.tsx:11](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

Controller for retrieving the logged user or performing auth related operations.
Note that if you are implementing your AuthController, you probably will want
to do it as the result of a hook.

## Type Parameters

### USER

`USER` *extends* [`User`](User) = `any`

### ExtraData

`ExtraData` = `unknown`

## Properties

### authError?

> `optional` **authError**: `unknown`

Defined in: [types/src/controllers/auth.tsx:40](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

Error initializing the authentication

***

### authLoading

> **authLoading**: `boolean`

Defined in: [types/src/controllers/auth.tsx:30](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

Loading flag. It is used to display a loading screen when the user is
logging in or out.

***

### authProviderError?

> `optional` **authProviderError**: `unknown`

Defined in: [types/src/controllers/auth.tsx:45](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

Error dispatched by the auth provider

***

### extra

> **extra**: `ExtraData`

Defined in: [types/src/controllers/auth.tsx:57](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

***

### getAuthToken()

> **getAuthToken**: () => `Promise`\<`string`\>

Defined in: [types/src/controllers/auth.tsx:50](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

You can use this method to retrieve the auth token for the current user.

#### Returns

`Promise`\<`string`\>

***

### initialLoading?

> `optional` **initialLoading**: `boolean`

Defined in: [types/src/controllers/auth.tsx:24](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

Initial loading flag. It is used not to display the login screen
when the app first loads, and it has not been checked whether the user
is logged in or not.

***

### loginSkipped

> **loginSkipped**: `boolean`

Defined in: [types/src/controllers/auth.tsx:55](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

Has the user skipped the login process

***

### setExtra()

> **setExtra**: (`extra`) => `void`

Defined in: [types/src/controllers/auth.tsx:59](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

#### Parameters

##### extra

`ExtraData`

#### Returns

`void`

***

### setUser()?

> `optional` **setUser**: (`user`) => `void`

Defined in: [types/src/controllers/auth.tsx:62](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

#### Parameters

##### user

`USER` | `null`

#### Returns

`void`

***

### setUserRoles()?

> `optional` **setUserRoles**: (`roles`) => `void`

Defined in: [types/src/controllers/auth.tsx:64](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

#### Parameters

##### roles

[`Role`](Role)[]

#### Returns

`void`

***

### signOut()

> **signOut**: () => `Promise`\<`void`\>

Defined in: [types/src/controllers/auth.tsx:35](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

Sign out

#### Returns

`Promise`\<`void`\>

***

### user

> **user**: `USER` \| `null`

Defined in: [types/src/controllers/auth.tsx:17](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/auth.tsx)

The user currently logged in
The values can be: the user object, null if they skipped login
