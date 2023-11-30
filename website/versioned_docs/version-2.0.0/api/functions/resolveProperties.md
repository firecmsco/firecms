---
id: "resolveProperties"
title: "Function: resolveProperties"
sidebar_label: "resolveProperties"
sidebar_position: 0
custom_edit_url: null
---

▸ **resolveProperties**\<`M`\>(`«destructured»`): [`ResolvedProperties`](../types/ResolvedProperties.md)\<`M`\>

Resolve enums and arrays for properties

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `entityId?` | `string` |
| › `fields?` | `Record`\<`string`, [`PropertyConfig`](../types/PropertyConfig.md)\> |
| › `fromBuilder?` | `boolean` |
| › `index?` | `number` |
| › `path?` | `string` |
| › `previousValues?` | `Partial`\<`M`\> |
| › `properties` | [`PropertiesOrBuilders`](../types/PropertiesOrBuilders.md)\<`M`\> |
| › `propertyValue` | `unknown` |
| › `values?` | `Partial`\<`M`\> |

#### Returns

[`ResolvedProperties`](../types/ResolvedProperties.md)\<`M`\>

#### Defined in

[packages/firecms_core/src/core/util/resolutions.ts:321](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/util/resolutions.ts#L321)
