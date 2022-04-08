---
id: "SideEntityPanelProps"
title: "Interface: SideEntityPanelProps<M, UserType>"
sidebar_label: "SideEntityPanelProps"
sidebar_position: 0
custom_edit_url: null
---

Props used to open a side dialog

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | `any` |
| `UserType` | [`User`](../types/User) |

## Properties

### callbacks

• `Optional` **callbacks**: [`EntityCallbacks`](EntityCallbacks)<`M`\>

This interface defines all the callbacks that can be used when an entity
is being created, updated or deleted.
Useful for adding your own logic or blocking the execution of the operation

#### Defined in

[models/side_entity_controller.tsx:61](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L61)

___

### copy

• `Optional` **copy**: `boolean`

Set this flag to true if you want to make a copy of an existing entity

#### Defined in

[models/side_entity_controller.tsx:26](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L26)

___

### entityId

• `Optional` **entityId**: `string`

Id of the entity, if not set, it means we are creating a new entity

#### Defined in

[models/side_entity_controller.tsx:21](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L21)

___

### overrideSchemaRegistry

• `Optional` **overrideSchemaRegistry**: `boolean`

#### Defined in

[models/side_entity_controller.tsx:64](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L64)

___

### path

• **path**: `string`

Absolute path of the entity

#### Defined in

[models/side_entity_controller.tsx:16](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L16)

___

### permissions

• `Optional` **permissions**: [`PermissionsBuilder`](../types/PermissionsBuilder)<`M`, `UserType`\>

Can the elements in this collection be added and edited.

#### Defined in

[models/side_entity_controller.tsx:43](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L43)

___

### schema

• `Optional` **schema**: [`EntitySchema`](EntitySchema)<`M`\> \| [`EntitySchemaResolver`](../types/EntitySchemaResolver)<`M`\>

Schema representing the entities of this view

#### Defined in

[models/side_entity_controller.tsx:48](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L48)

___

### selectedSubpath

• `Optional` **selectedSubpath**: `string`

Open the entity with a selected sub-collection view. If the panel for this
entity was already open, it is replaced.

#### Defined in

[models/side_entity_controller.tsx:32](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L32)

___

### subcollections

• `Optional` **subcollections**: [`EntityCollection`](EntityCollection)<`any`, `string`, `any`\>[]

You can add subcollections to your entity in the same way you define the root
collections.

#### Defined in

[models/side_entity_controller.tsx:54](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L54)

___

### width

• `Optional` **width**: `string` \| `number`

Use this prop to override the width of the side dialog.
e.g. "600px"

#### Defined in

[models/side_entity_controller.tsx:38](https://github.com/Camberi/firecms/blob/2d60fba/src/models/side_entity_controller.tsx#L38)
