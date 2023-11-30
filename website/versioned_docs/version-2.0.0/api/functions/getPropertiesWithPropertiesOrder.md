---
id: "getPropertiesWithPropertiesOrder"
title: "Function: getPropertiesWithPropertiesOrder"
sidebar_label: "getPropertiesWithPropertiesOrder"
sidebar_position: 0
custom_edit_url: null
---

▸ **getPropertiesWithPropertiesOrder**\<`M`\>(`properties`, `propertiesOrder?`): [`PropertiesOrBuilders`](../types/PropertiesOrBuilders.md)\<`M`\>

Get properties exclusively indexed by their order

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | [`PropertiesOrBuilders`](../types/PropertiesOrBuilders.md)\<`M`\> |
| `propertiesOrder?` | `Extract`\<keyof `M`, `string`\>[] |

#### Returns

[`PropertiesOrBuilders`](../types/PropertiesOrBuilders.md)\<`M`\>

#### Defined in

[packages/firecms_core/src/core/util/property_utils.tsx:109](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/util/property_utils.tsx#L109)
