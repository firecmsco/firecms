---
id: "FormContext"
title: "Interface: FormContext<M>"
sidebar_label: "FormContext"
sidebar_position: 0
custom_edit_url: null
---

Context passed to custom fields

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

## Properties

### collection

• **collection**: [`ResolvedEntityCollection`](../types/ResolvedEntityCollection.md)\<`M`\>

Collection of the entity being modified

#### Defined in

[packages/firecms_core/src/types/fields.tsx:129](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L129)

___

### entityId

• `Optional` **entityId**: `string`

Entity id, it can be null if it's a new entity

#### Defined in

[packages/firecms_core/src/types/fields.tsx:139](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L139)

___

### path

• **path**: `string`

Path this entity is located at

#### Defined in

[packages/firecms_core/src/types/fields.tsx:144](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L144)

___

### save

• **save**: (`values`: `M`) => `void`

#### Type declaration

▸ (`values`): `void`

Save the entity

##### Parameters

| Name | Type |
| :------ | :------ |
| `values` | `M` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/fields.tsx:157](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L157)

___

### setFieldValue

• **setFieldValue**: (`key`: `string`, `value`: `any`, `shouldValidate?`: `boolean`) => `void`

#### Type declaration

▸ (`key`, `value`, `shouldValidate?`): `void`

Update the value of a field

##### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `any` |
| `shouldValidate?` | `boolean` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/fields.tsx:152](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L152)

___

### values

• **values**: `M`

Current values of the entity

#### Defined in

[packages/firecms_core/src/types/fields.tsx:134](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L134)
