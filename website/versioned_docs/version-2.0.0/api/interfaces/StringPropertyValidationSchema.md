---
id: "StringPropertyValidationSchema"
title: "Interface: StringPropertyValidationSchema"
sidebar_label: "StringPropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Validation rules for strings

## Hierarchy

- [`PropertyValidationSchema`](PropertyValidationSchema.md)

  ↳ **`StringPropertyValidationSchema`**

## Properties

### length

• `Optional` **length**: `number`

#### Defined in

[packages/firecms_core/src/types/properties.ts:663](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L663)

___

### lowercase

• `Optional` **lowercase**: `boolean`

#### Defined in

[packages/firecms_core/src/types/properties.ts:672](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L672)

___

### matches

• `Optional` **matches**: `string` \| `RegExp`

#### Defined in

[packages/firecms_core/src/types/properties.ts:666](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L666)

___

### matchesMessage

• `Optional` **matchesMessage**: `string`

Message displayed when the input does not satisfy the regex in `matches`

#### Defined in

[packages/firecms_core/src/types/properties.ts:670](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L670)

___

### max

• `Optional` **max**: `number`

#### Defined in

[packages/firecms_core/src/types/properties.ts:665](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L665)

___

### min

• `Optional` **min**: `number`

#### Defined in

[packages/firecms_core/src/types/properties.ts:664](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L664)

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

### trim

• `Optional` **trim**: `boolean`

#### Defined in

[packages/firecms_core/src/types/properties.ts:671](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L671)

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

___

### uppercase

• `Optional` **uppercase**: `boolean`

#### Defined in

[packages/firecms_core/src/types/properties.ts:673](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L673)
