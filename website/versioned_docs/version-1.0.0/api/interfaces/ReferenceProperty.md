---
id: "ReferenceProperty"
title: "Interface: ReferenceProperty<M>"
sidebar_label: "ReferenceProperty"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` = `any` |

## Hierarchy

- `BaseProperty`

  ↳ **`ReferenceProperty`**

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

• `Optional` **config**: [`FieldConfig`](FieldConfig)<[`EntityReference`](../classes/EntityReference), `any`\>

Configure how this property field is displayed

#### Defined in

[models/properties.ts:432](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L432)

___

### dataType

• **dataType**: ``"reference"``

#### Overrides

BaseProperty.dataType

#### Defined in

[models/properties.ts:409](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L409)

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

### path

• **path**: `string` \| ``false``

Absolute collection path of the collection this reference points to.
The schema of the entity is inferred based on the root navigation, so
the filters and search delegate existing there are applied to this view
as well.
You can set this prop to `false` if the path is not yet know, e.g.
you are using a property builder and the path depends on a different
property.

#### Defined in

[models/properties.ts:420](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L420)

___

### previewProperties

• `Optional` **previewProperties**: keyof `M`[]

Properties that need to be rendered when displaying a preview of this
reference. If not specified the first 3 are used. Only the first 3
specified values are considered.

#### Defined in

[models/properties.ts:427](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L427)

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

#### Inherited from

BaseProperty.validation

#### Defined in

[models/properties.ts:114](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L114)
