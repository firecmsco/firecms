---
id: "arrayproperty"
title: "Interface: ArrayProperty<T, ArrayT>"
sidebar_label: "ArrayProperty"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T`: `ArrayT`[] = `any`[] |
| `ArrayT` | `ArrayT`: [CMSType](../types/cmstype.md) = [CMSType](../types/cmstype.md) |

## Hierarchy

- `BaseProperty`

  ↳ **ArrayProperty**

## Properties

### columnWidth

• `Optional` **columnWidth**: `number`

Width in pixels of this column in the collection view. If not set
the width is inferred based on the other configurations

#### Inherited from

BaseProperty.columnWidth

#### Defined in

[models/properties.ts:75](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L75)

___

### config

• `Optional` **config**: [FieldConfig](fieldconfig.md)<T, any\>

Configure how this property field is displayed

#### Defined in

[models/properties.ts:225](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L225)

___

### dataType

• **dataType**: ``"array"``

#### Overrides

BaseProperty.dataType

#### Defined in

[models/properties.ts:209](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L209)

___

### description

• `Optional` **description**: `string`

Property description, always displayed under the field

#### Inherited from

BaseProperty.description

#### Defined in

[models/properties.ts:64](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L64)

___

### disabled

• `Optional` **disabled**: `boolean` \| [PropertyDisabledConfig](../types/propertydisabledconfig.md)

Is this field disabled. When set to true, it gets rendered as a
disabled field. You can also specify a configuration for defining the
behaviour of disabled properties

#### Inherited from

BaseProperty.disabled

#### Defined in

[models/properties.ts:88](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L88)

___

### longDescription

• `Optional` **longDescription**: `string`

Longer description of a field, displayed under a popover

#### Inherited from

BaseProperty.longDescription

#### Defined in

[models/properties.ts:69](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L69)

___

### of

• `Optional` **of**: [Property](../types/property.md)<ArrayT\>

The property of this array. You can specify any property.
You can leave this field empty only if you are providing a custom field

#### Defined in

[models/properties.ts:215](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L215)

___

### readOnly

• `Optional` **readOnly**: `boolean`

Is this a read only property. When set to true, it gets rendered as a
preview.

#### Inherited from

BaseProperty.readOnly

#### Defined in

[models/properties.ts:81](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L81)

___

### title

• `Optional` **title**: `string`

Property title (e.g. Product)

#### Inherited from

BaseProperty.title

#### Defined in

[models/properties.ts:59](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L59)

___

### validation

• `Optional` **validation**: [ArrayPropertyValidationSchema](arraypropertyvalidationschema.md)

Rules for validating this property

#### Overrides

BaseProperty.validation

#### Defined in

[models/properties.ts:220](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L220)
