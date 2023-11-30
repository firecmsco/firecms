---
id: "getPropertyInPath"
title: "Function: getPropertyInPath"
sidebar_label: "getPropertyInPath"
sidebar_position: 0
custom_edit_url: null
---

▸ **getPropertyInPath**\<`M`\>(`properties`, `path`): [`PropertyOrBuilder`](../types/PropertyOrBuilder.md)\<`any`, `M`\> \| `undefined`

Get a property in a property tree from a path like
`address.street`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | [`PropertiesOrBuilders`](../types/PropertiesOrBuilders.md)\<`M`\> |
| `path` | `string` |

#### Returns

[`PropertyOrBuilder`](../types/PropertyOrBuilder.md)\<`any`, `M`\> \| `undefined`

#### Defined in

[packages/firecms_core/src/core/util/property_utils.tsx:66](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/util/property_utils.tsx#L66)
