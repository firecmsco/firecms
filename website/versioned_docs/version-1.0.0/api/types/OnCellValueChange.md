---
id: "OnCellValueChange"
title: "Type alias: OnCellValueChange<T, M>"
sidebar_label: "OnCellValueChange"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **OnCellValueChange**<`T`, `M`\>: (`params`: [`OnCellValueChangeParams`](../interfaces/OnCellValueChangeParams)<`T`, `M`\>) => `Promise`<`void`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `M` | extends `Object` |

#### Type declaration

▸ (`params`): `Promise`<`void`\>

Callback when a cell has changed in a table

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`OnCellValueChangeParams`](../interfaces/OnCellValueChangeParams)<`T`, `M`\> |

##### Returns

`Promise`<`void`\>

#### Defined in

[core/components/CollectionTable/column_builder.tsx:94](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/column_builder.tsx#L94)
