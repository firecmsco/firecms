---
slug: "docs/api/type-aliases/InternalUserManagement"
title: "InternalUserManagement"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / InternalUserManagement

# Type Alias: InternalUserManagement\<USER\>

> **InternalUserManagement**\<`USER`\> = `object`

Defined in: [types/internal\_user\_management.ts:3](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/internal_user_management.ts)

## Type Parameters

### USER

`USER` *extends* [`User`](User) = [`User`](User)

## Properties

### getUser()

> **getUser**: (`uid`) => `USER` \| `null`

Defined in: [types/internal\_user\_management.ts:22](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/internal_user_management.ts)

Function to get a user by its uid. This is used to show
user information when assigning ownership of an entity.

You can pass your own implementation if you want to show
more information about the user.

If you are using the FireCMS user management plugin, this
function will be implemented automatically.

#### Parameters

##### uid

`string`

#### Returns

`USER` \| `null`

***

### users

> **users**: `USER`[]

Defined in: [types/internal\_user\_management.ts:8](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/internal_user_management.ts)

List of users to be managed by the CMS.
