---
id: "OnCellValueChange"
title: "Type alias: OnCellValueChange<T, M>"
sidebar_label: "OnCellValueChange"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **OnCellValueChange**\<`T`, `M`\>: (`params`: [`OnCellValueChangeParams`](../interfaces/OnCellValueChangeParams.md)\<`T`, `M`\>) => `Promise`\<`void`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `M` | extends `Record`\<`string`, `any`\> |

#### Type declaration

▸ (`params`): `Promise`\<`void`\>

Callback when a cell has changed in a table

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`OnCellValueChangeParams`](../interfaces/OnCellValueChangeParams.md)\<`T`, `M`\> |

##### Returns

`Promise`\<`void`\>

#### Defined in

[packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx:99](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx#L99)
