---
id: "Navigation"
title: "Interface: Navigation"
sidebar_label: "Navigation"
sidebar_position: 0
custom_edit_url: null
---

In this interface you define the main navigation entries of the CMS

## Properties

### collections

• **collections**: [`EntityCollection`](EntityCollection)<`any`, `string`, `any`\>[]

List of the mapped collections in the CMS.
Each entry relates to a collection in the root database.
Each of the navigation entries in this field
generates an entry in the main menu.

#### Defined in

[models/navigation.ts:67](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L67)

___

### views

• `Optional` **views**: [`CMSView`](CMSView)[]

Custom additional views created by the developer, added to the main
navigation

#### Defined in

[models/navigation.ts:73](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L73)
