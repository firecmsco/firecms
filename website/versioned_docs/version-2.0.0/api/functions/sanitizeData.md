---
id: "sanitizeData"
title: "Function: sanitizeData"
sidebar_label: "sanitizeData"
sidebar_position: 0
custom_edit_url: null
---

▸ **sanitizeData**\<`M`\>(`values`, `properties`): `any`

Add missing required fields, expected in the collection, to the values of an entity

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `values` | `M` |
| `properties` | [`ResolvedProperties`](../types/ResolvedProperties.md)\<`M`\> |

#### Returns

`any`

#### Defined in

[packages/firecms_core/src/core/util/entities.ts:128](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/util/entities.ts#L128)
