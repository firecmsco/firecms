---
slug: "docs/api/type-aliases/SelectableTableProps"
title: "SelectableTableProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SelectableTableProps

# Type Alias: SelectableTableProps\<M\>

> **SelectableTableProps**\<`M`\> = `object`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:23](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Properties

### AddColumnComponent?

> `optional` **AddColumnComponent**: `React.ComponentType`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:96](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

***

### cellRenderer

> **cellRenderer**: `React.ComponentType`\<[`CellRendererParams`](CellRendererParams)\<[`Entity`](../interfaces/Entity)\<`M`\>\>\>

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:32](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

***

### columns

> **columns**: [`VirtualTableColumn`](../interfaces/VirtualTableColumn)[]

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:30](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

***

### emptyComponent?

> `optional` **emptyComponent**: `React.ReactNode`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:92](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

***

### endAdornment?

> `optional` **endAdornment**: `React.ReactNode`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:94](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

***

### filterable?

> `optional` **filterable**: `boolean`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:68](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

***

### forceFilter?

> `optional` **forceFilter**: [`FilterValues`](FilterValues)\<keyof `M` *extends* `string` ? keyof `M` : `never`\>

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:74](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

***

### highlightedRow()?

> `optional` **highlightedRow**: (`data`) => `boolean`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:76](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

#### Parameters

##### data

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`boolean`

***

### hoverRow?

> `optional` **hoverRow**: `boolean`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:59](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

Should apply a different style to a row when hovering

***

### initialScroll?

> `optional` **initialScroll**: `number`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:80](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

***

### inlineEditing?

> `optional` **inlineEditing**: `boolean`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:72](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

***

### onColumnsOrderChange()?

> `optional` **onColumnsOrderChange**: (`columns`) => `void`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:101](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

Callback when columns are reordered via drag-and-drop

#### Parameters

##### columns

[`VirtualTableColumn`](../interfaces/VirtualTableColumn)[]

#### Returns

`void`

***

### onScroll()?

> `optional` **onScroll**: (`props`) => `void`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:86](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

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

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:28](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

Callback when a cell value changes.

***

### size?

> `optional` **size**: [`CollectionSize`](CollectionSize)

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:78](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:70](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

***

### tableController

> **tableController**: [`EntityTableController`](EntityTableController)\<`M`\>

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:66](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

Controller holding the logic for the table
[useDataTableController](../functions/useDataTableController)
[EntityTableController](EntityTableController)

***

### tableRowActionsBuilder()?

> `optional` **tableRowActionsBuilder**: (`params`) => `React.ReactNode`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:39](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

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

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:54](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

Callback when a column is resized

#### Parameters

##### params

[`OnColumnResizeParams`](OnColumnResizeParams)

#### Returns

`void`

***

### onEntityClick()?

> `optional` **onEntityClick**(`entity`): `void`

Defined in: [core/src/components/SelectableTable/SelectableTable.tsx:49](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/SelectableTable/SelectableTable.tsx)

Callback when anywhere on the table is clicked

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`void`
