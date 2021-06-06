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

[models/models.ts:355](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L355)

___

### reference

• **reference**: `DocumentReference`<DocumentData\>

#### Defined in

[models/models.ts:356](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L356)

___

### values

• **values**: [EntityValues](../types/entityvalues.md)<S, Key\>

#### Defined in

[models/models.ts:357](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L357)
