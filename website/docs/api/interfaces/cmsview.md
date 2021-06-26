---
id: "cmsview"
title: "Interface: CMSView"
sidebar_label: "CMSView"
sidebar_position: 0
custom_edit_url: null
---

Custom additional views created by the developer, added to the main
navigation.

## Properties

### description

• `Optional` **description**: `string`

Optional description of this view. You can use Markdown

#### Defined in

[core/CMSAppProps.tsx:140](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L140)

___

### group

• `Optional` **group**: `string`

Optional field used to group top level navigation entries under a
navigation view.

#### Defined in

[core/CMSAppProps.tsx:157](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L157)

___

### hideFromNavigation

• `Optional` **hideFromNavigation**: `boolean`

Should this view be hidden from the main navigation panel.
It will still be accessible if you reach the specified path

#### Defined in

[core/CMSAppProps.tsx:146](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L146)

___

### name

• **name**: `string`

Name of this view

#### Defined in

[core/CMSAppProps.tsx:135](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L135)

___

### path

• **path**: `string` \| `string`[]

CMS Path (or paths) you can reach this view from.
If you include multiple paths, only the first one will be included in the
main menu

#### Defined in

[core/CMSAppProps.tsx:130](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L130)

___

### view

• **view**: `ReactNode`

Component to be rendered

#### Defined in

[core/CMSAppProps.tsx:151](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L151)
