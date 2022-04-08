---
id: "Entity"
title: "Interface: Entity<M>"
sidebar_label: "Entity"
sidebar_position: 0
custom_edit_url: null
---

Representation of an entity fetched from the datasource

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |

## Properties

### id

• **id**: `string`

Id of the entity

#### Defined in

[models/entities.ts:97](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L97)

___

### path

• **path**: `string`

A string representing the path of the referenced document (relative
to the root of the database).

#### Defined in

[models/entities.ts:103](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L103)

___

### values

• **values**: `M`

Current values

#### Defined in

[models/entities.ts:108](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L108)
