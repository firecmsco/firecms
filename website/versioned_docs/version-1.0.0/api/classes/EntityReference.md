---
id: "EntityReference"
title: "Class: EntityReference"
sidebar_label: "EntityReference"
sidebar_position: 0
custom_edit_url: null
---

Class used to create a reference to an entity in a different path

## Constructors

### constructor

• **new EntityReference**(`id`, `path`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `path` | `string` |

#### Defined in

[models/entities.ts:132](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L132)

## Properties

### id

• `Readonly` **id**: `string`

Id of the entity

#### Defined in

[models/entities.ts:125](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L125)

___

### path

• `Readonly` **path**: `string`

A string representing the path of the referenced document (relative
to the root of the database).

#### Defined in

[models/entities.ts:130](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L130)

## Accessors

### pathWithId

• `get` **pathWithId**(): `string`

#### Returns

`string`

#### Defined in

[models/entities.ts:137](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L137)
