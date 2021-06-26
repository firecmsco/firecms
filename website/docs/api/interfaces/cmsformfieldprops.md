---
id: "cmsformfieldprops"
title: "Interface: CMSFormFieldProps<T, S, Key>"
sidebar_label: "CMSFormFieldProps"
sidebar_position: 0
custom_edit_url: null
---

In case you need to render a field bound to a Property inside your
custom field you can call `buildPropertyField` with these props.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T`: [CMSType](../types/cmstype.md) |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

## Properties

### autoFocus

• `Optional` **autoFocus**: `boolean`

Should the field take focus when rendered. When opening the popup view
in table mode, it makes sense to put the focus on the only field rendered.

#### Defined in

[models/fields.tsx:175](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L175)

___

### context

• **context**: [FormContext](formcontext.md)<S, Key\>

The context where this field is being rendered. You get a context as a
prop when creating a custom field.

#### Defined in

[models/fields.tsx:148](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L148)

___

### dependsOnOtherProperties

• `Optional` **dependsOnOtherProperties**: `boolean`

This flag is used to avoid using Formik FastField internally, which
prevents being updated from the values.
Set this value to `true` if you are developing a custom field which
value gets updated dynamically based on others.

#### Defined in

[models/fields.tsx:188](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L188)

___

### disabled

• `Optional` **disabled**: `boolean`

Should this field be disabled

#### Defined in

[models/fields.tsx:180](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L180)

___

### includeDescription

• `Optional` **includeDescription**: `boolean`

Should the description be included in this field

#### Defined in

[models/fields.tsx:153](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L153)

___

### name

• **name**: `string`

The name of the property, such as `age`. You can use nested and array
indexed such as `address.street` or `people[3]`

#### Defined in

[models/fields.tsx:137](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L137)

___

### partOfArray

• `Optional` **partOfArray**: `boolean`

Is this field part of an array

#### Defined in

[models/fields.tsx:169](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L169)

___

### property

• **property**: [Property](../types/property.md)<T\>

The CMS property you are binding this field to

#### Defined in

[models/fields.tsx:142](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L142)

___

### tableMode

• `Optional` **tableMode**: `boolean`

Is this field being rendered in a table

#### Defined in

[models/fields.tsx:164](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L164)

___

### underlyingValueHasChanged

• `Optional` **underlyingValueHasChanged**: `boolean`

Has the value of this property been updated in the database while this
field is being edited

#### Defined in

[models/fields.tsx:159](https://github.com/Camberi/firecms/blob/b1328ad/src/models/fields.tsx#L159)
