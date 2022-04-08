---
id: "EntityFormProps"
title: "Interface: EntityFormProps<M>"
sidebar_label: "EntityFormProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name |
| :------ |
| `M` |

## Properties

### entity

• `Optional` **entity**: [`Entity`](Entity)<`M`\>

The updated entity is passed from the parent component when the underlying data
has changed in the datasource

#### Defined in

[form/EntityForm.tsx:88](https://github.com/Camberi/firecms/blob/2d60fba/src/form/EntityForm.tsx#L88)

___

### path

• **path**: `string`

Path of the collection this entity is located

#### Defined in

[form/EntityForm.tsx:77](https://github.com/Camberi/firecms/blob/2d60fba/src/form/EntityForm.tsx#L77)

___

### schemaOrResolver

• **schemaOrResolver**: [`EntitySchema`](EntitySchema)<`M`\> & [`EntitySchemaResolver`](../types/EntitySchemaResolver)<`M`\>

Use to resolve the schema properties for specific path, entity id or values

#### Defined in

[form/EntityForm.tsx:82](https://github.com/Camberi/firecms/blob/2d60fba/src/form/EntityForm.tsx#L82)

___

### status

• **status**: [`EntityStatus`](../types/EntityStatus)

New or existing status

#### Defined in

[form/EntityForm.tsx:72](https://github.com/Camberi/firecms/blob/2d60fba/src/form/EntityForm.tsx#L72)

## Methods

### onDiscard

▸ `Optional` **onDiscard**(): `void`

The callback function called when discard is clicked

#### Returns

`void`

#### Defined in

[form/EntityForm.tsx:107](https://github.com/Camberi/firecms/blob/2d60fba/src/form/EntityForm.tsx#L107)

___

### onEntitySave

▸ `Optional` **onEntitySave**(`props`): `Promise`<`void`\>

The callback function called when Save is clicked and validation is correct

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.entityId` | `undefined` \| `string` |
| `props.path` | `string` |
| `props.previousValues?` | `M` |
| `props.schema` | [`EntitySchema`](EntitySchema)<`M`\> |
| `props.values` | `M` |

#### Returns

`Promise`<`void`\>

#### Defined in

[form/EntityForm.tsx:93](https://github.com/Camberi/firecms/blob/2d60fba/src/form/EntityForm.tsx#L93)

___

### onModified

▸ `Optional` **onModified**(`dirty`): `void`

The callback function when the form is dirty, so the values are different
from the original ones

#### Parameters

| Name | Type |
| :------ | :------ |
| `dirty` | `boolean` |

#### Returns

`void`

#### Defined in

[form/EntityForm.tsx:113](https://github.com/Camberi/firecms/blob/2d60fba/src/form/EntityForm.tsx#L113)

___

### onValuesChanged

▸ `Optional` **onValuesChanged**(`values?`): `void`

The callback function when the form original values have been modified

#### Parameters

| Name | Type |
| :------ | :------ |
| `values?` | `M` |

#### Returns

`void`

#### Defined in

[form/EntityForm.tsx:118](https://github.com/Camberi/firecms/blob/2d60fba/src/form/EntityForm.tsx#L118)
