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

[models/models.ts:134](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L134)

___

### context

• **context**: `CMSAppContext`

Context of the app status

#### Defined in

[models/models.ts:149](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L149)

___

### entity

• **entity**: [Entity](entity.md)<S, Key\>

Deleted entity

#### Defined in

[models/models.ts:144](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L144)

___

### id

• **id**: `string`

Deleted entity id

#### Defined in

[models/models.ts:139](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L139)

___

### schema

• **schema**: `S`

Schema of the entity being deleted

#### Defined in

[models/models.ts:129](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L129)
