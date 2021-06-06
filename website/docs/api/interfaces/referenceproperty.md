---
id: "referenceproperty"
title: "Interface: ReferenceProperty<S, Key>"
sidebar_label: "ReferenceProperty"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> = [EntitySchema](entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

## Hierarchy

- `BaseProperty`

  ↳ **ReferenceProperty**

## Properties

### collectionPath

• **collectionPath**: `string`

Absolute collection path of the collection this reference points to.
The schema of the entity is inferred based on the root navigation, so
the filters and search delegate existing there are applied to this view
as well.

#### Defined in

[models/models.ts:686](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L686)

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

• `Optional` **config**: [FieldConfig](fieldconfig.md)<DocumentReference<DocumentData\>, any\>

Configure how this property field is displayed

#### Defined in

[models/models.ts:698](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L698)

___

### dataType

• **dataType**: ``"reference"``

#### Overrides

BaseProperty.dataType

#### Defined in

[models/models.ts:678](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L678)

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

### previewProperties

• `Optional` **previewProperties**: `Key`[]

Properties that need to be rendered when displaying a preview of this
reference. If not specified the first 3 are used. Only the first 3
specified values are considered.

#### Defined in

[models/models.ts:693](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L693)

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

• `Optional` **validation**: [PropertyValidationSchema](propertyvalidationschema.md)

Rules for validating this property

#### Inherited from

BaseProperty.validation

#### Defined in

[models/models.ts:464](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L464)
