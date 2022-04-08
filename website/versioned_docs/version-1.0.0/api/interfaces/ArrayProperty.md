---
id: "ArrayProperty"
title: "Interface: ArrayProperty<T, ArrayT>"
sidebar_label: "ArrayProperty"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `ArrayT`[] = `any`[] |
| `ArrayT` | extends [`CMSType`](../types/CMSType) = `any` |

## Hierarchy

- `BaseProperty`

  ↳ **`ArrayProperty`**

## Properties

### columnWidth

• `Optional` **columnWidth**: `number`

Width in pixels of this column in the collection view. If not set
the width is inferred based on the other configurations

#### Inherited from

BaseProperty.columnWidth

#### Defined in

[models/properties.ts:96](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L96)

___

### config

• `Optional` **config**: [`FieldConfig`](FieldConfig)<`T`, `any`\>

Configure how this property field is displayed

#### Defined in

[models/properties.ts:329](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L329)

___

### dataType

• **dataType**: ``"array"``

#### Overrides

BaseProperty.dataType

#### Defined in

[models/properties.ts:278](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L278)

___

### description

• `Optional` **description**: `string`

Property description, always displayed under the field

#### Inherited from

BaseProperty.description

#### Defined in

[models/properties.ts:85](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L85)

___

### disabled

• `Optional` **disabled**: `boolean` \| [`PropertyDisabledConfig`](PropertyDisabledConfig)

Is this field disabled. When set to true, it gets rendered as a
disabled field. You can also specify a configuration for defining the
behaviour of disabled properties

#### Inherited from

BaseProperty.disabled

#### Defined in

[models/properties.ts:109](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L109)

___

### longDescription

• `Optional` **longDescription**: `string`

Longer description of a field, displayed under a popover

#### Inherited from

BaseProperty.longDescription

#### Defined in

[models/properties.ts:90](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L90)

___

### of

• `Optional` **of**: [`Property`](../types/Property)<`ArrayT`\>

The property of this array.
You can specify any property (except another Array property)
You can leave this field empty only if you are providing a custom field,
otherwise an error will be thrown.

#### Defined in

[models/properties.ts:286](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L286)

___

### oneOf

• `Optional` **oneOf**: `Object`

Use this field if you would like to have an array of properties.
It is useful if you need to have values of different types in the same
array.
Each entry of the array is an object with the shape:
```
{ type: "YOUR_TYPE", value: "YOUR_VALUE"}
```
Note that you can use any property so `value` can take any value (strings,
numbers, array, objects...)
You can customise the `type` and `value` fields to suit your needs.

An example use case for this feature may be a blog entry, where you have
images and text blocks using markdown.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `properties` | `Record`<`string`, [`StringProperty`](StringProperty) \| [`NumberProperty`](NumberProperty) \| [`BooleanProperty`](BooleanProperty) \| [`TimestampProperty`](TimestampProperty) \| [`GeopointProperty`](GeopointProperty) \| [`ReferenceProperty`](ReferenceProperty)<`any`\> \| [`MapProperty`](MapProperty)<{ `[Key: string]`: `any`;  }\> \| [`ArrayProperty`](ArrayProperty)<[`CMSType`](../types/CMSType)[], `any`\>\> | Record of properties, where the key is the `type` and the value is the corresponding property |
| `typeField?` | `string` | Name of the field to use as the discriminator for type Defaults to `type` |
| `valueField?` | `string` | Name of the  field to use as the value Defaults to `value` |

#### Defined in

[models/properties.ts:303](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L303)

___

### readOnly

• `Optional` **readOnly**: `boolean`

Is this a read only property. When set to true, it gets rendered as a
preview.

#### Inherited from

BaseProperty.readOnly

#### Defined in

[models/properties.ts:102](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L102)

___

### title

• `Optional` **title**: `string`

Property title (e.g. Product)

#### Inherited from

BaseProperty.title

#### Defined in

[models/properties.ts:80](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L80)

___

### validation

• `Optional` **validation**: [`ArrayPropertyValidationSchema`](ArrayPropertyValidationSchema)

Rules for validating this property

#### Overrides

BaseProperty.validation

#### Defined in

[models/properties.ts:324](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L324)
