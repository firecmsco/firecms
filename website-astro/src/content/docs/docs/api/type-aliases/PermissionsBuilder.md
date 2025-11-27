---
slug: "docs/api/type-aliases/PermissionsBuilder"
title: "PermissionsBuilder"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / PermissionsBuilder

# Type Alias: PermissionsBuilder()\<EC, USER, M\>

> **PermissionsBuilder**\<`EC`, `USER`, `M`\> = (`{
          pathSegments,
          user,
          collection,
          authController
      }`) => [`Permissions`](../interfaces/Permissions) \| `undefined`

Defined in: [types/permissions.ts:75](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Builder used to assign permissions to entities,
based on the logged user or collection.

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection) = [`EntityCollection`](../interfaces/EntityCollection)

### USER

`USER` *extends* [`User`](User) = [`User`](User)

### M

`M` *extends* `object` = [`InferCollectionType`](InferCollectionType)\<`EC`\>

## Parameters

### \{
          pathSegments,
          user,
          collection,
          authController
      \}

[`PermissionsBuilderProps`](../interfaces/PermissionsBuilderProps)\<`EC`, `USER`, `M`\>

## Returns

[`Permissions`](../interfaces/Permissions) \| `undefined`
