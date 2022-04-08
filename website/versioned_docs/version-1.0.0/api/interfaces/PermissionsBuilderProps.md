---
id: "PermissionsBuilderProps"
title: "Interface: PermissionsBuilderProps<M, UserType>"
sidebar_label: "PermissionsBuilderProps"
sidebar_position: 0
custom_edit_url: null
---

Props passed to a [PermissionsBuilder](../types/PermissionsBuilder)

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |
| `UserType` | [`User`](../types/User) |

## Properties

### authController

• **authController**: [`AuthController`](AuthController)<`UserType`\>

Auth controller

#### Defined in

[models/permissions.ts:47](https://github.com/Camberi/firecms/blob/2d60fba/src/models/permissions.ts#L47)

___

### context

• **context**: [`FireCMSContext`](FireCMSContext)<`UserType`\>

Context of the app status

#### Defined in

[models/permissions.ts:51](https://github.com/Camberi/firecms/blob/2d60fba/src/models/permissions.ts#L51)

___

### entity

• **entity**: ``null`` \| [`Entity`](Entity)<`M`\>

Entity being edited, might be null if it is new

#### Defined in

[models/permissions.ts:35](https://github.com/Camberi/firecms/blob/2d60fba/src/models/permissions.ts#L35)

___

### path

• **path**: `string`

Collection path of this entity

#### Defined in

[models/permissions.ts:39](https://github.com/Camberi/firecms/blob/2d60fba/src/models/permissions.ts#L39)

___

### user

• **user**: ``null`` \| `UserType`

Logged in user

#### Defined in

[models/permissions.ts:43](https://github.com/Camberi/firecms/blob/2d60fba/src/models/permissions.ts#L43)
