---
id: "entitysaveprops"
title: "Interface: EntitySaveProps<S, Key>"
sidebar_label: "EntitySaveProps"
sidebar_position: 0
custom_edit_url: null
---

Parameters passed to hooks when an entity is saved

## Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

## Properties

### collectionPath

• **collectionPath**: `string`

Full path where this entity is being saved

#### Defined in

[models/models.ts:276](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L276)

___

### context

• **context**: `CMSAppContext`

Context of the app status

#### Defined in

[models/models.ts:296](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L296)

___

### id

• `Optional` **id**: `string`

Id of the entity or undefined if new

#### Defined in

[models/models.ts:281](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L281)

___

### schema

• **schema**: `S`

Resolved schema of the entity

#### Defined in

[models/models.ts:271](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L271)

___

### status

• **status**: [EntityStatus](../types/entitystatus.md)

New or existing entity

#### Defined in

[models/models.ts:291](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L291)

___

### values

• **values**: [EntityValues](../types/entityvalues.md)<S, Key\>

Values being saved

#### Defined in

[models/models.ts:286](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L286)
