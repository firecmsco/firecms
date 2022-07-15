---
id: "ArrayPropertyValidationSchema"
title: "Interface: ArrayPropertyValidationSchema"
sidebar_label: "ArrayPropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Validation rules for arrays

## Hierarchy

- [`PropertyValidationSchema`](PropertyValidationSchema)

  ↳ **`ArrayPropertyValidationSchema`**

## Properties

### max

• `Optional` **max**: `number`

#### Defined in

[models/properties.ts:515](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L515)

___

### min

• `Optional` **min**: `number`

#### Defined in

[models/properties.ts:514](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L514)

___

### required

• `Optional` **required**: `boolean`

Is this field required

#### Inherited from

[PropertyValidationSchema](PropertyValidationSchema).[required](PropertyValidationSchema#required)

#### Defined in

[models/properties.ts:444](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L444)

___

### requiredMessage

• `Optional` **requiredMessage**: `string`

Customize the required message when the property is not set

#### Inherited from

[PropertyValidationSchema](PropertyValidationSchema).[requiredMessage](PropertyValidationSchema#requiredmessage)

#### Defined in

[models/properties.ts:449](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L449)

___

### unique

• `Optional` **unique**: `boolean`

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

#### Inherited from

[PropertyValidationSchema](PropertyValidationSchema).[unique](PropertyValidationSchema#unique)

#### Defined in

[models/properties.ts:455](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L455)

___

### uniqueInArray

• `Optional` **uniqueInArray**: `boolean`

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`

#### Inherited from

[PropertyValidationSchema](PropertyValidationSchema).[uniqueInArray](PropertyValidationSchema#uniqueinarray)

#### Defined in

[models/properties.ts:463](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L463)
