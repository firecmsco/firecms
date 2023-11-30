---
id: "CMSView"
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

[packages/firecms_core/src/types/navigation.ts:153](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/navigation.ts#L153)

___

### group

• `Optional` **group**: `string`

Optional field used to group top level navigation entries under a
navigation view.

#### Defined in

[packages/firecms_core/src/types/navigation.ts:179](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/navigation.ts#L179)

___

### hideFromNavigation

• `Optional` **hideFromNavigation**: `boolean`

Should this view be hidden from the main navigation panel.
It will still be accessible if you reach the specified path

#### Defined in

[packages/firecms_core/src/types/navigation.ts:167](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/navigation.ts#L167)

___

### icon

• `Optional` **icon**: `string`

Icon key to use in this view.
You can use any of the icons in the MUI specs:
https://mui.com/material-ui/material-icons/
e.g. 'AccountTree' or 'Person'

#### Defined in

[packages/firecms_core/src/types/navigation.ts:161](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/navigation.ts#L161)

___

### name

• **name**: `string`

Name of this view

#### Defined in

[packages/firecms_core/src/types/navigation.ts:148](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/navigation.ts#L148)

___

### path

• **path**: `string`

CMS Path you can reach this view from.

#### Defined in

[packages/firecms_core/src/types/navigation.ts:143](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/navigation.ts#L143)

___

### view

• **view**: `ReactNode`

Component to be rendered. This can be any React component, and can use
any of the provided hooks

#### Defined in

[packages/firecms_core/src/types/navigation.ts:173](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/navigation.ts#L173)
