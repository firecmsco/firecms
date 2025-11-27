---
slug: "docs/api/interfaces/VirtualTableProps"
title: "VirtualTableProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / VirtualTableProps

# Interface: VirtualTableProps\<T\>

Defined in: [components/VirtualTable/VirtualTableProps.tsx:15](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

## See

Table

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `any`\>

## Properties

### AddColumnComponent?

> `optional` **AddColumnComponent**: `ComponentType`\<\{ \}\>

Defined in: [components/VirtualTable/VirtualTableProps.tsx:158](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

If adding this callback, a button to add a new column is displayed.

#### Param

***

### cellRenderer

> **cellRenderer**: `ComponentType`\<[`CellRendererParams`](../type-aliases/CellRendererParams)\<`T`\>\>

Defined in: [components/VirtualTable/VirtualTableProps.tsx:32](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Custom cell renderer
The renderer receives props `{ cellData, columns, column, columnIndex, rowData, rowIndex, container, isScrolling }`

***

### checkFilterCombination()?

> `optional` **checkFilterCombination**: (`filterValues`, `sortBy?`) => `boolean`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:40](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Set this callback if you want to support some combinations
of filter combinations only.

#### Parameters

##### filterValues

[`VirtualTableFilterValues`](../type-aliases/VirtualTableFilterValues)\<`Extract`\<keyof `T`, `string`\>\>

##### sortBy?

\[`string`, `"desc"` \| `"asc"`\]

#### Returns

`boolean`

***

### className?

> `optional` **className**: `string`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:142](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Class name applied to the table

***

### columns

> **columns**: [`VirtualTableColumn`](VirtualTableColumn)\<`any`\>[]

Defined in: [components/VirtualTable/VirtualTableProps.tsx:26](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Properties displayed in this collection. If this property is not set
every property is displayed, you can filter

***

### createFilterField()?

> `optional` **createFilterField**: (`props`) => `ReactNode`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:137](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Callback to create a filter field, displayed in the header as a dropdown

#### Parameters

##### props

`FilterFormFieldProps`\<`any`\>

#### Returns

`ReactNode`

***

### data?

> `optional` **data**: `T`[]

Defined in: [components/VirtualTable/VirtualTableProps.tsx:20](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Array of arbitrary data

***

### emptyComponent?

> `optional` **emptyComponent**: `ReactNode`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:115](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Message displayed when there is no data

***

### endAdornment?

> `optional` **endAdornment**: `ReactNode`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:152](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Component rendered at the end of the table, after scroll

***

### endOffset?

> `optional` **endOffset**: `number`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:51](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Offset in pixels where the onEndReached callback is triggered

***

### error?

> `optional` **error**: `Error`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:110](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

If there is an error loading data you can pass it here, so it gets
displayed instead of the content

***

### filter?

> `optional` **filter**: `Partial`\<`Record`\<`any`, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [components/VirtualTable/VirtualTableProps.tsx:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

In case this table should have some filters set by default

***

### hoverRow?

> `optional` **hoverRow**: `boolean`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:125](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Should apply a different style when hovering

***

### initialScroll?

> `optional` **initialScroll**: `number`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:163](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Initial scroll position

***

### loading?

> `optional` **loading**: `boolean`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:120](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Is the table in a loading state

***

### onColumnResize()?

> `optional` **onColumnResize**: (`params`) => `void`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:67](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Callback when a column is resized

#### Parameters

##### params

[`OnVirtualTableColumnResizeParams`](../type-aliases/OnVirtualTableColumnResizeParams)

#### Returns

`void`

***

### onEndReached()?

> `optional` **onEndReached**: () => `void`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:46](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

A callback function when scrolling the table to near the end

#### Returns

`void`

***

### onFilterUpdate()?

> `optional` **onFilterUpdate**: (`filter?`) => `void`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:83](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Callback used when filters are updated

#### Parameters

##### filter?

`Partial`\<`Record`\<`any`, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

#### Returns

`void`

***

### onResetPagination()?

> `optional` **onResetPagination**: () => `void`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:57](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

When the pagination should be reset. E.g. the filters or sorting
has been reset.

#### Returns

`void`

***

### onRowClick()?

> `optional` **onRowClick**: (`props`) => `void`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:62](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Callback when a row is clicked

#### Parameters

##### props

[`OnRowClickParams`](../type-aliases/OnRowClickParams)\<`T`\>

#### Returns

`void`

***

### onScroll()?

> `optional` **onScroll**: (`props`) => `void`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:89](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Callback when the table is scrolled

#### Parameters

##### props

###### scrollDirection

`"forward"` \| `"backward"`

###### scrollOffset

`number`

###### scrollUpdateWasRequested

`boolean`

#### Returns

`void`

***

### onSortByUpdate()?

> `optional` **onSortByUpdate**: (`sortBy?`) => `void`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:104](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Callback used when sorting is updated

#### Parameters

##### sortBy?

\[`string`, `"desc"` \| `"asc"`\]

#### Returns

`void`

***

### rowClassName()?

> `optional` **rowClassName**: (`rowData`) => `string` \| `undefined`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:131](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Apply a custom class name to the row

#### Parameters

##### rowData

`T`

#### Returns

`string` \| `undefined`

***

### rowHeight?

> `optional` **rowHeight**: `number`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:72](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Size of the table

***

### sortBy?

> `optional` **sortBy**: \[`string`, `"desc"` \| `"asc"`\]

Defined in: [components/VirtualTable/VirtualTableProps.tsx:98](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Default sort applied to this collection

***

### style?

> `optional` **style**: `CSSProperties`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:147](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Style applied to the table
