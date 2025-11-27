---
slug: "docs/api/functions/applyPermissionsFunctionIfEmpty"
title: "applyPermissionsFunctionIfEmpty"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / applyPermissionsFunctionIfEmpty

# Function: applyPermissionsFunctionIfEmpty()

> **applyPermissionsFunctionIfEmpty**(`collections`, `permissionsBuilder?`): [`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

Defined in: [util/collections.ts:61](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/collections.ts)

If a collection is not applying permissions, we apply the given permissionsBuilder.
This is used to apply the role permissions to the collections, unless they are already
applying permissions.

## Parameters

### collections

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]

### permissionsBuilder?

[`PermissionsBuilder`](../type-aliases/PermissionsBuilder)\<`any`, `any`\>

## Returns

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>[]
