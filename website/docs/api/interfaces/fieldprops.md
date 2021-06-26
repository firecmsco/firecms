---
id: "fieldprops"
title: "Interface: FieldProps<T, CustomProps, S, Key>"
sidebar_label: "FieldProps"
sidebar_position: 0
custom_edit_url: null
---

When building a custom field you need to create a React component that takes
this interface as props.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T`: [CMSType](../types/cmstype.md) |
| `CustomProps` | `CustomProps` = `any` |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> = [EntitySchema](entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

## Properties

### autoFocus

• **autoFocus**: `boolean`

Should this field autofocus on mount

#### Defined in

[models/fields.tsx:84](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L84)

___

### context

• **context**: [FormContext](formcontext.md)<S, Key\>

Additional values related to the state of the form or the entity

#### Defined in

[models/fields.tsx:94](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L94)

___

### customProps

• **customProps**: `CustomProps`

Additional properties set by the developer

#### Defined in

[models/fields.tsx:89](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L89)

___

### dependsOnOtherProperties

• **dependsOnOtherProperties**: `boolean`

Flag to indicate if this field was built from a property that gets
rendered conditionally

#### Defined in

[models/fields.tsx:105](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L105)

___

### disabled

• **disabled**: `boolean`

Flag to indicate if this field should be disabled

#### Defined in

[models/fields.tsx:99](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L99)

___

### error

• **error**: `any`

Is there an error in this field. The error field has the same shape as
the field, replacing values with a string containing the error.
It takes the value `null` if there is no error

#### Defined in

[models/fields.tsx:49](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L49)

___

### includeDescription

• **includeDescription**: `boolean`

Should this field include a description

#### Defined in

[models/fields.tsx:64](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L64)

___

### initialValue

• **initialValue**: `undefined` \| `T`

Initial value of this field

#### Defined in

[models/fields.tsx:24](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L24)

___

### isSubmitting

• **isSubmitting**: `boolean`

Is the form currently submitting

#### Defined in

[models/fields.tsx:34](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L34)

___

### name

• **name**: `string`

Name of the property

#### Defined in

[models/fields.tsx:14](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L14)

___

### partOfArray

• **partOfArray**: `boolean`

Is this field part of an array

#### Defined in

[models/fields.tsx:74](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L74)

___

### property

• **property**: [Property](../types/property.md)<T\>

Property related to this field

#### Defined in

[models/fields.tsx:59](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L59)

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

[models/fields.tsx:29](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L29)

___

### showError

• **showError**: `boolean`

Should this field show the error indicator.
Note that there might be an error (like an empty field that should be
filled) but we don't want to show the error until the user has tried
saving.

#### Defined in

[models/fields.tsx:42](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L42)

___

### tableMode

• **tableMode**: `boolean`

Is this field being rendered in the table

#### Defined in

[models/fields.tsx:79](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L79)

___

### touched

• **touched**: `boolean`

Has this field been touched

#### Defined in

[models/fields.tsx:54](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L54)

___

### underlyingValueHasChanged

• **underlyingValueHasChanged**: `boolean`

Flag to indicate that the underlying value has been updated in Firestore

#### Defined in

[models/fields.tsx:69](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L69)

___

### value

• **value**: `T`

Current value of this field

#### Defined in

[models/fields.tsx:19](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L19)
