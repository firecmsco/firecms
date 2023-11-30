---
id: "resolvePermissions"
title: "Function: resolvePermissions"
sidebar_label: "resolvePermissions"
sidebar_position: 0
custom_edit_url: null
---

▸ **resolvePermissions**\<`M`, `UserType`\>(`collection`, `authController`, `pathSegments`, `entity`): [`Permissions`](../interfaces/Permissions.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |
| `UserType` | extends [`User`](../types/User.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `collection` | [`EntityCollection`](../interfaces/EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\> |
| `authController` | [`AuthController`](../types/AuthController.md)\<`UserType`\> |
| `pathSegments` | `string`[] |
| `entity` | ``null`` \| [`Entity`](../interfaces/Entity.md)\<`M`\> |

#### Returns

[`Permissions`](../interfaces/Permissions.md)

#### Defined in

[packages/firecms_core/src/core/util/permissions.ts:10](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/util/permissions.ts#L10)
