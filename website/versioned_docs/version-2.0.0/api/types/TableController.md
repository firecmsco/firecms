---
id: "TableController"
title: "Type alias: TableController<M>"
sidebar_label: "TableController"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **TableController**\<`M`\>: `Object`

You can use this controller to control the table view of a collection.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `checkFilterCombination?` | (`filterValues`: [`FilterValues`](FilterValues.md)\<`any`\>, `sortBy?`: [`string`, ``"asc"`` \| ``"desc"``]) => `boolean` |
| `clearFilter?` | () => `void` |
| `data` | [`Entity`](../interfaces/Entity.md)\<`M`\>[] |
| `dataLoading` | `boolean` |
| `dataLoadingError?` | `Error` |
| `filterValues?` | [`FilterValues`](FilterValues.md)\<`Extract`\<keyof `M`, `string`\>\> |
| `itemCount?` | `number` |
| `noMoreToLoad` | `boolean` |
| `onAddColumn?` | (`column`: `string`) => `void` |
| `pageSize?` | `number` |
| `paginationEnabled?` | `boolean` |
| `popupCell?` | [`SelectedCellProps`](SelectedCellProps.md)\<`M`\> |
| `searchString?` | `string` |
| `setFilterValues?` | (`filterValues`: [`FilterValues`](FilterValues.md)\<`Extract`\<keyof `M`, `string`\>\>) => `void` |
| `setItemCount?` | (`itemCount`: `number`) => `void` |
| `setPopupCell?` | (`popupCell?`: [`SelectedCellProps`](SelectedCellProps.md)\<`M`\>) => `void` |
| `setSearchString?` | (`searchString?`: `string`) => `void` |
| `setSortBy?` | (`sortBy`: [`Extract`\<keyof `M`, `string`\>, ``"asc"`` \| ``"desc"``]) => `void` |
| `sortBy?` | [`Extract`\<keyof `M`, `string`\>, ``"asc"`` \| ``"desc"``] |

#### Defined in

[packages/firecms_core/src/types/collections.ts:484](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L484)
