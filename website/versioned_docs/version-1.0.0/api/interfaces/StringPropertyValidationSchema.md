---
id: "StringPropertyValidationSchema"
title: "Interface: StringPropertyValidationSchema"
sidebar_label: "StringPropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Validation rules for strings

## Hierarchy

- [`PropertyValidationSchema`](PropertyValidationSchema)

  ↳ **`StringPropertyValidationSchema`**

## Properties

### email

• `Optional` **email**: `boolean`

#### Defined in

[models/properties.ts:493](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L493)

___

### length

• `Optional` **length**: `number`

#### Defined in

[models/properties.ts:485](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L485)

___

### lowercase

• `Optional` **lowercase**: `boolean`

#### Defined in

[models/properties.ts:496](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L496)

___

### matches

• `Optional` **matches**: `RegExp`

#### Defined in

[models/properties.ts:488](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L488)

___

### matchesMessage

• `Optional` **matchesMessage**: `string`

Message displayed when the input does not satisfy the regex in `matches`

#### Defined in

[models/properties.ts:492](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L492)

___

### max

• `Optional` **max**: `number`

#### Defined in

[models/properties.ts:487](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L487)

___

### min

• `Optional` **min**: `number`

#### Defined in

[models/properties.ts:486](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L486)

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

### trim

• `Optional` **trim**: `boolean`

#### Defined in

[models/properties.ts:495](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L495)

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

___

### uppercase

• `Optional` **uppercase**: `boolean`

#### Defined in

[models/properties.ts:497](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L497)

___

### url

• `Optional` **url**: `boolean`

#### Defined in

[models/properties.ts:494](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L494)
