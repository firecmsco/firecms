---
id: "OnCellValueChangeParams"
title: "Interface: OnCellValueChangeParams<T, M>"
sidebar_label: "OnCellValueChangeParams"
sidebar_position: 0
custom_edit_url: null
---

Props passed in a callback when the content of a cell in a table has been edited

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `M` | extends `Object` |

## Properties

### entity

• **entity**: [`Entity`](Entity)<`M`\>

#### Defined in

[core/components/CollectionTable/column_builder.tsx:103](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/column_builder.tsx#L103)

___

### name

• **name**: `string`

#### Defined in

[core/components/CollectionTable/column_builder.tsx:102](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/column_builder.tsx#L102)

___

### value

• **value**: `T`

#### Defined in

[core/components/CollectionTable/column_builder.tsx:101](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/column_builder.tsx#L101)

## Methods

### setError

▸ **setError**(`e`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `e` | `Error` |

#### Returns

`void`

#### Defined in

[core/components/CollectionTable/column_builder.tsx:105](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/column_builder.tsx#L105)

___

### setSaved

▸ **setSaved**(`saved`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `saved` | `boolean` |

#### Returns

`void`

#### Defined in

[core/components/CollectionTable/column_builder.tsx:104](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/column_builder.tsx#L104)
