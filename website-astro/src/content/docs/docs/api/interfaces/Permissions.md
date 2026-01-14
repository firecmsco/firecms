---
slug: "docs/api/interfaces/Permissions"
title: "Permissions"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / Permissions

# Interface: Permissions

Defined in: [types/permissions.ts:10](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Define the operations that can be performed in a collection.

## Properties

### create?

> `optional` **create**: `boolean`

Defined in: [types/permissions.ts:20](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Can the user add new entities. Defaults to `true`

***

### delete?

> `optional` **delete**: `boolean`

Defined in: [types/permissions.ts:28](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Can the user delete entities. Defaults to `true`

***

### edit?

> `optional` **edit**: `boolean`

Defined in: [types/permissions.ts:24](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Can the elements in this collection be edited. Defaults to `true`

***

### read?

> `optional` **read**: `boolean`

Defined in: [types/permissions.ts:16](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Can the user see this collection.
If `false` it will not show in the user's navigation
Defaults to `true`
