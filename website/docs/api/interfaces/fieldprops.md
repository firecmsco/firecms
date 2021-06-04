---
id: "fieldprops"
title: "Interface: FieldProps<T, CustomProps, S, Key>"
sidebar_label: "FieldProps"
sidebar_position: 0
custom_edit_url: null
---

When building a custom field you need to create a React Element that takes
this interface as props.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `CustomProps` | `CustomProps` = `any` |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> = [EntitySchema](entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

## Properties

### CMSFormField

• **CMSFormField**: `FunctionComponent`<[CMSFormFieldProps](cmsformfieldprops.md)<S, Key\>\>

Builder in case this fields needs to build additional fields,
e.g. arrays or maps

#### Defined in

[models/fields.tsx:68](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L68)

___

### autoFocus

• **autoFocus**: `boolean`

Should this field autofocus on mount

#### Defined in

[models/fields.tsx:88](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L88)

___

### context

• **context**: [FormContext](formcontext.md)<S, Key\>

Additional values related to the state of the form or the entity

#### Defined in

[models/fields.tsx:98](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L98)

___

### customProps

• **customProps**: `CustomProps`

Additional properties set by the developer

#### Defined in

[models/fields.tsx:93](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L93)

___

### dependsOnOtherProperties

• **dependsOnOtherProperties**: `boolean`

Flag to indicate if this field was built from a property that gets
rendered conditionally

#### Defined in

[models/fields.tsx:109](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L109)

___

### disabled

• **disabled**: `boolean`

Flag to indicate if this field should be disabled

#### Defined in

[models/fields.tsx:103](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L103)

___

### error

• **error**: `any`

Is there an error in this field. The error field has the same shape as
the field, replacing values with a string containing the error.
It takes the value `null` if there is no error

#### Defined in

[models/fields.tsx:47](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L47)

___

### includeDescription

• **includeDescription**: `boolean`

Should this field include a description

#### Defined in

[models/fields.tsx:62](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L62)

___

### initialValue

• **initialValue**: `undefined` \| `T`

Initial value of this field

#### Defined in

[models/fields.tsx:23](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L23)

___

### isSubmitting

• **isSubmitting**: `boolean`

Is the form currently submitting

#### Defined in

[models/fields.tsx:33](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L33)

___

### name

• **name**: `string`

Name of the property

#### Defined in

[models/fields.tsx:13](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L13)

___

### partOfArray

• **partOfArray**: `boolean`

Is this field part of an array

#### Defined in

[models/fields.tsx:78](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L78)

___

### property

• **property**: [Property](../types/property.md)<T, any\>

Property related to this field

#### Defined in

[models/fields.tsx:57](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L57)

___

### setValue

• **setValue**: (`value`: ``null`` \| `T`, `shouldValidate?`: `boolean`) => `void`

Set value of field directly

#### Type declaration

▸ (`value`, `shouldValidate?`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | ``null`` \| `T` |
| `shouldValidate?` | `boolean` |

##### Returns

`void`

#### Defined in

[models/fields.tsx:28](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L28)

___

### showError

• **showError**: `boolean`

Is there an error in this field. The error field has the same shape as
the field, replacing values with a string containing the error.
It takes the value `null` if there is no error

#### Defined in

[models/fields.tsx:40](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L40)

___

### tableMode

• **tableMode**: `boolean`

Is this field being rendered in the table

#### Defined in

[models/fields.tsx:83](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L83)

___

### touched

• **touched**: `boolean`

Has this field been touched

#### Defined in

[models/fields.tsx:52](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L52)

___

### underlyingValueHasChanged

• **underlyingValueHasChanged**: `boolean`

Flag to indicate that the underlying value has been updated in Firestore

#### Defined in

[models/fields.tsx:73](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L73)

___

### value

• **value**: `T`

Current value of this field

#### Defined in

[models/fields.tsx:18](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L18)
