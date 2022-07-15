---
id: "buildAdditionalColumnDelegate"
title: "Function: buildAdditionalColumnDelegate"
sidebar_label: "buildAdditionalColumnDelegate"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildAdditionalColumnDelegate**<`M`, `AdditionalKey`, `UserType`\>(`additionalColumnDelegate`): [`AdditionalColumnDelegate`](../interfaces/AdditionalColumnDelegate)<`M`, `AdditionalKey`, `UserType`\>

Identity function we use to defeat the type system of Typescript and build
additional column delegates views with all its properties

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |
| `AdditionalKey` | extends `string` = `string` |
| `UserType` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `additionalColumnDelegate` | [`AdditionalColumnDelegate`](../interfaces/AdditionalColumnDelegate)<`M`, `AdditionalKey`, `UserType`\> |

#### Returns

[`AdditionalColumnDelegate`](../interfaces/AdditionalColumnDelegate)<`M`, `AdditionalKey`, `UserType`\>

#### Defined in

[core/builders.ts:150](https://github.com/Camberi/firecms/blob/2d60fba/src/core/builders.ts#L150)
