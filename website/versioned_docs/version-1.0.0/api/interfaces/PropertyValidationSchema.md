---
id: "PropertyValidationSchema"
title: "Interface: PropertyValidationSchema"
sidebar_label: "PropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Rules to validate any property. Some properties have specific rules
additionally to these.

## Hierarchy

- **`PropertyValidationSchema`**

  ↳ [`NumberPropertyValidationSchema`](NumberPropertyValidationSchema)

  ↳ [`StringPropertyValidationSchema`](StringPropertyValidationSchema)

  ↳ [`TimestampPropertyValidationSchema`](TimestampPropertyValidationSchema)

  ↳ [`ArrayPropertyValidationSchema`](ArrayPropertyValidationSchema)

## Properties

### required

• `Optional` **required**: `boolean`

Is this field required

#### Defined in

[models/properties.ts:444](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L444)

___

### requiredMessage

• `Optional` **requiredMessage**: `string`

Customize the required message when the property is not set

#### Defined in

[models/properties.ts:449](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L449)

___

### unique

• `Optional` **unique**: `boolean`

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

#### Defined in

[models/properties.ts:455](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L455)

___

### uniqueInArray

• `Optional` **uniqueInArray**: `boolean`

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`

#### Defined in

[models/properties.ts:463](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L463)
