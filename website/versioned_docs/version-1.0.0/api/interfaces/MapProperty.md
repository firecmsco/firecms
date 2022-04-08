---
id: "MapProperty"
title: "Interface: MapProperty<T>"
sidebar_label: "MapProperty"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` = `any` |

## Hierarchy

- `BaseProperty`

  ↳ **`MapProperty`**

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

• `Optional` **config**: [`MapFieldConfig`](MapFieldConfig)<`T`\>

Configure how this property field is displayed

#### Defined in

[models/properties.ts:357](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L357)

___

### dataType

• **dataType**: ``"map"``

#### Overrides

BaseProperty.dataType

#### Defined in

[models/properties.ts:337](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L337)

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

### previewProperties

• `Optional` **previewProperties**: `Extract`<keyof `T`, `string`\>[]

Properties that are displayed when as a preview

#### Defined in

[models/properties.ts:352](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L352)

___

### properties

• `Optional` **properties**: [`Properties`](../types/Properties)<`Partial`<`T`\>\>

Record of properties included in this map.

#### Defined in

[models/properties.ts:342](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L342)

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

• `Optional` **validation**: [`PropertyValidationSchema`](PropertyValidationSchema)

Rules for validating this property

#### Overrides

BaseProperty.validation

#### Defined in

[models/properties.ts:347](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L347)
