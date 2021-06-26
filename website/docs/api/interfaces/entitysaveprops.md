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

[models/models.ts:97](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L97)

___

### context

• **context**: `CMSAppContext`

Context of the app status

#### Defined in

[models/models.ts:117](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L117)

___

### id

• `Optional` **id**: `string`

Id of the entity or undefined if new

#### Defined in

[models/models.ts:102](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L102)

___

### schema

• **schema**: `S`

Resolved schema of the entity

#### Defined in

[models/models.ts:92](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L92)

___

### status

• **status**: [EntityStatus](../types/entitystatus.md)

New or existing entity

#### Defined in

[models/models.ts:112](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L112)

___

### values

• **values**: [EntityValues](../types/entityvalues.md)<S, Key\>

Values being saved

#### Defined in

[models/models.ts:107](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L107)
