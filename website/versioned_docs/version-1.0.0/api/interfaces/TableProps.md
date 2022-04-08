---
id: "TableProps"
title: "Interface: TableProps<T>"
sidebar_label: "TableProps"
sidebar_position: 0
custom_edit_url: null
---

**`see`** Table

## Type parameters

| Name |
| :------ |
| `T` |

## Properties

### columns

• **columns**: [`TableColumn`](TableColumn)<`T`\>[]

Properties displayed in this collection. If this property is not set
every property is displayed, you can filter

#### Defined in

[core/components/Table/TableProps.tsx:18](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L18)

___

### data

• `Optional` **data**: `T`[]

Array of arbitrary data

#### Defined in

[core/components/Table/TableProps.tsx:12](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L12)

___

### emptyMessage

• `Optional` **emptyMessage**: `string`

Message displayed when there is no data

#### Defined in

[core/components/Table/TableProps.tsx:105](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L105)

___

### error

• `Optional` **error**: `Error`

If there is an error loading data you can pass it here so it gets
displayed instead of the content

#### Defined in

[core/components/Table/TableProps.tsx:100](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L100)

___

### filter

• `Optional` **filter**: [`TableFilterValues`](../types/TableFilterValues)<`any`\>

In case this table should have some filters set by default

#### Defined in

[core/components/Table/TableProps.tsx:77](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L77)

___

### frozenIdColumn

• `Optional` **frozenIdColumn**: `boolean`

Is the id column frozen to the left.

#### Defined in

[core/components/Table/TableProps.tsx:46](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L46)

___

### hoverRow

• `Optional` **hoverRow**: `boolean`

Should apply a different style when hovering

#### Defined in

[core/components/Table/TableProps.tsx:115](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L115)

___

### loading

• `Optional` **loading**: `boolean`

Is the table in a loading state

#### Defined in

[core/components/Table/TableProps.tsx:110](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L110)

___

### paginationEnabled

• **paginationEnabled**: `boolean`

If enabled, content is loaded in batch

#### Defined in

[core/components/Table/TableProps.tsx:32](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L32)

___

### size

• **size**: [`TableSize`](../types/TableSize)

Size of the table

#### Defined in

[core/components/Table/TableProps.tsx:72](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L72)

___

### sortBy

• `Optional` **sortBy**: [`string`, ``"asc"`` \| ``"desc"``]

Default sort applied to this collection

#### Defined in

[core/components/Table/TableProps.tsx:88](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L88)

## Methods

### checkFilterCombination

▸ `Optional` **checkFilterCombination**(`filterValues`, `sortBy?`): `boolean`

Set this callback if you want to support some combinations
of

#### Parameters

| Name | Type |
| :------ | :------ |
| `filterValues` | [`TableFilterValues`](../types/TableFilterValues)<`T`\> |
| `sortBy?` | [`string`, ``"asc"`` \| ``"desc"``] |

#### Returns

`boolean`

#### Defined in

[core/components/Table/TableProps.tsx:40](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L40)

___

### idColumnBuilder

▸ **idColumnBuilder**(`props`): `ReactNode`

Builder function for the column id

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.entry` | `T` |
| `props.size` | [`TableSize`](../types/TableSize) |

#### Returns

`ReactNode`

#### Defined in

[core/components/Table/TableProps.tsx:24](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L24)

___

### onColumnResize

▸ `Optional` **onColumnResize**(`params`): `void`

Callback when a column is resized

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`OnTableColumnResizeParams`](../types/OnTableColumnResizeParams)<`T`\> |

#### Returns

`void`

#### Defined in

[core/components/Table/TableProps.tsx:67](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L67)

___

### onEndReached

▸ `Optional` **onEndReached**(): `void`

A callback function when scrolling the table to near the end

#### Returns

`void`

#### Defined in

[core/components/Table/TableProps.tsx:51](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L51)

___

### onFilterUpdate

▸ `Optional` **onFilterUpdate**(`filter?`): `void`

Callback used when filters are updated

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter?` | [`TableFilterValues`](../types/TableFilterValues)<`any`\> |

#### Returns

`void`

#### Defined in

[core/components/Table/TableProps.tsx:83](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L83)

___

### onResetPagination

▸ `Optional` **onResetPagination**(): `void`

When the pagination should be reset. E.g. the filters or sorting
has been reset.

#### Returns

`void`

#### Defined in

[core/components/Table/TableProps.tsx:57](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L57)

___

### onRowClick

▸ `Optional` **onRowClick**(`props`): `void`

Callback when a row is clicked

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.event` | `SyntheticEvent`<`Element`, `Event`\> |
| `props.rowData` | `T` |
| `props.rowIndex` | `number` |
| `props.rowKey` | `string` |

#### Returns

`void`

#### Defined in

[core/components/Table/TableProps.tsx:62](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L62)

___

### onSortByUpdate

▸ `Optional` **onSortByUpdate**(`sortBy?`): `void`

Callback used when sorting is updated

#### Parameters

| Name | Type |
| :------ | :------ |
| `sortBy?` | [`string`, ``"asc"`` \| ``"desc"``] |

#### Returns

`void`

#### Defined in

[core/components/Table/TableProps.tsx:94](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/TableProps.tsx#L94)
