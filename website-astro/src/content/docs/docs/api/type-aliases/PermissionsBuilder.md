---
slug: "docs/api/type-aliases/PermissionsBuilder"
title: "PermissionsBuilder"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / PermissionsBuilder

# Type Alias: PermissionsBuilder()\<EC, USER, M\>

> **PermissionsBuilder**\<`EC`, `USER`, `M`\> = (`{
          pathSegments,
          user,
          collection,
          authController
      }`) => [`Permissions`](/docs/api/interfaces/Permissions) \| `undefined`

Defined in: [types/permissions.ts:75](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Builder used to assign permissions to entities,
based on the logged user or collection.

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](/docs/api/interfaces/EntityCollection) = [`EntityCollection`](/docs/api/interfaces/EntityCollection)

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User) = [`User`](/docs/api/type-aliases/User)

### M

`M` *extends* `object` = [`InferCollectionType`](/docs/api/type-aliases/InferCollectionType)\<`EC`\>

## Parameters

### \{
          pathSegments,
          user,
          collection,
          authController
      \}

[`PermissionsBuilderProps`](/docs/api/interfaces/PermissionsBuilderProps)\<`EC`, `USER`, `M`\>

## Returns

[`Permissions`](/docs/api/interfaces/Permissions) \| `undefined`
