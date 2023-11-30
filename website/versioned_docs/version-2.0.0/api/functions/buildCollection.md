---
id: "buildCollection"
title: "Function: buildCollection"
sidebar_label: "buildCollection"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildCollection**\<`M`, `AdditionalKey`, `UserType`\>(`collection`): [`EntityCollection`](../interfaces/EntityCollection.md)\<`M`, `AdditionalKey`, `UserType`\>

Identity function we use to defeat the type system of Typescript and build
collection views with all its properties

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |
| `AdditionalKey` | extends `string` = `string` |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `collection` | [`EntityCollection`](../interfaces/EntityCollection.md)\<`M`, `AdditionalKey`, `UserType`\> |

#### Returns

[`EntityCollection`](../interfaces/EntityCollection.md)\<`M`, `AdditionalKey`, `UserType`\>

#### Defined in

[packages/firecms_core/src/core/builders.ts:29](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/builders.ts#L29)
