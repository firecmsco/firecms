---
slug: "docs/api/type-aliases/EntityCollectionTableController"
title: "EntityCollectionTableController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityCollectionTableController

# Type Alias: EntityCollectionTableController\<M\>

> **EntityCollectionTableController**\<`M`\> = `object`

Defined in: [components/common/types.tsx:3](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Properties

### onValueChange()?

> `optional` **onValueChange**: (`params`) => `void`

Defined in: [components/common/types.tsx:23](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)

Callback used when the value of a cell has changed.

#### Parameters

##### params

[`OnCellValueChangeParams`](../interfaces/OnCellValueChangeParams)\<`any`, `M`\>

#### Returns

`void`

***

### select()

> **select**: (`cell?`) => `void`

Defined in: [components/common/types.tsx:13](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)

Select a table cell

#### Parameters

##### cell?

[`SelectedCellProps`](SelectedCellProps)\<`M`\>

#### Returns

`void`

***

### selectedCell?

> `optional` **selectedCell**: [`SelectedCellProps`](SelectedCellProps)\<`any`\>

Defined in: [components/common/types.tsx:8](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)

This cell is displayed as selected

***

### setPopupCell()?

> `optional` **setPopupCell**: (`cell?`) => `void`

Defined in: [components/common/types.tsx:18](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)

The cell that is displayed as a popup view.

#### Parameters

##### cell?

[`SelectedCellProps`](SelectedCellProps)\<`M`\>

#### Returns

`void`

***

### size

> **size**: [`CollectionSize`](CollectionSize)

Defined in: [components/common/types.tsx:27](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)

Size of the elements in the collection
