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
| `T` | `T`: `any` = `any` |

## Properties

### customId

• `Optional` **customId**: `boolean` \| [EnumValues](../types/enumvalues.md)

If this property is not set Firestore will create a random ID.
You can set the value to true to allow the users to choose the ID.
You can also pass a set of values (as an EnumValues object) to allow them
to pick from only those

#### Defined in

[models/models.ts:210](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L210)

___

### defaultValues

• `Optional` **defaultValues**: `Partial`<[EntityValues](../types/entityvalues.md)<[EntitySchema](entityschema.md)<Key, T\>, Key\>\>

When creating a new entity, set some values as already initialized

#### Defined in

[models/models.ts:220](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L220)

___

### description

• `Optional` **description**: `string`

Description of this entity

#### Defined in

[models/models.ts:202](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L202)

___

### name

• **name**: `string`

Singular name of the entity as displayed in an Add button . E.g. Product

#### Defined in

[models/models.ts:197](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L197)

___

### properties

• **properties**: [PropertiesOrBuilder](../types/propertiesorbuilder.md)<[EntitySchema](entityschema.md)<Key, T\>, Key, T\>

Set of properties that compose an entity

#### Defined in

[models/models.ts:215](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L215)

## Methods

### onDelete

▸ `Optional` **onDelete**(`entityDeleteProps`): `void`

Hook called after the entity is deleted in Firestore.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entityDeleteProps` | [EntityDeleteProps](entitydeleteprops.md)<[EntitySchema](entityschema.md)<Key, T\>, Key\> |

#### Returns

`void`

#### Defined in

[models/models.ts:259](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L259)

___

### onPreDelete

▸ `Optional` **onPreDelete**(`entityDeleteProps`): `void`

Hook called after the entity is deleted in Firestore.
If you throw an error in this method the process stops, and an
error snackbar gets displayed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entityDeleteProps` | [EntityDeleteProps](entitydeleteprops.md)<[EntitySchema](entityschema.md)<Key, T\>, Key\> |

#### Returns

`void`

#### Defined in

[models/models.ts:252](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L252)

___

### onPreSave

▸ `Optional` **onPreSave**(`entitySaveProps`): [EntityValues](../types/entityvalues.md)<[EntitySchema](entityschema.md)<Key, T\>, Key\> \| `Promise`<[EntityValues](../types/entityvalues.md)<[EntitySchema](entityschema.md)<Key, T\>, Key\>\>

Hook called before saving, you need to return the values that will get
saved. If you throw an error in this method the process stops, and an
error snackbar gets displayed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [EntitySaveProps](entitysaveprops.md)<[EntitySchema](entityschema.md)<Key, T\>, Key\> |

#### Returns

[EntityValues](../types/entityvalues.md)<[EntitySchema](entityschema.md)<Key, T\>, Key\> \| `Promise`<[EntityValues](../types/entityvalues.md)<[EntitySchema](entityschema.md)<Key, T\>, Key\>\>

#### Defined in

[models/models.ts:242](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L242)

___

### onSaveFailure

▸ `Optional` **onSaveFailure**(`entitySaveProps`): `void` \| `Promise`<void\>

Hook called when saving fails

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [EntitySaveProps](entitysaveprops.md)<[EntitySchema](entityschema.md)<Key, T\>, Key\> |

#### Returns

`void` \| `Promise`<void\>

#### Defined in

[models/models.ts:233](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L233)

___

### onSaveSuccess

▸ `Optional` **onSaveSuccess**(`entitySaveProps`): `void` \| `Promise`<void\>

Hook called when save is successful

#### Parameters

| Name | Type |
| :------ | :------ |
| `entitySaveProps` | [EntitySaveProps](entitysaveprops.md)<[EntitySchema](entityschema.md)<Key, T\>, Key\> |

#### Returns

`void` \| `Promise`<void\>

#### Defined in

[models/models.ts:226](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L226)
