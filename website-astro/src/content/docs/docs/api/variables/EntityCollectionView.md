---
slug: "docs/api/variables/EntityCollectionView"
title: "EntityCollectionView"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / EntityCollectionView

# Variable: EntityCollectionView

> `const` **EntityCollectionView**: `FunctionComponent`\<[`EntityCollectionViewProps`](/docs/api/type-aliases/EntityCollectionViewProps)\<`any`\>\>

Defined in: [components/EntityCollectionView/EntityCollectionView.tsx:143](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionView/EntityCollectionView.tsx)

This component is in charge of binding a datasource path with an [EntityCollection](/docs/api/interfaces/EntityCollection)
where it's configuration is defined. It includes an infinite scrolling table
and a 'Add' new entities button,

This component is the default one used for displaying entity collections
and is in charge of generating all the specific actions and customization
of the lower level [EntityCollectionTable](/docs/api/functions/EntityCollectionTable)

Please **note** that you only need to use this component if you are building
a custom view. If you just need to create a default view you can do it
exclusively with config options.

If you need a lower level implementation with more granular options, you
can use [EntityCollectionTable](/docs/api/functions/EntityCollectionTable).

If you need a generic table that is not bound to the datasource or entities and
properties at all, you can check [VirtualTable](/docs/api/variables/VirtualTable)

## Param

## Param
