---
id: "buildAdditionalFieldDelegate"
title: "Function: buildAdditionalFieldDelegate"
sidebar_label: "buildAdditionalFieldDelegate"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildAdditionalFieldDelegate**\<`M`, `AdditionalKey`, `UserType`\>(`additionalFieldDelegate`): [`AdditionalFieldDelegate`](../interfaces/AdditionalFieldDelegate.md)\<`M`, `AdditionalKey`, `UserType`\>

Identity function we use to defeat the type system of Typescript and build
additional field delegates views with all its properties

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |
| `AdditionalKey` | extends `string` = `string` |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `additionalFieldDelegate` | [`AdditionalFieldDelegate`](../interfaces/AdditionalFieldDelegate.md)\<`M`, `AdditionalKey`, `UserType`\> |

#### Returns

[`AdditionalFieldDelegate`](../interfaces/AdditionalFieldDelegate.md)\<`M`, `AdditionalKey`, `UserType`\>

#### Defined in

[packages/firecms_core/src/core/builders.ts:124](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/builders.ts#L124)
