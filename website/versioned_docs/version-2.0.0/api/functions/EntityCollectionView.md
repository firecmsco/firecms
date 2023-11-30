---
id: "EntityCollectionView"
title: "Function: EntityCollectionView"
sidebar_label: "EntityCollectionView"
sidebar_position: 0
custom_edit_url: null
---

▸ **EntityCollectionView**(`props`, `context?`): `ReactNode`

This component is in charge of binding a datasource path with an [EntityCollection](../interfaces/EntityCollection.md)
where it's configuration is defined. It includes an infinite scrolling table
and a 'Add' new entities button,

This component is the default one used for displaying entity collections
and is in charge of generating all the specific actions and customization
of the lower level [EntityCollectionTable](EntityCollectionTable.md)

Please **note** that you only need to use this component if you are building
a custom view. If you just need to create a default view you can do it
exclusively with config options.

If you need a lower level implementation with more granular options, you
can use [EntityCollectionTable](EntityCollectionTable.md).

If you need a generic table that is not bound to the datasource or entities and
properties at all, you can check [VirtualTable](VirtualTable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`EntityCollectionViewProps`](../types/EntityCollectionViewProps.md)\<`any`\> |
| `context?` | `any` |

#### Returns

`ReactNode`

#### Defined in

node_modules/@types/react/index.d.ts:567
