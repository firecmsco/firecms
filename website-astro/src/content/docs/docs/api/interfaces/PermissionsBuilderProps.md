---
slug: "docs/api/interfaces/PermissionsBuilderProps"
title: "PermissionsBuilderProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / PermissionsBuilderProps

# Interface: PermissionsBuilderProps\<EC, USER, M\>

Defined in: [types/permissions.ts:35](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Props passed to a [PermissionsBuilder](../type-aliases/PermissionsBuilder)

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](EntityCollection) = [`EntityCollection`](EntityCollection)

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

### M

`M` *extends* `object` = [`InferCollectionType`](../type-aliases/InferCollectionType)\<`EC`\>

## Properties

### authController

> **authController**: [`AuthController`](../type-aliases/AuthController)\<`USER`\>

Defined in: [types/permissions.ts:67](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Auth controller

***

### collection

> **collection**: `EC`

Defined in: [types/permissions.ts:62](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Collection these permissions apply to

***

### entity

> **entity**: [`Entity`](Entity)\<`M`\> \| `null`

Defined in: [types/permissions.ts:42](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Entity being edited, might be null in some cases, when the operation
refers to the collection.
For example, when deciding whether a user can create a new entity
in a collection, the entity will be null.

***

### path

> **path**: `string`

Defined in: [types/permissions.ts:47](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Path of the collection e.g. 'products/12345/locales'

***

### pathSegments

> **pathSegments**: `string`[]

Defined in: [types/permissions.ts:52](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Path segments of the collection e.g. ['products', 'locales']

***

### user

> **user**: `USER` \| `null`

Defined in: [types/permissions.ts:57](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/permissions.ts)

Logged in user
