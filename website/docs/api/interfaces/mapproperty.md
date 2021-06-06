---
id: "mapproperty"
title: "Interface: MapProperty<T, Key>"
sidebar_label: "MapProperty"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` = `any` |
| `Key` | `Key`: `string` = `Extract`<keyof `T`, string\> |

## Hierarchy

- `BaseProperty`

  ↳ **MapProperty**

## Properties

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

• `Optional` **config**: [MapFieldConfig](mapfieldconfig.md)<T\>

Configure how this property field is displayed

#### Defined in

[models/models.ts:634](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L634)

___

### dataType

• **dataType**: ``"map"``

#### Overrides

BaseProperty.dataType

#### Defined in

[models/models.ts:614](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L614)

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

Properties that are displayed when as a preview

#### Defined in

[models/models.ts:629](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L629)

___

### properties

• `Optional` **properties**: [Properties](../types/properties.md)<Key, any\>

Record of properties included in this map.

#### Defined in

[models/models.ts:619](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L619)

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

#### Overrides

BaseProperty.validation

#### Defined in

[models/models.ts:624](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L624)
