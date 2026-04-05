---
slug: "docs/api/type-aliases/EntityTableController"
title: "EntityTableController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityTableController

# Type Alias: EntityTableController\<M\>

> **EntityTableController**\<`M`\> = `object`

Defined in: [types/src/types/collections.ts:730](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

You can use this controller to control the table view of a collection.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### checkFilterCombination()?

> `optional` **checkFilterCombination**: (`filterValues`, `sortBy?`) => `boolean`

Defined in: [types/src/types/collections.ts:752](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

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

Defined in: [types/src/types/collections.ts:741](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

#### Returns

`void`

***

### data

> **data**: [`Entity`](../interfaces/Entity)\<`M`\>[]

Defined in: [types/src/types/collections.ts:731](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### dataLoading

> **dataLoading**: `boolean`

Defined in: [types/src/types/collections.ts:732](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### dataLoadingError?

> `optional` **dataLoadingError**: `Error`

Defined in: [types/src/types/collections.ts:734](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### filterValues?

> `optional` **filterValues**: [`FilterValues`](FilterValues)\<`Extract`\<keyof `M`, `string`\>\>

Defined in: [types/src/types/collections.ts:735](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### initialScroll?

> `optional` **initialScroll**: `number`

Defined in: [types/src/types/collections.ts:744](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### itemCount?

> `optional` **itemCount**: `number`

Defined in: [types/src/types/collections.ts:742](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### noMoreToLoad

> **noMoreToLoad**: `boolean`

Defined in: [types/src/types/collections.ts:733](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### onAddColumn()?

> `optional` **onAddColumn**: (`column`) => `void`

Defined in: [types/src/types/collections.ts:757](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

#### Parameters

##### column

`string`

#### Returns

`void`

***

### onScroll()?

> `optional` **onScroll**: (`props`) => `void`

Defined in: [types/src/types/collections.ts:745](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

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

Defined in: [types/src/types/collections.ts:751](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### paginationEnabled?

> `optional` **paginationEnabled**: `boolean`

Defined in: [types/src/types/collections.ts:750](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### popupCell?

> `optional` **popupCell**: [`SelectedCellProps`](SelectedCellProps)\<`M`\>

Defined in: [types/src/types/collections.ts:754](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### searchString?

> `optional` **searchString**: `string`

Defined in: [types/src/types/collections.ts:739](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### setFilterValues()?

> `optional` **setFilterValues**: (`filterValues`) => `void`

Defined in: [types/src/types/collections.ts:736](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

#### Parameters

##### filterValues

[`FilterValues`](FilterValues)\<`Extract`\<keyof `M`, `string`\>\>

#### Returns

`void`

***

### setItemCount()?

> `optional` **setItemCount**: (`itemCount`) => `void`

Defined in: [types/src/types/collections.ts:743](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

#### Parameters

##### itemCount

`number`

#### Returns

`void`

***

### setPopupCell()?

> `optional` **setPopupCell**: (`popupCell?`) => `void`

Defined in: [types/src/types/collections.ts:755](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

#### Parameters

##### popupCell?

[`SelectedCellProps`](SelectedCellProps)\<`M`\>

#### Returns

`void`

***

### setSearchString()?

> `optional` **setSearchString**: (`searchString?`) => `void`

Defined in: [types/src/types/collections.ts:740](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

#### Parameters

##### searchString?

`string`

#### Returns

`void`

***

### setSortBy()?

> `optional` **setSortBy**: (`sortBy?`) => `void`

Defined in: [types/src/types/collections.ts:738](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

#### Parameters

##### sortBy?

\[`Extract`\<keyof `M`, `string`\>, `"asc"` \| `"desc"`\]

#### Returns

`void`

***

### sortBy?

> `optional` **sortBy**: \[`Extract`\<keyof `M`, `string`\>, `"asc"` \| `"desc"`\]

Defined in: [types/src/types/collections.ts:737](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)
