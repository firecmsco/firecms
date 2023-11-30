---
id: "NumberPropertyValidationSchema"
title: "Interface: NumberPropertyValidationSchema"
sidebar_label: "NumberPropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Validation rules for numbers

## Hierarchy

- [`PropertyValidationSchema`](PropertyValidationSchema.md)

  ↳ **`NumberPropertyValidationSchema`**

## Properties

### integer

• `Optional` **integer**: `boolean`

#### Defined in

[packages/firecms_core/src/types/properties.ts:655](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L655)

___

### lessThan

• `Optional` **lessThan**: `number`

#### Defined in

[packages/firecms_core/src/types/properties.ts:651](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L651)

___

### max

• `Optional` **max**: `number`

#### Defined in

[packages/firecms_core/src/types/properties.ts:650](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L650)

___

### min

• `Optional` **min**: `number`

#### Defined in

[packages/firecms_core/src/types/properties.ts:649](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L649)

___

### moreThan

• `Optional` **moreThan**: `number`

#### Defined in

[packages/firecms_core/src/types/properties.ts:652](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L652)

___

### negative

• `Optional` **negative**: `boolean`

#### Defined in

[packages/firecms_core/src/types/properties.ts:654](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L654)

___

### positive

• `Optional` **positive**: `boolean`

#### Defined in

[packages/firecms_core/src/types/properties.ts:653](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L653)

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
