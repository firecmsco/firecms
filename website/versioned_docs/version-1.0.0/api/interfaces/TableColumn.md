---
id: "TableColumn"
title: "Interface: TableColumn<T>"
sidebar_label: "TableColumn"
sidebar_position: 0
custom_edit_url: null
---

**`see`** Table

## Type parameters

| Name |
| :------ |
| `T` |

## Properties

### align

• **align**: ``"right"`` \| ``"left"`` \| ``"center"``

#### Defined in

[core/components/Table/TableProps.tsx:138](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L138)

___

### filter

• `Optional` **filter**: [`TableColumnFilter`](../types/TableColumnFilter)

#### Defined in

[core/components/Table/TableProps.tsx:141](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L141)

___

### key

• **key**: `string`

#### Defined in

[core/components/Table/TableProps.tsx:135](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L135)

___

### label

• **label**: `string`

#### Defined in

[core/components/Table/TableProps.tsx:136](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L136)

___

### sortable

• **sortable**: `boolean`

#### Defined in

[core/components/Table/TableProps.tsx:139](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L139)

___

### width

• **width**: `number`

#### Defined in

[core/components/Table/TableProps.tsx:140](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L140)

## Methods

### cellRenderer

▸ **cellRenderer**(`props`): `ReactNode`

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.column` | [`TableColumn`](TableColumn)<`T`\> |
| `props.columnIndex` | `number` |
| `props.columns` | [`TableColumn`](TableColumn)<`T`\>[] |
| `props.isScrolling?` | `boolean` |
| `props.rowData` | `any` |
| `props.rowIndex` | `number` |

#### Returns

`ReactNode`

#### Defined in

[core/components/Table/TableProps.tsx:142](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L142)

___

### icon

▸ `Optional` **icon**(`hoverOrOpen`): `ReactNode`

#### Parameters

| Name | Type |
| :------ | :------ |
| `hoverOrOpen` | `boolean` |

#### Returns

`ReactNode`

#### Defined in

[core/components/Table/TableProps.tsx:137](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L137)
