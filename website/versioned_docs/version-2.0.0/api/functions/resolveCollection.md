---
id: "resolveCollection"
title: "Function: resolveCollection"
sidebar_label: "resolveCollection"
sidebar_position: 0
custom_edit_url: null
---

▸ **resolveCollection**\<`M`\>(`«destructured»`): [`ResolvedEntityCollection`](../types/ResolvedEntityCollection.md)\<`M`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `collection` | [`EntityCollection`](../interfaces/EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\> \| [`ResolvedEntityCollection`](../types/ResolvedEntityCollection.md)\<`M`\> |
| › `entityId?` | `string` |
| › `fields?` | `Record`\<`string`, [`PropertyConfig`](../types/PropertyConfig.md)\> |
| › `path` | `string` |
| › `previousValues?` | `Partial`\<`M`\> |
| › `userConfigPersistence?` | [`UserConfigurationPersistence`](../interfaces/UserConfigurationPersistence.md) |
| › `values?` | `Partial`\<`M`\> |

#### Returns

[`ResolvedEntityCollection`](../types/ResolvedEntityCollection.md)\<`M`\>

#### Defined in

[packages/firecms_core/src/core/util/resolutions.ts:31](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/util/resolutions.ts#L31)
