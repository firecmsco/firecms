---
id: "resolveProperty"
title: "Function: resolveProperty"
sidebar_label: "resolveProperty"
sidebar_position: 0
custom_edit_url: null
---

▸ **resolveProperty**\<`T`, `M`\>(`«destructured»`): [`ResolvedProperty`](../types/ResolvedProperty.md)\<`T`\> \| ``null``

Resolve property builders, enums and arrays.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](../types/CMSType.md) = [`CMSType`](../types/CMSType.md) |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `entityId?` | `string` |
| › `fields?` | `Record`\<`string`, [`PropertyConfig`](../types/PropertyConfig.md)\<`any`\>\> |
| › `fromBuilder?` | `boolean` |
| › `index?` | `number` |
| › `path?` | `string` |
| › `previousValues?` | `Partial`\<`M`\> |
| › `propertyKey?` | `string` |
| › `propertyOrBuilder` | [`ResolvedProperty`](../types/ResolvedProperty.md)\<`T`\> \| [`PropertyOrBuilder`](../types/PropertyOrBuilder.md)\<`T`, `M`\> |
| › `propertyValue?` | `unknown` |
| › `values?` | `Partial`\<`M`\> |

#### Returns

[`ResolvedProperty`](../types/ResolvedProperty.md)\<`T`\> \| ``null``

#### Defined in

[packages/firecms_core/src/core/util/resolutions.ts:96](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/util/resolutions.ts#L96)
