---
id: "ScaffoldProps"
title: "Interface: ScaffoldProps<ExtraDrawerProps, ExtraAppbarProps>"
sidebar_label: "ScaffoldProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `ExtraDrawerProps` | `object` |
| `ExtraAppbarProps` | `object` |

## Properties

### Drawer

• `Optional` **Drawer**: `ComponentType`\<[`DrawerProps`](../types/DrawerProps.md)\<`ExtraDrawerProps`\>\>

In case you need to override the view that gets rendered as a drawer

**`See`**

DefaultDrawer

#### Defined in

[packages/firecms_core/src/core/Scaffold.tsx:35](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/Scaffold.tsx#L35)

___

### FireCMSAppBarComponent

• `Optional` **FireCMSAppBarComponent**: `ComponentType`\<[`FireCMSAppBarProps`](../types/FireCMSAppBarProps.md)\<`ExtraAppbarProps`\>\>

A component that gets rendered on the upper side of the main toolbar.
`toolbarExtraWidget` has no effect if this is set.

#### Defined in

[packages/firecms_core/src/core/Scaffold.tsx:51](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/Scaffold.tsx#L51)

___

### autoOpenDrawer

• `Optional` **autoOpenDrawer**: `boolean`

Open the drawer on hover

#### Defined in

[packages/firecms_core/src/core/Scaffold.tsx:45](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/Scaffold.tsx#L45)

___

### drawerProps

• `Optional` **drawerProps**: `Partial`\<\{ `closeDrawer`: () => `any` ; `drawerOpen`: `boolean` ; `hovered`: `boolean`  }\> & `ExtraDrawerProps`

Additional props passed to the custom Drawer

#### Defined in

[packages/firecms_core/src/core/Scaffold.tsx:40](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/Scaffold.tsx#L40)

___

### fireCMSAppBarComponentProps

• `Optional` **fireCMSAppBarComponentProps**: `Partial`\<[`FireCMSAppBarProps`](../types/FireCMSAppBarProps.md)\> & `ExtraAppbarProps`

Additional props passed to the custom AppBar

#### Defined in

[packages/firecms_core/src/core/Scaffold.tsx:56](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/Scaffold.tsx#L56)

___

### includeDrawer

• `Optional` **includeDrawer**: `boolean`

#### Defined in

[packages/firecms_core/src/core/Scaffold.tsx:29](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/Scaffold.tsx#L29)

___

### logo

• `Optional` **logo**: `string`

Logo to be displayed in the drawer of the CMS

#### Defined in

[packages/firecms_core/src/core/Scaffold.tsx:27](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/Scaffold.tsx#L27)

___

### name

• **name**: `string`

Name of the app, displayed as the main title and in the tab title

#### Defined in

[packages/firecms_core/src/core/Scaffold.tsx:22](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/Scaffold.tsx#L22)
