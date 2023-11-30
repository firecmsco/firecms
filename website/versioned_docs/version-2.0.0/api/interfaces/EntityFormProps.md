---
id: "EntityFormProps"
title: "Interface: EntityFormProps<M>"
sidebar_label: "EntityFormProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

## Properties

### autoSave

• `Optional` **autoSave**: `boolean`

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:101](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L101)

___

### collection

• **collection**: [`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\>

The collection is used to build the fields of the form

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:58](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L58)

___

### currentEntityId

• `Optional` **currentEntityId**: `string`

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:95](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L95)

___

### entity

• `Optional` **entity**: [`Entity`](Entity.md)\<`M`\>

The updated entity is passed from the parent component when the underlying data
has changed in the datasource

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:64](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L64)

___

### hideId

• `Optional` **hideId**: `boolean`

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:99](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L99)

___

### onDiscard

• `Optional` **onDiscard**: () => `void`

#### Type declaration

▸ (): `void`

The callback function called when discard is clicked

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:76](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L76)

___

### onEntitySaveRequested

• **onEntitySaveRequested**: (`props`: `EntityFormSaveParams`\<`M`\>) => `Promise`\<`void`\>

#### Type declaration

▸ (`props`): `Promise`\<`void`\>

The callback function called when Save is clicked and validation is correct

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `EntityFormSaveParams`\<`M`\> |

##### Returns

`Promise`\<`void`\>

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:69](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L69)

___

### onFormContextChange

• `Optional` **onFormContextChange**: (`formContext`: [`FormContext`](FormContext.md)\<`M`\>) => `void`

#### Type declaration

▸ (`formContext`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `formContext` | [`FormContext`](FormContext.md)\<`M`\> |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:97](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L97)

___

### onIdChange

• `Optional` **onIdChange**: (`id`: `string`) => `void`

#### Type declaration

▸ (`id`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:93](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L93)

___

### onIdUpdateError

• `Optional` **onIdUpdateError**: (`error`: `any`) => `void`

#### Type declaration

▸ (`error`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `any` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:103](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L103)

___

### onModified

• `Optional` **onModified**: (`dirty`: `boolean`) => `void`

#### Type declaration

▸ (`dirty`): `void`

The callback function when the form is dirty, so the values are different
from the original ones

##### Parameters

| Name | Type |
| :------ | :------ |
| `dirty` | `boolean` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:82](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L82)

___

### onValuesChanged

• `Optional` **onValuesChanged**: (`values?`: `M`) => `void`

#### Type declaration

▸ (`values?`): `void`

The callback function when the form original values have been modified

##### Parameters

| Name | Type |
| :------ | :------ |
| `values?` | `M` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:87](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L87)

___

### path

• **path**: `string`

Path of the collection this entity is located

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:53](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L53)

___

### status

• **status**: [`EntityStatus`](../types/EntityStatus.md)

New or existing status

#### Defined in

[packages/firecms_core/src/form/EntityForm.tsx:48](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/EntityForm.tsx#L48)
