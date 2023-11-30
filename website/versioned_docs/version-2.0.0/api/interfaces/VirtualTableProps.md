---
id: "VirtualTableProps"
title: "Interface: VirtualTableProps<T>"
sidebar_label: "VirtualTableProps"
sidebar_position: 0
custom_edit_url: null
---

**`See`**

Table

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, `any`\> |

## Properties

### AddColumnComponent

• `Optional` **AddColumnComponent**: `ComponentType`\<{}\>

If adding this callback, a button to add a new column is displayed.

**`Param`**

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:143](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L143)

___

### cellRenderer

• **cellRenderer**: (`params`: [`CellRendererParams`](../types/CellRendererParams.md)\<`T`\>) => `ReactNode`

#### Type declaration

▸ (`params`): `ReactNode`

Custom cell renderer
The renderer receives props `{ cellData, columns, column, columnIndex, rowData, rowIndex, container, isScrolling }`

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`CellRendererParams`](../types/CellRendererParams.md)\<`T`\> |

##### Returns

`ReactNode`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:32](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L32)

___

### checkFilterCombination

• `Optional` **checkFilterCombination**: (`filterValues`: `Partial`\<`Record`\<`Extract`\<keyof `T`, `string`\>, [[`WhereFilterOp`](../types/WhereFilterOp.md), `any`]\>\>, `sortBy?`: [`string`, ``"desc"`` \| ``"asc"``]) => `boolean`

#### Type declaration

▸ (`filterValues`, `sortBy?`): `boolean`

Set this callback if you want to support some combinations
of filter combinations only.

##### Parameters

| Name | Type |
| :------ | :------ |
| `filterValues` | `Partial`\<`Record`\<`Extract`\<keyof `T`, `string`\>, [[`WhereFilterOp`](../types/WhereFilterOp.md), `any`]\>\> |
| `sortBy?` | [`string`, ``"desc"`` \| ``"asc"``] |

##### Returns

`boolean`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:45](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L45)

___

### className

• `Optional` **className**: `string`

Class name applied to the table

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:132](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L132)

___

### columns

• **columns**: [`VirtualTableColumn`](VirtualTableColumn.md)\<`any`\>[]

Properties displayed in this collection. If this property is not set
every property is displayed, you can filter

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:26](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L26)

___

### createFilterField

• `Optional` **createFilterField**: (`props`: `FilterFormFieldProps`\<`any`\>) => `ReactNode`

#### Type declaration

▸ (`props`): `ReactNode`

Callback to create a filter field, displayed in the header as a dropdown

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `FilterFormFieldProps`\<`any`\> |

##### Returns

`ReactNode`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:127](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L127)

___

### data

• `Optional` **data**: `T`[]

Array of arbitrary data

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:20](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L20)

___

### emptyComponent

• `Optional` **emptyComponent**: `ReactNode`

Message displayed when there is no data

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:105](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L105)

___

### endAdornment

• `Optional` **endAdornment**: `ReactNode`

Component rendered at the end of the table, after scroll

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:137](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L137)

___

### error

• `Optional` **error**: `Error`

If there is an error loading data you can pass it here, so it gets
displayed instead of the content

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:100](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L100)

___

### filter

• `Optional` **filter**: `Partial`\<`Record`\<`any`, [[`WhereFilterOp`](../types/WhereFilterOp.md), `any`]\>\>

In case this table should have some filters set by default

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:77](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L77)

___

### hoverRow

• `Optional` **hoverRow**: `boolean`

Should apply a different style when hovering

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:115](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L115)

___

### loading

• `Optional` **loading**: `boolean`

Is the table in a loading state

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:110](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L110)

___

### onColumnResize

• `Optional` **onColumnResize**: (`params`: [`OnVirtualTableColumnResizeParams`](../types/OnVirtualTableColumnResizeParams.md)) => `void`

#### Type declaration

▸ (`params`): `void`

Callback when a column is resized

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`OnVirtualTableColumnResizeParams`](../types/OnVirtualTableColumnResizeParams.md) |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:67](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L67)

___

### onEndReached

• `Optional` **onEndReached**: () => `void`

#### Type declaration

▸ (): `void`

A callback function when scrolling the table to near the end

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:51](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L51)

___

### onFilterUpdate

• `Optional` **onFilterUpdate**: (`filter?`: `Partial`\<`Record`\<`any`, [[`WhereFilterOp`](../types/WhereFilterOp.md), `any`]\>\>) => `void`

#### Type declaration

▸ (`filter?`): `void`

Callback used when filters are updated

##### Parameters

| Name | Type |
| :------ | :------ |
| `filter?` | `Partial`\<`Record`\<`any`, [[`WhereFilterOp`](../types/WhereFilterOp.md), `any`]\>\> |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:83](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L83)

___

### onResetPagination

• `Optional` **onResetPagination**: () => `void`

#### Type declaration

▸ (): `void`

When the pagination should be reset. E.g. the filters or sorting
has been reset.

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:57](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L57)

___

### onRowClick

• `Optional` **onRowClick**: (`props`: [`OnRowClickParams`](../types/OnRowClickParams.md)\<`T`\>) => `void`

#### Type declaration

▸ (`props`): `void`

Callback when a row is clicked

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`OnRowClickParams`](../types/OnRowClickParams.md)\<`T`\> |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:62](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L62)

___

### onSortByUpdate

• `Optional` **onSortByUpdate**: (`sortBy?`: [`string`, ``"desc"`` \| ``"asc"``]) => `void`

#### Type declaration

▸ (`sortBy?`): `void`

Callback used when sorting is updated

##### Parameters

| Name | Type |
| :------ | :------ |
| `sortBy?` | [`string`, ``"desc"`` \| ``"asc"``] |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:94](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L94)

___

### paginationEnabled

• `Optional` **paginationEnabled**: `boolean`

If enabled, content is loaded in batch

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:37](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L37)

___

### rowClassName

• `Optional` **rowClassName**: (`rowData`: `T`) => `undefined` \| `string`

#### Type declaration

▸ (`rowData`): `undefined` \| `string`

Apply a custom class name to the row

##### Parameters

| Name | Type |
| :------ | :------ |
| `rowData` | `T` |

##### Returns

`undefined` \| `string`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:121](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L121)

___

### size

• `Optional` **size**: [`VirtualTableSize`](../types/VirtualTableSize.md)

Size of the table

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:72](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L72)

___

### sortBy

• `Optional` **sortBy**: [`string`, ``"desc"`` \| ``"asc"``]

Default sort applied to this collection

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:88](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L88)
