---
id: "updateDateAutoValues"
title: "Function: updateDateAutoValues"
sidebar_label: "updateDateAutoValues"
sidebar_position: 0
custom_edit_url: null
---

▸ **updateDateAutoValues**\<`M`\>(`«destructured»`): [`EntityValues`](../types/EntityValues.md)\<`M`\>

Update the automatic values in an entity before save

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `inputValues` | `Partial`\<`M`\> |
| › `properties` | [`ResolvedProperties`](../types/ResolvedProperties.md)\<`M`\> |
| › `setDateToMidnight` | (`input?`: `any`) => `any` |
| › `status` | [`EntityStatus`](../types/EntityStatus.md) |
| › `timestampNowValue` | `any` |

#### Returns

[`EntityValues`](../types/EntityValues.md)\<`M`\>

#### Defined in

[packages/firecms_core/src/core/util/entities.ts:84](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/util/entities.ts#L84)
