---
id: "TimestampProperty"
title: "Interface: TimestampProperty"
sidebar_label: "TimestampProperty"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `BaseProperty`

  ↳ **`TimestampProperty`**

## Properties

### autoValue

• `Optional` **autoValue**: ``"on_create"`` \| ``"on_update"``

If this flag is  set to `on_create` or `on_update` this timestamp is
updated automatically on creation of the entity only or on every
update (including creation). Useful for creating `created_on` or
`updated_on` fields

#### Defined in

[models/properties.ts:377](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L377)

___

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

• `Optional` **config**: [`FieldConfig`](FieldConfig)<`Date`, `any`\>

Configure how this property field is displayed

#### Defined in

[models/properties.ts:382](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L382)

___

### dataType

• **dataType**: ``"timestamp"``

#### Overrides

BaseProperty.dataType

#### Defined in

[models/properties.ts:364](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L364)

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

• `Optional` **validation**: [`TimestampPropertyValidationSchema`](TimestampPropertyValidationSchema)

Rules for validating this property

#### Overrides

BaseProperty.validation

#### Defined in

[models/properties.ts:369](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L369)
