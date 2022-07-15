---
id: "EntitySchema"
title: "Interface: EntitySchema<M>"
sidebar_label: "EntitySchema"
sidebar_position: 0
custom_edit_url: null
---

Specification for defining an entity

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` = `any` |

## Properties

### customId

• `Optional` **customId**: `boolean` \| [`EnumValues`](../types/EnumValues) \| ``"optional"``

If this prop is not set, the ID of the document will be created by the
datasource.

You can set the value to 'true' to force the users to choose the ID.

You can set the value to 'optional' to allow the users to choose the ID,
If the ID is empty, an automatic ID will be set.

You can also pass a set of values (as an [EnumValues](../types/EnumValues) object) to
allow users to pick from only those.

#### Defined in

[models/entities.ts:31](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L31)

___

### defaultValues

• `Optional` **defaultValues**: `any`

When creating a new entity, set some values as already initialized

#### Defined in

[models/entities.ts:41](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L41)

___

### description

• `Optional` **description**: `string`

Description of this entity

#### Defined in

[models/entities.ts:17](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L17)

___

### name

• **name**: `string`

Singular name of the entity as displayed in an Add button . E.g. Product

#### Defined in

[models/entities.ts:12](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L12)

___

### properties

• **properties**: [`PropertiesOrBuilder`](../types/PropertiesOrBuilder)<`M`\>

Set of properties that compose an entity

#### Defined in

[models/entities.ts:36](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L36)

___

### views

• `Optional` **views**: [`EntityCustomView`](../types/EntityCustomView)<`M`\>[]

Array of builders for rendering additional panels in an entity view.
Useful if you need to render custom views

#### Defined in

[models/entities.ts:47](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L47)
