---
id: "cmsformfieldprops"
title: "Interface: CMSFormFieldProps<S, Key>"
sidebar_label: "CMSFormFieldProps"
sidebar_position: 0
custom_edit_url: null
---

In case you need to render a field bound to a Property inside your
custom field you can call `buildPropertyField` with these props.

## Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

## Properties

### autoFocus

• `Optional` **autoFocus**: `boolean`

Should the field take focus when rendered. When opening the popup view
in table mode, it makes sense to put the focus on the only field rendered.

#### Defined in

[models/fields.tsx:177](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L177)

___

### context

• **context**: [FormContext](formcontext.md)<S, Key\>

The context where this field is being rendered. You get a context as a
prop when creating a custom field.

#### Defined in

[models/fields.tsx:150](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L150)

___

### dependsOnOtherProperties

• `Optional` **dependsOnOtherProperties**: `boolean`

This flag is used to avoid using Formik FastField internally, which
prevents being updated from the values

#### Defined in

[models/fields.tsx:188](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L188)

___

### disabled

• `Optional` **disabled**: `boolean`

Should this field be disabled

#### Defined in

[models/fields.tsx:182](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L182)

___

### includeDescription

• `Optional` **includeDescription**: `boolean`

Should the description be included in this field

#### Defined in

[models/fields.tsx:155](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L155)

___

### name

• **name**: `string`

The name of the property, such as `age`. You can use nested and array
indexed such as `address.street` or `people[3]`

#### Defined in

[models/fields.tsx:140](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L140)

___

### partOfArray

• `Optional` **partOfArray**: `boolean`

Is this field part of an array

#### Defined in

[models/fields.tsx:171](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L171)

___

### property

• **property**: [StringProperty](stringproperty.md) \| [NumberProperty](numberproperty.md) \| [BooleanProperty](booleanproperty.md) \| [TimestampProperty](timestampproperty.md) \| [GeopointProperty](geopointproperty.md) \| [ReferenceProperty](referenceproperty.md)<[EntitySchema](entityschema.md)<any, any\>, any\> \| [ArrayProperty](arrayproperty.md)<any\> \| [MapProperty](mapproperty.md)<any, string\>

The CMS property you are binding this field to

#### Defined in

[models/fields.tsx:144](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L144)

___

### tableMode

• `Optional` **tableMode**: `boolean`

Is this field being rendered in a table

#### Defined in

[models/fields.tsx:166](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L166)

___

### underlyingValueHasChanged

• `Optional` **underlyingValueHasChanged**: `boolean`

Has the value of this property been updated in the database while this
field is being edited

#### Defined in

[models/fields.tsx:161](https://github.com/Camberi/firecms/blob/42dd384/src/models/fields.tsx#L161)
