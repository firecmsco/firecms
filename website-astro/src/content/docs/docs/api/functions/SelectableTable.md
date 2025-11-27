---
slug: "docs/api/functions/SelectableTable"
title: "SelectableTable"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / SelectableTable

# Function: SelectableTable()

> **SelectableTable**\<`M`\>(`__namedParameters`): `Element`

Defined in: [components/SelectableTable/SelectableTable.tsx:122](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/SelectableTable/SelectableTable.tsx)

This component is in charge of rendering a collection table with a high
degree of customization.

This component is used internally by [EntityCollectionView](../variables/EntityCollectionView) and
[useReferenceDialog](useReferenceDialog)

Please note that you only need to use this component if you are building
a custom view. If you just need to create a default view you can do it
exclusively with config options.

If you want to bind a [EntityCollection](../interfaces/EntityCollection) to a table with the default
options you see in collections in the top level navigation, you can
check [EntityCollectionView](../variables/EntityCollectionView).

The data displayed in the table is managed by a [EntityTableController](../type-aliases/EntityTableController).
You can build the default, bound to a path in the datasource, by using the hook
[useDataSourceTableController](useDataSourceTableController)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### \_\_namedParameters

[`SelectableTableProps`](../type-aliases/SelectableTableProps)\<`M`\>

## Returns

`Element`

## See

 - EntityCollectionTableProps
 - EntityCollectionView
 - VirtualTable
