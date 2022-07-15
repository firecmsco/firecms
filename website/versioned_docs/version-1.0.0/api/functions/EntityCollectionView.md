---
id: "EntityCollectionView"
title: "Function: EntityCollectionView"
sidebar_label: "EntityCollectionView"
sidebar_position: 0
custom_edit_url: null
---

▸ **EntityCollectionView**<`M`\>(`__namedParameters`): `Element`

This component is in charge of binding a datasource path with an [EntityCollection](../interfaces/EntityCollection)
where it's configuration is defined. It includes an infinite scrolling table,
'Add' new entities button,

This component is the default one used for displaying entity collections
and is in charge of generating all the specific actions and customization
of the lower level [CollectionTable](../variables/CollectionTable)

Please **note** that you only need to use this component if you are building
a custom view. If you just need to create a default view you can do it
exclusively with config options.

If you need a lower level implementation with more granular options, you
can use [CollectionTable](../variables/CollectionTable).

If you need a table that is not bound to the datasource or entities and
properties at all, you can check [Table](Table)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`EntityCollectionViewProps`](../interfaces/EntityCollectionViewProps)<`M`\> |

#### Returns

`Element`

#### Defined in

[core/components/EntityCollectionView.tsx:103](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/EntityCollectionView.tsx#L103)
