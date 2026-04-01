---
slug: "docs/api/type-aliases/Role"
title: "Role"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / Role

# Type Alias: Role

> **Role** = `object`

Defined in: [types/src/users/roles.ts:3](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/roles.ts)

## Properties

### config?

> `optional` **config**: `object`

Defined in: [types/src/users/roles.ts:25](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/roles.ts)

Permissions related to editing the collections

#### createCollections?

> `optional` **createCollections**: `boolean`

#### deleteCollections?

> `optional` **deleteCollections**: `boolean` \| `"own"`

#### editCollections?

> `optional` **editCollections**: `boolean` \| `"own"`

***

### id

> **id**: `string`

Defined in: [types/src/users/roles.ts:8](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/roles.ts)

ID of the role

***

### isAdmin?

> `optional` **isAdmin**: `boolean`

Defined in: [types/src/users/roles.ts:18](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/roles.ts)

If this flag is true, the user can perform any action

***

### name

> **name**: `string`

Defined in: [types/src/users/roles.ts:13](https://github.com/rebaseco/rebase/blob/main/packages/types/src/users/roles.ts)

Name of the role
