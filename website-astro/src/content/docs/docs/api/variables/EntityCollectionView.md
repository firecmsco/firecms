---
slug: "docs/api/variables/EntityCollectionView"
title: "EntityCollectionView"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityCollectionView

# Variable: EntityCollectionView

> `const` **EntityCollectionView**: `FunctionComponent`\<[`EntityCollectionViewProps`](../type-aliases/EntityCollectionViewProps)\<`any`\>\>

Defined in: [core/src/components/EntityCollectionView/EntityCollectionView.tsx:146](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/EntityCollectionView/EntityCollectionView.tsx)

This component is in charge of binding a datasource path with an [EntityCollection](../interfaces/EntityCollection)
where it's configuration is defined. It includes an infinite scrolling table
and a 'Add' new entities button,

This component is the default one used for displaying entity collections
and is in charge of generating all the specific actions and customization
of the lower level [EntityCollectionTable](../functions/EntityCollectionTable)

Please **note** that you only need to use this component if you are building
a custom view. If you just need to create a default view you can do it
exclusively with config options.

If you need a lower level implementation with more granular options, you
can use [EntityCollectionTable](../functions/EntityCollectionTable).

If you need a generic table that is not bound to the datasource or entities and
properties at all, you can check [VirtualTable](VirtualTable)

## Param

## Param
