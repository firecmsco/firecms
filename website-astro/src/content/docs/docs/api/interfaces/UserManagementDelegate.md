---
slug: "docs/api/interfaces/UserManagementDelegate"
title: "UserManagementDelegate"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / UserManagementDelegate

# Interface: UserManagementDelegate\<USER\>

Defined in: [types/src/types/user\_management\_delegate.ts:11](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Delegate to manage users, roles, and their permissions.
This interface allows the CMS to be completely agnostic of the underlying
authentication provider or backend.

## Type Parameters

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### allowDefaultRolesCreation?

> `optional` **allowDefaultRolesCreation**: `boolean`

Defined in: [types/src/types/user\_management\_delegate.ts:77](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

If true, the UI will allow the user to create the default roles (admin, editor, viewer).

***

### bootstrapAdmin()?

> `optional` **bootstrapAdmin**: () => `Promise`\<`void`\>

Defined in: [types/src/types/user\_management\_delegate.ts:96](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Optional function to bootstrap an admin user.
Often used when the database is empty.

#### Returns

`Promise`\<`void`\>

***

### defineRolesFor()?

> `optional` **defineRolesFor**: (`user`) => [`Role`](../type-aliases/Role)[] \| `Promise`\<[`Role`](../type-aliases/Role)[] \| `undefined`\> \| `undefined`

Defined in: [types/src/types/user\_management\_delegate.ts:90](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Optionally define roles for a given user. This is useful when the roles
are coming from a separate provider than the one issuing the tokens.

#### Parameters

##### user

`USER`

#### Returns

[`Role`](../type-aliases/Role)[] \| `Promise`\<[`Role`](../type-aliases/Role)[] \| `undefined`\> \| `undefined`

***

### deleteRole()?

> `optional` **deleteRole**: (`role`) => `Promise`\<`void`\>

Defined in: [types/src/types/user\_management\_delegate.ts:67](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Delete a role

#### Parameters

##### role

[`Role`](../type-aliases/Role)

#### Returns

`Promise`\<`void`\>

***

### deleteUser()?

> `optional` **deleteUser**: (`user`) => `Promise`\<`void`\>

Defined in: [types/src/types/user\_management\_delegate.ts:45](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Delete a user

#### Parameters

##### user

`USER`

#### Returns

`Promise`\<`void`\>

***

### getUser()

> **getUser**: (`uid`) => `USER` \| `null`

Defined in: [types/src/types/user\_management\_delegate.ts:33](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Function to get a user by its uid. This is used to show
user information when assigning ownership of an entity.

#### Parameters

##### uid

`string`

#### Returns

`USER` \| `null`

***

### includeCollectionConfigPermissions?

> `optional` **includeCollectionConfigPermissions**: `boolean`

Defined in: [types/src/types/user\_management\_delegate.ts:82](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Should collection config permissions be included?

***

### isAdmin?

> `optional` **isAdmin**: `boolean`

Defined in: [types/src/types/user\_management\_delegate.ts:72](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Is the currently logged in user an admin?

***

### loading

> **loading**: `boolean`

Defined in: [types/src/types/user\_management\_delegate.ts:16](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Are the users and roles currently being fetched?

***

### roles?

> `optional` **roles**: [`Role`](../type-aliases/Role)[]

Defined in: [types/src/types/user\_management\_delegate.ts:50](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

List of roles defined in the CMS.

***

### rolesError?

> `optional` **rolesError**: `Error`

Defined in: [types/src/types/user\_management\_delegate.ts:55](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Optional error if roles failed to load.

***

### saveRole()?

> `optional` **saveRole**: (`role`) => `Promise`\<`void`\>

Defined in: [types/src/types/user\_management\_delegate.ts:61](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Save a role (create or update)

#### Parameters

##### role

[`Role`](../type-aliases/Role)

#### Returns

`Promise`\<`void`\>

***

### saveUser()?

> `optional` **saveUser**: (`user`) => `Promise`\<`USER`\>

Defined in: [types/src/types/user\_management\_delegate.ts:39](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Save a user (create or update)

#### Parameters

##### user

`USER`

#### Returns

`Promise`\<`USER`\>

***

### users

> **users**: `USER`[]

Defined in: [types/src/types/user\_management\_delegate.ts:21](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

List of users managed by the CMS.

***

### usersError?

> `optional` **usersError**: `Error`

Defined in: [types/src/types/user\_management\_delegate.ts:26](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/user_management_delegate.ts)

Optional error if users failed to load.
