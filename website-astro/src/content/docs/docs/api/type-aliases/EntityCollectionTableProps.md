---
slug: "docs/api/type-aliases/EntityCollectionTableProps"
title: "EntityCollectionTableProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityCollectionTableProps

# Type Alias: EntityCollectionTableProps\<M, USER\>

> **EntityCollectionTableProps**\<`M`, `USER`\> = `object`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:18](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](User) = [`User`](User)

## Properties

### actions?

> `optional` **actions**: `React.ReactNode`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:104](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

Additional component that renders actions such as buttons in the
collection toolbar, displayed on the right side

***

### actionsStart?

> `optional` **actionsStart**: `React.ReactNode`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:44](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

Additional component that renders actions such as buttons in the
collection toolbar, displayed on the left side

***

### AddColumnComponent?

> `optional` **AddColumnComponent**: `React.ComponentType`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:141](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### additionalFields?

> `optional` **additionalFields**: [`AdditionalFieldDelegate`](../interfaces/AdditionalFieldDelegate)\<`M`, `USER`\>[]

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:121](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### AdditionalHeaderWidget?

> `optional` **AdditionalHeaderWidget**: `React.ComponentType`\<\{ `onHover`: `boolean`; `property`: [`ResolvedProperty`](ResolvedProperty); `propertyKey`: `string`; \}\>

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:135](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### additionalIDHeaderWidget?

> `optional` **additionalIDHeaderWidget**: `React.ReactNode`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:143](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### className?

> `optional` **className**: `string`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:21](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### defaultSize?

> `optional` **defaultSize**: [`CollectionSize`](CollectionSize)

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:123](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### displayedColumnIds?

> `optional` **displayedColumnIds**: `PropertyColumnConfig`[]

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:113](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### emptyComponent?

> `optional` **emptyComponent**: `React.ReactNode`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:145](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### enablePopupIcon

> **enablePopupIcon**: `boolean`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:153](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### endAdornment?

> `optional` **endAdornment**: `React.ReactNode`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:133](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### filterable?

> `optional` **filterable**: `boolean`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:129](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### forceFilter?

> `optional` **forceFilter**: [`FilterValues`](FilterValues)\<`Extract`\<keyof `M`, `string`\>\>

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:115](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### getIdColumnWidth()?

> `optional` **getIdColumnWidth**: () => `number`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:147](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

#### Returns

`number`

***

### getPropertyFor()?

> `optional` **getPropertyFor**: (`props`) => [`ResolvedProperties`](ResolvedProperties)\<`M`\>\[`string`\]

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:127](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

#### Parameters

##### props

`GetPropertyForProps`\<`M`\>

#### Returns

[`ResolvedProperties`](ResolvedProperties)\<`M`\>\[`string`\]

***

### highlightedEntities?

> `optional` **highlightedEntities**: [`Entity`](../interfaces/Entity)\<`M`\>[]

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:33](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

List of entities that will be displayed as selected;

***

### hoverRow?

> `optional` **hoverRow**: `boolean`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:98](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

Should apply a different style to a row when hovering

***

### initialScroll?

> `optional` **initialScroll**: `number`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:78](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

Initial scroll position

***

### inlineEditing?

> `optional` **inlineEditing**: `boolean`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:119](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### onScroll()?

> `optional` **onScroll**: (`props`) => `void`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:84](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

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

### onTextSearchClick()?

> `optional` **onTextSearchClick**: () => `void`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:149](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

#### Returns

`void`

***

### onValueChange?

> `optional` **onValueChange**: [`OnCellValueChange`](OnCellValueChange)\<`any`, `M`\>

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:49](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

Callback when a cell value changes.

***

### openEntityMode?

> `optional` **openEntityMode**: `"side_panel"` \| `"full_screen"`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:155](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### properties

> **properties**: [`ResolvedProperties`](ResolvedProperties)\<`M`\>

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:125](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### selectionController

> **selectionController**: [`SelectionController`](SelectionController)\<`M`\>

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:28](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

Display these entities as selected

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:131](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### style?

> `optional` **style**: `React.CSSProperties`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:23](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### tableController

> **tableController**: [`EntityTableController`](EntityTableController)\<`M`\>

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:111](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

Controller holding the logic for the table
[useDataSourceTableController](../functions/useDataSourceTableController)
[EntityTableController](EntityTableController)

***

### tableRowActionsBuilder()?

> `optional` **tableRowActionsBuilder**: (`params`) => `React.ReactNode`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:58](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

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

***

### textSearchEnabled?

> `optional` **textSearchEnabled**: `boolean`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:117](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### textSearchLoading?

> `optional` **textSearchLoading**: `boolean`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:151](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

***

### title?

> `optional` **title**: `React.ReactNode`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:38](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

Override the title in the toolbar

***

### uniqueFieldValidator?

> `optional` **uniqueFieldValidator**: [`UniqueFieldValidator`](UniqueFieldValidator)

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:51](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

## Methods

### onColumnResize()?

> `optional` **onColumnResize**(`params`): `void`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:73](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

Callback when a column is resized

#### Parameters

##### params

[`OnColumnResizeParams`](OnColumnResizeParams)

#### Returns

`void`

***

### onEntityClick()?

> `optional` **onEntityClick**(`entity`): `void`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:68](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

Callback when anywhere on the table is clicked

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`void`

***

### onSizeChanged()?

> `optional` **onSizeChanged**(`size`): `void`

Defined in: [components/EntityCollectionTable/EntityCollectionTableProps.tsx:93](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTableProps.tsx)

Callback when the selected size of the table is changed

#### Parameters

##### size

[`CollectionSize`](CollectionSize)

#### Returns

`void`
