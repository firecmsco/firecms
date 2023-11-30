---
id: "DatePropertyValidationSchema"
title: "Interface: DatePropertyValidationSchema"
sidebar_label: "DatePropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Validation rules for dates

## Hierarchy

- [`PropertyValidationSchema`](PropertyValidationSchema.md)

  ↳ **`DatePropertyValidationSchema`**

## Properties

### max

• `Optional` **max**: `Date`

#### Defined in

[packages/firecms_core/src/types/properties.ts:682](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L682)

___

### min

• `Optional` **min**: `Date`

#### Defined in

[packages/firecms_core/src/types/properties.ts:681](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L681)

___

### required

• `Optional` **required**: `boolean`

Is this field required

#### Inherited from

[PropertyValidationSchema](PropertyValidationSchema.md).[required](PropertyValidationSchema.md#required)

#### Defined in

[packages/firecms_core/src/types/properties.ts:622](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L622)

___

### requiredMessage

• `Optional` **requiredMessage**: `string`

Customize the required message when the property is not set

#### Inherited from

[PropertyValidationSchema](PropertyValidationSchema.md).[requiredMessage](PropertyValidationSchema.md#requiredmessage)

#### Defined in

[packages/firecms_core/src/types/properties.ts:627](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L627)

___

### unique

• `Optional` **unique**: `boolean`

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

#### Inherited from

[PropertyValidationSchema](PropertyValidationSchema.md).[unique](PropertyValidationSchema.md#unique)

#### Defined in

[packages/firecms_core/src/types/properties.ts:633](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L633)

___

### uniqueInArray

• `Optional` **uniqueInArray**: `boolean`

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`

#### Inherited from

[PropertyValidationSchema](PropertyValidationSchema.md).[uniqueInArray](PropertyValidationSchema.md#uniqueinarray)

#### Defined in

[packages/firecms_core/src/types/properties.ts:641](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L641)
