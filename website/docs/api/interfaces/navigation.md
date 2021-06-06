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

• **collections**: [EntityCollectionView](entitycollectionview.md)<[EntitySchema](entityschema.md)<any, any\>, any, string\>[]

List of the mapped collections in the CMS.
Each entry relates to a collection in the root Firestore database.
Each of the navigation entries in this field
generates an entry in the main menu.

#### Defined in

[CMSAppProps.tsx:135](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L135)

___

### views

• `Optional` **views**: [CMSView](cmsview.md)[]

Custom additional views created by the developer, added to the main
navigation

#### Defined in

[CMSAppProps.tsx:141](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L141)
