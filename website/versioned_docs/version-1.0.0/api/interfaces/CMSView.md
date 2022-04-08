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

[models/navigation.ts:198](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L198)

___

### group

• `Optional` **group**: `string`

Optional field used to group top level navigation entries under a
navigation view.

#### Defined in

[models/navigation.ts:216](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L216)

___

### hideFromNavigation

• `Optional` **hideFromNavigation**: `boolean`

Should this view be hidden from the main navigation panel.
It will still be accessible if you reach the specified path

#### Defined in

[models/navigation.ts:204](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L204)

___

### name

• **name**: `string`

Name of this view

#### Defined in

[models/navigation.ts:193](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L193)

___

### path

• **path**: `string` \| `string`[]

CMS Path (or paths) you can reach this view from.
If you include multiple paths, only the first one will be included in the
main menu

#### Defined in

[models/navigation.ts:188](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L188)

___

### view

• **view**: `ReactNode`

Component to be rendered. This can be any React component, and can use
any of the provided hooks

#### Defined in

[models/navigation.ts:210](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L210)
