---
id: "EntityCollectionTable"
title: "Function: EntityCollectionTable"
sidebar_label: "EntityCollectionTable"
sidebar_position: 0
custom_edit_url: null
---

▸ **EntityCollectionTable**(`props`): `ReactNode`

This component is in charge of rendering a collection table with a high
degree of customization. It is in charge of fetching data from
the [DataSource](../interfaces/DataSource.md) and holding the state of filtering and sorting.

This component is used internally by [EntityCollectionView](EntityCollectionView.md) and
[useReferenceDialog](useReferenceDialog.md)

Please note that you only need to use this component if you are building
a custom view. If you just need to create a default view you can do it
exclusively with config options.

If you want to bind a [EntityCollection](../interfaces/EntityCollection.md) to a table with the default
options you see in collections in the top level navigation, you can
check [EntityCollectionView](EntityCollectionView.md)

If you need a table that is not bound to the datasource or entities and
properties at all, you can check [VirtualTable](VirtualTable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`EntityCollectionTableProps`](../types/EntityCollectionTableProps.md)\<`any`\> |

#### Returns

`ReactNode`

**`See`**

 - EntityCollectionTableProps
 - EntityCollectionView
 - VirtualTable

#### Defined in

node_modules/@types/react/index.d.ts:395
