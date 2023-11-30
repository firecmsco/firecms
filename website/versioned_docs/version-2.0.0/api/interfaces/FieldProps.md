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
| `T` | extends [`CMSType`](../types/CMSType.md) = `any` |
| `CustomProps` | `any` |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

## Properties

### autoFocus

• **autoFocus**: `boolean`

Should this field autofocus on mount

#### Defined in

[packages/firecms_core/src/types/fields.tsx:101](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L101)

___

### context

• **context**: [`FormContext`](FormContext.md)\<`M`\>

Additional values related to the state of the form or the entity

#### Defined in

[packages/firecms_core/src/types/fields.tsx:111](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L111)

___

### customProps

• **customProps**: `CustomProps`

Additional properties set by the developer

#### Defined in

[packages/firecms_core/src/types/fields.tsx:106](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L106)

___

### disabled

• **disabled**: `boolean`

Flag to indicate if this field should be disabled

#### Defined in

[packages/firecms_core/src/types/fields.tsx:116](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L116)

___

### error

• **error**: `any`

Is there an error in this field. The error field has the same shape as
the field, replacing values with a string containing the error.
It takes the value `null` if there is no error

#### Defined in

[packages/firecms_core/src/types/fields.tsx:60](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L60)

___

### includeDescription

• **includeDescription**: `boolean`

Should this field include a description

#### Defined in

[packages/firecms_core/src/types/fields.tsx:75](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L75)

___

### initialValue

• **initialValue**: `undefined` \| `T`

Initial value of this field

#### Defined in

[packages/firecms_core/src/types/fields.tsx:27](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L27)

___

### isSubmitting

• **isSubmitting**: `boolean`

Is the form currently submitting

#### Defined in

[packages/firecms_core/src/types/fields.tsx:45](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L45)

___

### partOfArray

• **partOfArray**: `boolean`

Is this field part of an array

#### Defined in

[packages/firecms_core/src/types/fields.tsx:86](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L86)

___

### partOfBlock

• **partOfBlock**: `boolean`

Is this field part of a block (oneOf array)

#### Defined in

[packages/firecms_core/src/types/fields.tsx:91](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L91)

___

### property

• **property**: [`ResolvedProperty`](../types/ResolvedProperty.md)\<`T`\>

Property related to this field

#### Defined in

[packages/firecms_core/src/types/fields.tsx:70](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L70)

___

### propertyKey

• **propertyKey**: `string`

Key of the property
E.g. "user.name" for a property with path "user.name"

#### Defined in

[packages/firecms_core/src/types/fields.tsx:17](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L17)

___

### setFieldValue

• **setFieldValue**: (`propertyKey`: `string`, `value`: ``null`` \| [`CMSType`](../types/CMSType.md), `shouldValidate?`: `boolean`) => `void`

#### Type declaration

▸ (`propertyKey`, `value`, `shouldValidate?`): `void`

Set value of a different field directly

##### Parameters

| Name | Type |
| :------ | :------ |
| `propertyKey` | `string` |
| `value` | ``null`` \| [`CMSType`](../types/CMSType.md) |
| `shouldValidate?` | `boolean` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/fields.tsx:40](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L40)

___

### setValue

• **setValue**: (`value`: ``null`` \| `T`, `shouldValidate?`: `boolean`) => `void`

#### Type declaration

▸ (`value`, `shouldValidate?`): `void`

Set value of field directly

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | ``null`` \| `T` |
| `shouldValidate?` | `boolean` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/fields.tsx:32](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L32)

___

### showError

• **showError**: `boolean`

Should this field show the error indicator.
Note that there might be an error (like an empty field that should be
filled) but we don't want to show the error until the user has tried
saving.

#### Defined in

[packages/firecms_core/src/types/fields.tsx:53](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L53)

___

### tableMode

• **tableMode**: `boolean`

Is this field being rendered in the entity table popup

#### Defined in

[packages/firecms_core/src/types/fields.tsx:96](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L96)

___

### touched

• **touched**: `boolean`

Has this field been touched

#### Defined in

[packages/firecms_core/src/types/fields.tsx:65](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L65)

___

### underlyingValueHasChanged

• **underlyingValueHasChanged**: `boolean`

Flag to indicate that the underlying value has been updated in the
datasource

#### Defined in

[packages/firecms_core/src/types/fields.tsx:81](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L81)

___

### value

• **value**: `T`

Current value of this field

#### Defined in

[packages/firecms_core/src/types/fields.tsx:22](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L22)
