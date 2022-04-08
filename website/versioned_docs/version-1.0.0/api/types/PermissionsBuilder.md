---
id: "PermissionsBuilder"
title: "Type alias: PermissionsBuilder<M, UserType>"
sidebar_label: "PermissionsBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PermissionsBuilder**<`M`, `UserType`\>: [`Permissions`](../interfaces/Permissions) \| (`{
            entity,
            path,
            user,
            authController,
            context
        }`: [`PermissionsBuilderProps`](../interfaces/PermissionsBuilderProps)<`M`, `UserType`\>) => [`Permissions`](../interfaces/Permissions)

Builder used to assign `create`, `edit` and `delete` permissions to entities,
based on the logged user, entity or collection path

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |
| `UserType` | [`User`](User) |

#### Defined in

[models/permissions.ts:59](https://github.com/Camberi/firecms/blob/2d60fba/src/models/permissions.ts#L59)
