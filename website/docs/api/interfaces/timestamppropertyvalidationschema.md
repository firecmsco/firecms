---
id: "timestamppropertyvalidationschema"
title: "Interface: TimestampPropertyValidationSchema"
sidebar_label: "TimestampPropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Validation rules for dates

## Hierarchy

- [PropertyValidationSchema](propertyvalidationschema.md)

  ↳ **TimestampPropertyValidationSchema**

## Properties

### max

• `Optional` **max**: `Date`

#### Defined in

[models/properties.ts:382](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L382)

___

### min

• `Optional` **min**: `Date`

#### Defined in

[models/properties.ts:381](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L381)

___

### required

• `Optional` **required**: `boolean`

Is this field required

#### Inherited from

[PropertyValidationSchema](propertyvalidationschema.md).[required](propertyvalidationschema.md#required)

#### Defined in

[models/properties.ts:327](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L327)

___

### requiredMessage

• `Optional` **requiredMessage**: `string`

Customize the required message when the property is not set

#### Inherited from

[PropertyValidationSchema](propertyvalidationschema.md).[requiredMessage](propertyvalidationschema.md#requiredmessage)

#### Defined in

[models/properties.ts:332](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L332)

___

### unique

• `Optional` **unique**: `boolean`

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

#### Inherited from

[PropertyValidationSchema](propertyvalidationschema.md).[unique](propertyvalidationschema.md#unique)

#### Defined in

[models/properties.ts:338](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L338)

___

### uniqueInArray

• `Optional` **uniqueInArray**: `boolean`

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`

#### Inherited from

[PropertyValidationSchema](propertyvalidationschema.md).[uniqueInArray](propertyvalidationschema.md#uniqueinarray)

#### Defined in

[models/properties.ts:346](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L346)
