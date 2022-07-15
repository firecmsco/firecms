---
id: "CMSFormFieldProps"
title: "Interface: CMSFormFieldProps<M>"
sidebar_label: "CMSFormFieldProps"
sidebar_position: 0
custom_edit_url: null
---

In case you need to render a field bound to a Property inside your
custom field you can call [buildPropertyField](../functions/buildPropertyField) with these props.

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` = `any` |

## Properties

### autoFocus

• `Optional` **autoFocus**: `boolean`

Should the field take focus when rendered. When opening the popup view
in table mode, it makes sense to put the focus on the only field rendered.

#### Defined in

[models/fields.tsx:201](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L201)

___

### context

• **context**: [`FormContext`](FormContext)<`M`\>

The context where this field is being rendered. You get a context as a
prop when creating a custom field.

#### Defined in

[models/fields.tsx:174](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L174)

___

### disabled

• `Optional` **disabled**: `boolean`

Should this field be disabled

#### Defined in

[models/fields.tsx:206](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L206)

___

### includeDescription

• `Optional` **includeDescription**: `boolean`

Should the description be included in this field

#### Defined in

[models/fields.tsx:179](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L179)

___

### name

• **name**: `string`

The name of the property, such as `age`. You can use nested and array
indexed such as `address.street` or `people[3]`

#### Defined in

[models/fields.tsx:156](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L156)

___

### partOfArray

• `Optional` **partOfArray**: `boolean`

Is this field part of an array

#### Defined in

[models/fields.tsx:195](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L195)

___

### property

• **property**: [`StringProperty`](StringProperty) \| [`NumberProperty`](NumberProperty) \| [`BooleanProperty`](BooleanProperty) \| [`TimestampProperty`](TimestampProperty) \| [`GeopointProperty`](GeopointProperty) \| [`ReferenceProperty`](ReferenceProperty)<`any`\> \| [`ArrayProperty`](ArrayProperty)<`any`[], `any`\> \| [`MapProperty`](MapProperty)<`any`\>

The CMS property you are binding this field to

#### Defined in

[models/fields.tsx:161](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L161)

___

### shouldAlwaysRerender

• `Optional` **shouldAlwaysRerender**: `boolean`

This flag is used to avoid using Formik FastField internally, which
prevents being updated from the values.
Set this value to `true` if you are developing a custom field which
value gets updated dynamically based on others.

#### Defined in

[models/fields.tsx:214](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L214)

___

### tableMode

• `Optional` **tableMode**: `boolean`

Is this field being rendered in a table

#### Defined in

[models/fields.tsx:190](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L190)

___

### underlyingValueHasChanged

• `Optional` **underlyingValueHasChanged**: `boolean`

Has the value of this property been updated in the database while this
field is being edited

#### Defined in

[models/fields.tsx:185](https://github.com/Camberi/firecms/blob/2d60fba/src/models/fields.tsx#L185)
