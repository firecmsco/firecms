---
slug: "docs/api/interfaces/VirtualTableColumn"
title: "VirtualTableColumn"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / VirtualTableColumn

# Interface: VirtualTableColumn\<CustomProps\>

Defined in: [components/VirtualTable/VirtualTableProps.tsx:181](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

## See

Table

## Type Parameters

### CustomProps

`CustomProps` = `any`

## Properties

### AdditionalHeaderWidget()?

> `optional` **AdditionalHeaderWidget**: (`props`) => `ReactNode`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:242](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

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

Defined in: [components/VirtualTable/VirtualTableProps.tsx:222](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Alignment of the column cell

***

### custom?

> `optional` **custom**: `CustomProps`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:237](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Custom props passed to the cell renderer

***

### filter?

> `optional` **filter**: `boolean`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:216](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

***

### frozen?

> `optional` **frozen**: `boolean`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:201](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

This column is frozen to the left

***

### headerAlign?

> `optional` **headerAlign**: `"center"` \| `"left"` \| `"right"`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:206](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

How is the

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:211](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Icon displayed in the header

***

### key

> **key**: `string`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:186](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Data key for the cell value, could be "a.b.c"

***

### resizable?

> `optional` **resizable**: `boolean`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:232](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Can it be resized

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:227](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Whether the column is sortable, defaults to false

***

### title?

> `optional` **title**: `string`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:196](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

Label displayed in the header

***

### width

> **width**: `number`

Defined in: [components/VirtualTable/VirtualTableProps.tsx:191](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/VirtualTable/VirtualTableProps.tsx)

The width of the column, gutter width is not included
