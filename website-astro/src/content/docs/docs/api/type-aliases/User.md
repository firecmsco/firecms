---
slug: "docs/api/type-aliases/User"
title: "User"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / User

# Type Alias: User

> **User** = `object`

Defined in: [types/user.ts:13](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/user.ts)

This interface represents a user.
It has some of the same fields as a Firebase User.
Note that in the default implementation, we simply take the Firebase user
and use it as a FireCMS user, so that means that even if they are not mapped
in this interface, it contains all the methods of the former, such as `delete`,
`getIdToken`, etc.

## Properties

### displayName

> `readonly` **displayName**: `string` \| `null`

Defined in: [types/user.ts:21](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/user.ts)

The display name of the user.

***

### email

> `readonly` **email**: `string` \| `null`

Defined in: [types/user.ts:25](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/user.ts)

The email of the user.

***

### getIdToken()?

> `optional` **getIdToken**: (`forceRefresh?`) => `Promise`\<`string`\>

Defined in: [types/user.ts:44](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/user.ts)

#### Parameters

##### forceRefresh?

`boolean`

#### Returns

`Promise`\<`string`\>

***

### isAnonymous

> `readonly` **isAnonymous**: `boolean`

Defined in: [types/user.ts:37](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/user.ts)

***

### photoURL

> `readonly` **photoURL**: `string` \| `null`

Defined in: [types/user.ts:29](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/user.ts)

The profile photo URL of the user.

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [types/user.ts:33](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/user.ts)

The provider used to authenticate the user.

***

### roles?

> `optional` **roles**: [`Role`](Role)[]

Defined in: [types/user.ts:42](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/user.ts)

Custom roles assigned to the user.

***

### uid

> `readonly` **uid**: `string`

Defined in: [types/user.ts:17](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/user.ts)

The user's unique ID, scoped to the project.
