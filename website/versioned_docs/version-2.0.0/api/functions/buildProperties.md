---
id: "buildProperties"
title: "Function: buildProperties"
sidebar_label: "buildProperties"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildProperties**\<`M`\>(`properties`): [`PropertiesOrBuilders`](../types/PropertiesOrBuilders.md)\<`M`\>

Identity function we use to defeat the type system of Typescript and preserve
the properties keys.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | [`PropertiesOrBuilders`](../types/PropertiesOrBuilders.md)\<`M`\> |

#### Returns

[`PropertiesOrBuilders`](../types/PropertiesOrBuilders.md)\<`M`\>

#### Defined in

[packages/firecms_core/src/core/builders.ts:64](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/builders.ts#L64)
