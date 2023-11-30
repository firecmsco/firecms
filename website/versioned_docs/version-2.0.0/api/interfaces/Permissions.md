---
id: "Permissions"
title: "Interface: Permissions"
sidebar_label: "Permissions"
sidebar_position: 0
custom_edit_url: null
---

Define the operations that can be performed in a collection.

## Properties

### create

• `Optional` **create**: `boolean`

Can the user add new entities. Defaults to `true`

#### Defined in

[packages/firecms_core/src/types/permissions.ts:20](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/permissions.ts#L20)

___

### delete

• `Optional` **delete**: `boolean`

Can the user delete entities. Defaults to `true`

#### Defined in

[packages/firecms_core/src/types/permissions.ts:28](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/permissions.ts#L28)

___

### edit

• `Optional` **edit**: `boolean`

Can the elements in this collection be edited. Defaults to `true`

#### Defined in

[packages/firecms_core/src/types/permissions.ts:24](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/permissions.ts#L24)

___

### read

• `Optional` **read**: `boolean`

Can the user see this collection.
If `false` it will not show in the user's navigation
Defaults to `true`

#### Defined in

[packages/firecms_core/src/types/permissions.ts:16](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/permissions.ts#L16)
