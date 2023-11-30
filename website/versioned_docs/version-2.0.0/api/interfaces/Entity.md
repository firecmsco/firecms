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
| `M` | extends `object` |

## Properties

### id

• **id**: `string`

ID of the entity

#### Defined in

[packages/firecms_core/src/types/entities.ts:16](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entities.ts#L16)

___

### path

• **path**: `string`

A string representing the path of the referenced document (relative
to the root of the database).

#### Defined in

[packages/firecms_core/src/types/entities.ts:22](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entities.ts#L22)

___

### values

• **values**: `M`

Current values

#### Defined in

[packages/firecms_core/src/types/entities.ts:27](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entities.ts#L27)
