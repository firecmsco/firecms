---
id: "FieldProps"
title: "Interface: FieldProps<T, CustomProps, M>"
sidebar_label: "FieldProps"
sidebar_position: 0
custom_edit_url: null
---

When building a custom field you need to create a React component that takes
this interface as props.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](../types/CMSType) |
| `CustomProps` | `any` |
| `M` | extends `Object` = `any` |

## Properties

### autoFocus

• **autoFocus**: `boolean`

Should this field autofocus on mount

#### Defined in

[models/fields.tsx:97](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L97)

___

### context

• **context**: [`FormContext`](FormContext)<`M`\>

Additional values related to the state of the form or the entity

#### Defined in

[models/fields.tsx:107](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L107)

___

### customProps

• **customProps**: `CustomProps`

Additional properties set by the developer

#### Defined in

[models/fields.tsx:102](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L102)

___

### disabled

• **disabled**: `boolean`

Flag to indicate if this field should be disabled

#### Defined in

[models/fields.tsx:112](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L112)

___

### error

• **error**: `any`

Is there an error in this field. The error field has the same shape as
the field, replacing values with a string containing the error.
It takes the value `null` if there is no error

#### Defined in

[models/fields.tsx:61](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L61)

___

### includeDescription

• **includeDescription**: `boolean`

Should this field include a description

#### Defined in

[models/fields.tsx:76](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L76)

___

### initialValue

• **initialValue**: `undefined` \| `T`

Initial value of this field

#### Defined in

[models/fields.tsx:36](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L36)

___

### isSubmitting

• **isSubmitting**: `boolean`

Is the form currently submitting

#### Defined in

[models/fields.tsx:46](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L46)

___

### name

• **name**: `string`

Name of the property

#### Defined in

[models/fields.tsx:26](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L26)

___

### partOfArray

• **partOfArray**: `boolean`

Is this field part of an array

#### Defined in

[models/fields.tsx:87](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L87)

___

### property

• **property**: [`Property`](../types/Property)<`T`\>

Property related to this field

#### Defined in

[models/fields.tsx:71](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L71)

___

### shouldAlwaysRerender

• **shouldAlwaysRerender**: `boolean`

Flag to indicate if this field should rerender on any state change.
This is important for fields that are built from a [PropertyBuilder](../types/PropertyBuilder)
where the fields might change based on the values of the form.

#### Defined in

[models/fields.tsx:119](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L119)

___

### showError

• **showError**: `boolean`

Should this field show the error indicator.
Note that there might be an error (like an empty field that should be
filled) but we don't want to show the error until the user has tried
saving.

#### Defined in

[models/fields.tsx:54](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L54)

___

### tableMode

• **tableMode**: `boolean`

Is this field being rendered in the table

#### Defined in

[models/fields.tsx:92](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L92)

___

### touched

• **touched**: `boolean`

Has this field been touched

#### Defined in

[models/fields.tsx:66](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L66)

___

### underlyingValueHasChanged

• **underlyingValueHasChanged**: `boolean`

Flag to indicate that the underlying value has been updated in the
datasource

#### Defined in

[models/fields.tsx:82](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L82)

___

### value

• **value**: `T`

Current value of this field

#### Defined in

[models/fields.tsx:31](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L31)

## Methods

### setValue

▸ **setValue**(`value`, `shouldValidate?`): `void`

Set value of field directly

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | ``null`` \| `T` |
| `shouldValidate?` | `boolean` |

#### Returns

`void`

#### Defined in

[models/fields.tsx:41](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L41)
