---
id: "CollectionTable"
title: "Variable: CollectionTable"
sidebar_label: "CollectionTable"
sidebar_position: 0
custom_edit_url: null
---

• `Const` **CollectionTable**: `FunctionComponent`<[`CollectionTableProps`](../interfaces/CollectionTableProps)<`any`, `any`\>\>

This component is in charge of rendering a collection table with a high
degree of customization. It is in charge of fetching data from
the [DataSource](../interfaces/DataSource) and holding the state of filtering and sorting.

This component is used internally by [EntityCollectionView](../functions/EntityCollectionView) and
[ReferenceDialog](../functions/ReferenceDialog)

Please note that you only need to use this component if you are building
a custom view. If you just need to create a default view you can do it
exclusively with config options.

If you want to bind a [EntityCollection](../interfaces/EntityCollection) to a table with the default
options you see in collections in the top level navigation, you can
check [EntityCollectionView](../functions/EntityCollectionView)

If you need a table that is not bound to the datasource or entities and
properties at all, you can check [Table](../functions/Table)

**`see`** CollectionTableProps

**`see`** EntityCollectionView

**`see`** Table

#### Defined in

[core/components/CollectionTable/CollectionTable.tsx:71](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTable.tsx#L71)
