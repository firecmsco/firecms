---
slug: "docs/api/type-aliases/SelectableTableProps"
title: "SelectableTableProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / SelectableTableProps

# Type Alias: SelectableTableProps\<M\>

> **SelectableTableProps**\<`M`\> = `object`

Defined in: [components/SelectableTable/SelectableTable.tsx:22](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Properties

### AddColumnComponent?

> `optional` **AddColumnComponent**: `React.ComponentType`

Defined in: [components/SelectableTable/SelectableTable.tsx:95](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

***

### cellRenderer

> **cellRenderer**: `React.ComponentType`\<[`CellRendererParams`](CellRendererParams)\<[`Entity`](../interfaces/Entity)\<`M`\>\>\>

Defined in: [components/SelectableTable/SelectableTable.tsx:31](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

***

### columns

> **columns**: [`VirtualTableColumn`](../interfaces/VirtualTableColumn)[]

Defined in: [components/SelectableTable/SelectableTable.tsx:29](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

***

### emptyComponent?

> `optional` **emptyComponent**: `React.ReactNode`

Defined in: [components/SelectableTable/SelectableTable.tsx:91](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

***

### endAdornment?

> `optional` **endAdornment**: `React.ReactNode`

Defined in: [components/SelectableTable/SelectableTable.tsx:93](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

***

### filterable?

> `optional` **filterable**: `boolean`

Defined in: [components/SelectableTable/SelectableTable.tsx:67](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

***

### forceFilter?

> `optional` **forceFilter**: [`FilterValues`](FilterValues)\<keyof `M` *extends* `string` ? keyof `M` : `never`\>

Defined in: [components/SelectableTable/SelectableTable.tsx:73](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

***

### highlightedRow()?

> `optional` **highlightedRow**: (`data`) => `boolean`

Defined in: [components/SelectableTable/SelectableTable.tsx:75](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

#### Parameters

##### data

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`boolean`

***

### hoverRow?

> `optional` **hoverRow**: `boolean`

Defined in: [components/SelectableTable/SelectableTable.tsx:58](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

Should apply a different style to a row when hovering

***

### initialScroll?

> `optional` **initialScroll**: `number`

Defined in: [components/SelectableTable/SelectableTable.tsx:79](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

***

### inlineEditing?

> `optional` **inlineEditing**: `boolean`

Defined in: [components/SelectableTable/SelectableTable.tsx:71](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

***

### onScroll()?

> `optional` **onScroll**: (`props`) => `void`

Defined in: [components/SelectableTable/SelectableTable.tsx:85](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

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

### onValueChange?

> `optional` **onValueChange**: [`OnCellValueChange`](OnCellValueChange)\<`any`, `M`\>

Defined in: [components/SelectableTable/SelectableTable.tsx:27](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

Callback when a cell value changes.

***

### size?

> `optional` **size**: [`CollectionSize`](CollectionSize)

Defined in: [components/SelectableTable/SelectableTable.tsx:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [components/SelectableTable/SelectableTable.tsx:69](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

***

### tableController

> **tableController**: [`EntityTableController`](EntityTableController)\<`M`\>

Defined in: [components/SelectableTable/SelectableTable.tsx:65](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

Controller holding the logic for the table
[useDataSourceTableController](../functions/useDataSourceTableController)
[EntityTableController](EntityTableController)

***

### tableRowActionsBuilder()?

> `optional` **tableRowActionsBuilder**: (`params`) => `React.ReactNode`

Defined in: [components/SelectableTable/SelectableTable.tsx:38](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

Builder for creating the buttons in each row

#### Parameters

##### params

###### entity

[`Entity`](../interfaces/Entity)\<`M`\>

###### frozen?

`boolean`

###### size

[`CollectionSize`](CollectionSize)

###### width

`number`

#### Returns

`React.ReactNode`

## Methods

### onColumnResize()?

> `optional` **onColumnResize**(`params`): `void`

Defined in: [components/SelectableTable/SelectableTable.tsx:53](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

Callback when a column is resized

#### Parameters

##### params

[`OnColumnResizeParams`](OnColumnResizeParams)

#### Returns

`void`

***

### onEntityClick()?

> `optional` **onEntityClick**(`entity`): `void`

Defined in: [components/SelectableTable/SelectableTable.tsx:48](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

Callback when anywhere on the table is clicked

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`void`
