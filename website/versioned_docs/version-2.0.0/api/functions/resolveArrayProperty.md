---
id: "resolveArrayProperty"
title: "Function: resolveArrayProperty"
sidebar_label: "resolveArrayProperty"
sidebar_position: 0
custom_edit_url: null
---

▸ **resolveArrayProperty**\<`T`, `M`\>(`«destructured»`): [`ResolvedArrayProperty`](../types/ResolvedArrayProperty.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `any`[] |
| `M` | `M` |

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
| › `property` | [`ResolvedArrayProperty`](../types/ResolvedArrayProperty.md)\<`T`, `ArrayT`\> \| [`ArrayProperty`](../interfaces/ArrayProperty.md)\<`T`, [`CMSType`](../types/CMSType.md)\> |
| › `propertyKey?` | `string` |
| › `propertyValue` | `any` |
| › `values?` | `Partial`\<`M`\> |

#### Returns

[`ResolvedArrayProperty`](../types/ResolvedArrayProperty.md)

#### Defined in

[packages/firecms_core/src/core/util/resolutions.ts:213](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/util/resolutions.ts#L213)
