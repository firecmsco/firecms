---
id: "entityschema"
title: "Interface: EntitySchema<Key>"
sidebar_label: "EntitySchema"
sidebar_position: 0
custom_edit_url: null
---

Specification for defining an entity

## Type parameters

| Name | Type |
| :------ | :------ |
| `Key` | `Key`: `string` = `string` |

## Properties

### customId

• `Optional` **customId**: `boolean` \| [EnumValues](../types/enumvalues.md)

If this property is not set Firestore will create a random ID.
You can set the value to true to allow the users to choose the ID.
You can also pass a set of values (as an EnumValues object) to allow them
to pick from only those

#### Defined in

[models/models.ts:31](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L31)

___

### defaultValues

• `Optional` **defaultValues**: `Partial`<[EntityValues](../types/entityvalues.md)<[EntitySchema](entityschema.md)<Key\>, Key\>\>

When creating a new entity, set some values as already initialized

#### Defined in

[models/models.ts:41](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L41)

___

### description

• `Optional` **description**: `string`

Description of this entity

#### Defined in

[models/models.ts:23](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L23)

___

### name

• **name**: `string`

Singular name of the entity as displayed in an Add button . E.g. Product

#### Defined in

[models/models.ts:18](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L18)

___

### properties

• **properties**: [PropertiesOrBuilder](../types/propertiesorbuilder.md)<[EntitySchema](entityschema.md)<Key\>, Key\>

Set of properties that compose an entity

#### Defined in

[models/models.ts:36](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L36)

## Methods

### onDelete

▸ `Optional` **onDelete**(`entityDeleteProps`): `void`

Hook called after the entity is deleted in Firestore.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entityDeleteProps` | [EntityDeleteProps](entitydeleteprops.md)<[EntitySchema](entityschema.md)<Key\>, Key\> |

#### Returns

`void`

#### Defined in

[models/models.ts:80](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L80)

___

### onPreDelete

▸ `Optional` **onPreDelete**(`entityDeleteProps`): `void`

Hook called after the entity is deleted in Firestore.
If you throw an error in this method the process stops, and an
error snackbar gets displayed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entityDeleteProps` | [EntityDeleteProps](entitydeleteprops.md)<[EntitySchema](entityschema.md)<Key\>, Key\> |

#### Returns

`void`

#### Defined in

[models/models.ts:73](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L73)

___

### onPreSave

▸ `Optional` **onPreSave**(`entitySaveProps`): [EntityValues](../types/entityvalues.md)<[EntitySchema](entityschema.md)<Key\>, Key\> \| `Promise`<[EntityValues](../types/entityvalues.md)<[EntitySchema](entityschema.md)<Key\>, Key\>\>

Hook called before saving, you need to return the values that will get
saved. If you throw an error in this method the process stops, and an
error snackbar gets displayed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [EntitySaveProps](entitysaveprops.md)<[EntitySchema](entityschema.md)<Key\>, Key\> |

#### Returns

[EntityValues](../types/entityvalues.md)<[EntitySchema](entityschema.md)<Key\>, Key\> \| `Promise`<[EntityValues](../types/entityvalues.md)<[EntitySchema](entityschema.md)<Key\>, Key\>\>

#### Defined in

[models/models.ts:63](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L63)

___

### onSaveFailure

▸ `Optional` **onSaveFailure**(`entitySaveProps`): `void` \| `Promise`<void\>

Hook called when saving fails

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [EntitySaveProps](entitysaveprops.md)<[EntitySchema](entityschema.md)<Key\>, Key\> |

#### Returns

`void` \| `Promise`<void\>

#### Defined in

[models/models.ts:54](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L54)

___

### onSaveSuccess

▸ `Optional` **onSaveSuccess**(`entitySaveProps`): `void` \| `Promise`<void\>

Hook called when save is successful

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [EntitySaveProps](entitysaveprops.md)<[EntitySchema](entityschema.md)<Key\>, Key\> |

#### Returns

`void` \| `Promise`<void\>

#### Defined in

[models/models.ts:47](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L47)
