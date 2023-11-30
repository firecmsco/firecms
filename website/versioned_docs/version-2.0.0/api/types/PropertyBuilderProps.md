---
id: "PropertyBuilderProps"
title: "Type alias: PropertyBuilderProps<M>"
sidebar_label: "PropertyBuilderProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PropertyBuilderProps**\<`M`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `entityId?` | `string` | Entity ID |
| `index?` | `number` | Index of this property (only for arrays) |
| `path` | `string` | Path of the entity in the data source |
| `previousValues?` | `Partial`\<`M`\> | Previous values of the entity before being saved |
| `propertyValue?` | `any` | Current value of this property |
| `values` | `Partial`\<`M`\> | Current values of the entity |

#### Defined in

[packages/firecms_core/src/types/properties.ts:240](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L240)
