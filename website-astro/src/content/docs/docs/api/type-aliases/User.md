---
slug: "docs/api/type-aliases/User"
title: "User"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / User

# Type Alias: User

> **User** = `object`

Defined in: [types/src/users/user.ts:12](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/user.ts)

This interface represents a user.
It has some of the same fields as a Firebase User.
Note that in the default implementation, we simply take the Firebase user
and use it as a Rebase user, so that means that even if they are not mapped
in this interface, it contains all the methods of the former, such as `delete`,
`getIdToken`, etc.

## Properties

### displayName

> `readonly` **displayName**: `string` \| `null`

Defined in: [types/src/users/user.ts:20](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/user.ts)

The display name of the user.

***

### email

> `readonly` **email**: `string` \| `null`

Defined in: [types/src/users/user.ts:24](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/user.ts)

The email of the user.

***

### getIdToken()?

> `optional` **getIdToken**: (`forceRefresh?`) => `Promise`\<`string`\>

Defined in: [types/src/users/user.ts:44](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/user.ts)

#### Parameters

##### forceRefresh?

`boolean`

#### Returns

`Promise`\<`string`\>

***

### isAnonymous

> `readonly` **isAnonymous**: `boolean`

Defined in: [types/src/users/user.ts:36](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/user.ts)

***

### photoURL

> `readonly` **photoURL**: `string` \| `null`

Defined in: [types/src/users/user.ts:28](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/user.ts)

The profile photo URL of the user.

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [types/src/users/user.ts:32](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/user.ts)

The provider used to authenticate the user.

***

### roles?

> `optional` **roles**: `string`[]

Defined in: [types/src/users/user.ts:42](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/user.ts)

Role IDs assigned to this user (e.g. ["admin", "editor"]).
These are plain string IDs — use the UserManagementDelegate to look up full Role objects.

***

### uid

> `readonly` **uid**: `string`

Defined in: [types/src/users/user.ts:16](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/user.ts)

The user's unique ID, scoped to the project.
