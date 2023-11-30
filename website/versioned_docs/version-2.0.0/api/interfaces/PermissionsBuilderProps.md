---
id: "PermissionsBuilderProps"
title: "Interface: PermissionsBuilderProps<EC, UserType, M>"
sidebar_label: "PermissionsBuilderProps"
sidebar_position: 0
custom_edit_url: null
---

Props passed to a [PermissionsBuilder](../types/PermissionsBuilder.md)

## Type parameters

| Name | Type |
| :------ | :------ |
| `EC` | extends [`EntityCollection`](EntityCollection.md) = [`EntityCollection`](EntityCollection.md) |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |
| `M` | extends `object` = [`InferCollectionType`](../types/InferCollectionType.md)\<`EC`\> |

## Properties

### authController

• **authController**: [`AuthController`](../types/AuthController.md)\<`UserType`\>

Auth controller

#### Defined in

[packages/firecms_core/src/types/permissions.ts:62](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/permissions.ts#L62)

___

### collection

• **collection**: `EC`

Collection these permissions apply to

#### Defined in

[packages/firecms_core/src/types/permissions.ts:57](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/permissions.ts#L57)

___

### entity

• **entity**: ``null`` \| [`Entity`](Entity.md)\<`M`\>

Entity being edited, might be null in some cases, when the operation
refers to the collection.
For example, when deciding whether a user can create a new entity
in a collection, the entity will be null.

#### Defined in

[packages/firecms_core/src/types/permissions.ts:42](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/permissions.ts#L42)

___

### pathSegments

• **pathSegments**: `string`[]

Path segments of the collection e.g. ['products', 'locales']

#### Defined in

[packages/firecms_core/src/types/permissions.ts:47](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/permissions.ts#L47)

___

### user

• **user**: ``null`` \| `UserType`

Logged in user

#### Defined in

[packages/firecms_core/src/types/permissions.ts:52](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/permissions.ts#L52)
