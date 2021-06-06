---
id: "entitydeleteprops"
title: "Interface: EntityDeleteProps<S, Key>"
sidebar_label: "EntityDeleteProps"
sidebar_position: 0
custom_edit_url: null
---

Parameters passed to hooks when an entity is deleted

## Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

## Properties

### collectionPath

• **collectionPath**: `string`

Firestore path of the parent collection

#### Defined in

[models/models.ts:313](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L313)

___

### context

• **context**: `CMSAppContext`

Context of the app status

#### Defined in

[models/models.ts:328](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L328)

___

### entity

• **entity**: [Entity](entity.md)<S, Key\>

Deleted entity

#### Defined in

[models/models.ts:323](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L323)

___

### id

• **id**: `string`

Deleted entity id

#### Defined in

[models/models.ts:318](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L318)

___

### schema

• **schema**: `S`

Schema of the entity being deleted

#### Defined in

[models/models.ts:308](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L308)
