---
id: "traverseValuesProperties"
title: "Function: traverseValuesProperties"
sidebar_label: "traverseValuesProperties"
sidebar_position: 0
custom_edit_url: null
---

▸ **traverseValuesProperties**\<`M`\>(`inputValues`, `properties`, `operation`): [`EntityValues`](../types/EntityValues.md)\<`M`\> \| `undefined`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `inputValues` | `Partial`\<`M`\> |
| `properties` | [`ResolvedProperties`](../types/ResolvedProperties.md)\<`M`\> |
| `operation` | (`value`: `any`, `property`: [`Property`](../types/Property.md)) => `any` |

#### Returns

[`EntityValues`](../types/EntityValues.md)\<`M`\> \| `undefined`

#### Defined in

[packages/firecms_core/src/core/util/entities.ts:146](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/util/entities.ts#L146)
