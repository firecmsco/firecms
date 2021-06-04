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

[CMSAppProps.tsx:166](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L166)

___

### group

• `Optional` **group**: `string`

Optional field used to group top level navigation entries under a
navigation view.

#### Defined in

[CMSAppProps.tsx:183](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L183)

___

### hideFromNavigation

• `Optional` **hideFromNavigation**: `boolean`

Should this view be hidden from the main navigation panel.
It will still be accessible if you reach the specified path

#### Defined in

[CMSAppProps.tsx:172](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L172)

___

### name

• **name**: `string`

Name of this view

#### Defined in

[CMSAppProps.tsx:161](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L161)

___

### path

• **path**: `string` \| `string`[]

CMS Path (or paths) you can reach this view from.
If you include multiple paths, only the first one will be included in the
main menu

#### Defined in

[CMSAppProps.tsx:156](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L156)

___

### view

• **view**: `ReactNode`

Component to be rendered

#### Defined in

[CMSAppProps.tsx:177](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L177)
