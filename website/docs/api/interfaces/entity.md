---
id: "entity"
title: "Interface: Entity<S, Key>"
sidebar_label: "Entity"
sidebar_position: 0
custom_edit_url: null
---

Representation of an entity fetched from Firestore

## Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

## Properties

### id

• **id**: `string`

#### Defined in

[models/models.ts:163](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L163)

___

### reference

• **reference**: `DocumentReference`<DocumentData\>

#### Defined in

[models/models.ts:164](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L164)

___

### values

• **values**: [EntityValues](../types/entityvalues.md)<S, Key\>

#### Defined in

[models/models.ts:165](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L165)
