---
id: "PermissionsBuilder"
title: "Type alias: PermissionsBuilder<EC, UserType, M>"
sidebar_label: "PermissionsBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PermissionsBuilder**\<`EC`, `UserType`, `M`\>: (`{
          pathSegments,
          user,
          collection,
          authController
      }`: [`PermissionsBuilderProps`](../interfaces/PermissionsBuilderProps.md)\<`EC`, `UserType`, `M`\>) => [`Permissions`](../interfaces/Permissions.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `EC` | extends [`EntityCollection`](../interfaces/EntityCollection.md) = [`EntityCollection`](../interfaces/EntityCollection.md) |
| `UserType` | extends [`User`](User.md) = [`User`](User.md) |
| `M` | extends `object` = [`InferCollectionType`](InferCollectionType.md)\<`EC`\> |

#### Type declaration

▸ (`{
          pathSegments,
          user,
          collection,
          authController
      }`): [`Permissions`](../interfaces/Permissions.md)

Builder used to assign permissions to entities,
based on the logged user or collection.

##### Parameters

| Name | Type |
| :------ | :------ |
| `{
          pathSegments,
          user,
          collection,
          authController
      }` | [`PermissionsBuilderProps`](../interfaces/PermissionsBuilderProps.md)\<`EC`, `UserType`, `M`\> |

##### Returns

[`Permissions`](../interfaces/Permissions.md)

#### Defined in

[packages/firecms_core/src/types/permissions.ts:70](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/permissions.ts#L70)
