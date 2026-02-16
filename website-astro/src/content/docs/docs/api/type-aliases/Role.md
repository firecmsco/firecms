---
slug: "docs/api/type-aliases/Role"
title: "Role"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / Role

# Type Alias: Role

> **Role** = `object`

Defined in: [types/roles.ts:3](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/roles.ts)

## Properties

### collectionPermissions?

> `optional` **collectionPermissions**: `Record`\<`string`, [`Permissions`](../interfaces/Permissions)\>

Defined in: [types/roles.ts:31](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/roles.ts)

Record of stripped collection ids to their permissions.

#### See

stripCollectionPath

***

### config?

> `optional` **config**: `object`

Defined in: [types/roles.ts:36](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/roles.ts)

Permissions related to editing the collections

#### createCollections?

> `optional` **createCollections**: `boolean`

#### deleteCollections?

> `optional` **deleteCollections**: `boolean` \| `"own"`

#### editCollections?

> `optional` **editCollections**: `boolean` \| `"own"`

***

### defaultPermissions?

> `optional` **defaultPermissions**: [`Permissions`](../interfaces/Permissions)

Defined in: [types/roles.ts:25](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/roles.ts)

Default permissions for all collections for this role.
You can override this values at the collection level using
[collectionPermissions](#collectionpermissions)

***

### id

> **id**: `string`

Defined in: [types/roles.ts:8](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/roles.ts)

ID of the role

***

### isAdmin?

> `optional` **isAdmin**: `boolean`

Defined in: [types/roles.ts:18](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/roles.ts)

If this flag is true, the user can perform any action

***

### name

> **name**: `string`

Defined in: [types/roles.ts:13](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/roles.ts)

Name of the role
