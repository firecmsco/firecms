---
id: "navigation"
title: "Interface: Navigation"
sidebar_label: "Navigation"
sidebar_position: 0
custom_edit_url: null
---

In this interface you define the main navigation entries of the CMS

## Properties

### collections

• **collections**: [EntityCollectionView](entitycollectionview.md)<[EntitySchema](entityschema.md)<any\>, any, string\>[]

List of the mapped collections in the CMS.
Each entry relates to a collection in the root Firestore database.
Each of the navigation entries in this field
generates an entry in the main menu.

#### Defined in

[models/navigation.ts:27](https://github.com/Camberi/firecms/blob/b1328ad/src/models/navigation.ts#L27)

___

### views

• `Optional` **views**: [CMSView](cmsview.md)[]

Custom additional views created by the developer, added to the main
navigation

#### Defined in

[models/navigation.ts:33](https://github.com/Camberi/firecms/blob/b1328ad/src/models/navigation.ts#L33)
