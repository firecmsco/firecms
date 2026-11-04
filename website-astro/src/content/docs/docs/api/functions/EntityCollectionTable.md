---
slug: "docs/api/functions/EntityCollectionTable"
title: "EntityCollectionTable"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / EntityCollectionTable

# Function: EntityCollectionTable()

> **EntityCollectionTable**\<`M`, `USER`\>(`__namedParameters`): `Element`

Defined in: [components/EntityCollectionTable/EntityCollectionTable.tsx:44](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionTable.tsx)

This component is in charge of rendering a collection table with a high
degree of customization.

This component is used internally by [EntityCollectionView](/docs/api/variables/EntityCollectionView) and
[useReferenceDialog](/docs/api/functions/useReferenceDialog)

Please note that you only need to use this component if you are building
a custom view. If you just need to create a default view you can do it
exclusively with config options.

If you want to bind a [EntityCollection](/docs/api/interfaces/EntityCollection) to a table with the default
options you see in collections in the top level navigation, you can
check [EntityCollectionView](/docs/api/variables/EntityCollectionView).

The data displayed in the table is managed by a [EntityTableController](/docs/api/type-aliases/EntityTableController).
You can build the default, bound to a path in the datasource, by using the hook
[useDataSourceTableController](/docs/api/functions/useDataSourceTableController)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User) = `any`

## Parameters

### \_\_namedParameters

[`EntityCollectionTableProps`](/docs/api/type-aliases/EntityCollectionTableProps)\<`M`\>

## Returns

`Element`

## See

 - EntityCollectionTableProps
 - EntityCollectionView
 - VirtualTable
