---
id: "timestampproperty"
title: "Interface: TimestampProperty"
sidebar_label: "TimestampProperty"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `BaseProperty`

  ↳ **TimestampProperty**

## Properties

### autoValue

• `Optional` **autoValue**: ``"on_create"`` \| ``"on_update"``

If this flag is  set to `on_create` or `on_update` this timestamp is
updated automatically on creation of the entity only or on every
update (including creation). Useful for creating `created_on` or
`updated_on` fields

#### Defined in

[models/models.ts:651](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L651)

___

### columnWidth

• `Optional` **columnWidth**: `number`

Width in pixels of this column in the collection view. If not set
the width is inferred based on the other configurations

#### Inherited from

BaseProperty.columnWidth

#### Defined in

[models/models.ts:446](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L446)

___

### config

• `Optional` **config**: [FieldConfig](fieldconfig.md)<Date, any\>

Configure how this property field is displayed

#### Defined in

[models/models.ts:656](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L656)

___

### dataType

• **dataType**: ``"timestamp"``

#### Overrides

BaseProperty.dataType

#### Defined in

[models/models.ts:638](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L638)

___

### description

• `Optional` **description**: `string`

Property description, always displayed under the field

#### Inherited from

BaseProperty.description

#### Defined in

[models/models.ts:435](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L435)

___

### disabled

• `Optional` **disabled**: `boolean` \| [PropertyDisabledConfig](../types/propertydisabledconfig.md)

Is this field disabled. When set to true, it gets rendered as a
disabled field. You can also specify a configuration for defining the
behaviour of disabled properties

#### Inherited from

BaseProperty.disabled

#### Defined in

[models/models.ts:459](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L459)

___

### longDescription

• `Optional` **longDescription**: `string`

Longer description of a field, displayed under a popover

#### Inherited from

BaseProperty.longDescription

#### Defined in

[models/models.ts:440](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L440)

___

### readOnly

• `Optional` **readOnly**: `boolean`

Is this a read only property. When set to true, it gets rendered as a
preview.

#### Inherited from

BaseProperty.readOnly

#### Defined in

[models/models.ts:452](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L452)

___

### title

• `Optional` **title**: `string`

Property title (e.g. Product)

#### Inherited from

BaseProperty.title

#### Defined in

[models/models.ts:430](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L430)

___

### validation

• `Optional` **validation**: [TimestampPropertyValidationSchema](timestamppropertyvalidationschema.md)

Rules for validating this property

#### Overrides

BaseProperty.validation

#### Defined in

[models/models.ts:643](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L643)
