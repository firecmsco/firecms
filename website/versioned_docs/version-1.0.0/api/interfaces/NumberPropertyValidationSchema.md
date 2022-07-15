---
id: "NumberPropertyValidationSchema"
title: "Interface: NumberPropertyValidationSchema"
sidebar_label: "NumberPropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Validation rules for numbers

## Hierarchy

- [`PropertyValidationSchema`](PropertyValidationSchema)

  ↳ **`NumberPropertyValidationSchema`**

## Properties

### integer

• `Optional` **integer**: `boolean`

#### Defined in

[models/properties.ts:477](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L477)

___

### lessThan

• `Optional` **lessThan**: `number`

#### Defined in

[models/properties.ts:473](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L473)

___

### max

• `Optional` **max**: `number`

#### Defined in

[models/properties.ts:472](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L472)

___

### min

• `Optional` **min**: `number`

#### Defined in

[models/properties.ts:471](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L471)

___

### moreThan

• `Optional` **moreThan**: `number`

#### Defined in

[models/properties.ts:474](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L474)

___

### negative

• `Optional` **negative**: `boolean`

#### Defined in

[models/properties.ts:476](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L476)

___

### positive

• `Optional` **positive**: `boolean`

#### Defined in

[models/properties.ts:475](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L475)

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
