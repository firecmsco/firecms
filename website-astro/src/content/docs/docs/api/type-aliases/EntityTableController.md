---
slug: "docs/api/type-aliases/EntityTableController"
title: "EntityTableController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityTableController

# Type Alias: EntityTableController\<M\>

> **EntityTableController**\<`M`\> = `object`

Defined in: [types/collections.ts:627](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

You can use this controller to control the table view of a collection.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### checkFilterCombination()?

> `optional` **checkFilterCombination**: (`filterValues`, `sortBy?`) => `boolean`

Defined in: [types/collections.ts:649](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Parameters

##### filterValues

[`FilterValues`](FilterValues)\<`any`\>

##### sortBy?

\[`string`, `"asc"` \| `"desc"`\]

#### Returns

`boolean`

***

### clearFilter()?

> `optional` **clearFilter**: () => `void`

Defined in: [types/collections.ts:638](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Returns

`void`

***

### data

> **data**: [`Entity`](../interfaces/Entity)\<`M`\>[]

Defined in: [types/collections.ts:628](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### dataLoading

> **dataLoading**: `boolean`

Defined in: [types/collections.ts:629](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### dataLoadingError?

> `optional` **dataLoadingError**: `Error`

Defined in: [types/collections.ts:631](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### filterValues?

> `optional` **filterValues**: [`FilterValues`](FilterValues)\<`Extract`\<keyof `M`, `string`\>\>

Defined in: [types/collections.ts:632](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### initialScroll?

> `optional` **initialScroll**: `number`

Defined in: [types/collections.ts:641](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### itemCount?

> `optional` **itemCount**: `number`

Defined in: [types/collections.ts:639](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### noMoreToLoad

> **noMoreToLoad**: `boolean`

Defined in: [types/collections.ts:630](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### onAddColumn()?

> `optional` **onAddColumn**: (`column`) => `void`

Defined in: [types/collections.ts:654](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Parameters

##### column

`string`

#### Returns

`void`

***

### onScroll()?

> `optional` **onScroll**: (`props`) => `void`

Defined in: [types/collections.ts:642](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

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

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [types/collections.ts:648](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### paginationEnabled?

> `optional` **paginationEnabled**: `boolean`

Defined in: [types/collections.ts:647](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### popupCell?

> `optional` **popupCell**: [`SelectedCellProps`](SelectedCellProps)\<`M`\>

Defined in: [types/collections.ts:651](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### searchString?

> `optional` **searchString**: `string`

Defined in: [types/collections.ts:636](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### setFilterValues()?

> `optional` **setFilterValues**: (`filterValues`) => `void`

Defined in: [types/collections.ts:633](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Parameters

##### filterValues

[`FilterValues`](FilterValues)\<`Extract`\<keyof `M`, `string`\>\>

#### Returns

`void`

***

### setItemCount()?

> `optional` **setItemCount**: (`itemCount`) => `void`

Defined in: [types/collections.ts:640](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Parameters

##### itemCount

`number`

#### Returns

`void`

***

### setPopupCell()?

> `optional` **setPopupCell**: (`popupCell?`) => `void`

Defined in: [types/collections.ts:652](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Parameters

##### popupCell?

[`SelectedCellProps`](SelectedCellProps)\<`M`\>

#### Returns

`void`

***

### setSearchString()?

> `optional` **setSearchString**: (`searchString?`) => `void`

Defined in: [types/collections.ts:637](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Parameters

##### searchString?

`string`

#### Returns

`void`

***

### setSortBy()?

> `optional` **setSortBy**: (`sortBy?`) => `void`

Defined in: [types/collections.ts:635](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

#### Parameters

##### sortBy?

\[`Extract`\<keyof `M`, `string`\>, `"asc"` \| `"desc"`\]

#### Returns

`void`

***

### sortBy?

> `optional` **sortBy**: \[`Extract`\<keyof `M`, `string`\>, `"asc"` \| `"desc"`\]

Defined in: [types/collections.ts:634](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)
