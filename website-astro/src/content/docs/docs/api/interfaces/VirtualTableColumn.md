---
slug: "docs/api/interfaces/VirtualTableColumn"
title: "VirtualTableColumn"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / VirtualTableColumn

# Interface: VirtualTableColumn\<CustomProps\>

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:196](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

## See

Table

## Type Parameters

### CustomProps

`CustomProps` = `any`

## Properties

### AdditionalHeaderWidget()?

> `optional` **AdditionalHeaderWidget**: (`props`) => `ReactNode`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:257](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

Additional children to be rendered in the header when hovering

#### Parameters

##### props

###### onHover

`boolean`

#### Returns

`ReactNode`

***

### align?

> `optional` **align**: `"center"` \| `"left"` \| `"right"`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:237](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

Alignment of the column cell

***

### custom?

> `optional` **custom**: `CustomProps`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:252](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

Custom props passed to the cell renderer

***

### filter?

> `optional` **filter**: `boolean`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:231](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

***

### frozen?

> `optional` **frozen**: `boolean`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:216](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

This column is frozen to the left

***

### headerAlign?

> `optional` **headerAlign**: `"center"` \| `"left"` \| `"right"`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:221](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

How is the

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:226](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

Icon displayed in the header

***

### key

> **key**: `string`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:201](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

Data key for the cell value, could be "a.b.c"

***

### resizable?

> `optional` **resizable**: `boolean`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:247](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

Can it be resized

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:242](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

Whether the column is sortable, defaults to false

***

### title?

> `optional` **title**: `string`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:211](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

Label displayed in the header

***

### width

> **width**: `number`

Defined in: [core/src/components/VirtualTable/VirtualTableProps.tsx:206](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/VirtualTable/VirtualTableProps.tsx)

The width of the column, gutter width is not included
