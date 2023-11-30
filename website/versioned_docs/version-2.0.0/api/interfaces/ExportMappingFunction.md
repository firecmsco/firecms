---
id: "ExportMappingFunction"
title: "Interface: ExportMappingFunction<UserType>"
sidebar_label: "ExportMappingFunction"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |

## Properties

### builder

• **builder**: (`__namedParameters`: { `context`: [`FireCMSContext`](../types/FireCMSContext.md)<`UserType`\> ; `entity`: [`Entity`](Entity.md)<`any`\>  }) => `string` \| `Promise`<`string`\>

#### Type declaration

▸ (`«destructured»`): `string` \| `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `context` | [`FireCMSContext`](../types/FireCMSContext.md)<`UserType`\> |
| › `entity` | [`Entity`](Entity.md)<`any`\> |

##### Returns

`string` \| `Promise`<`string`\>

#### Defined in

[packages/firecms/src/types/collections.ts:362](https://github.com/FireCMSco/firecms/blob/4d94ba6f/packages/firecms/src/types/collections.ts#L362)

___

### key

• **key**: `string`

#### Defined in

[packages/firecms/src/types/collections.ts:361](https://github.com/FireCMSco/firecms/blob/4d94ba6f/packages/firecms/src/types/collections.ts#L361)
