---
slug: "docs/api/interfaces/NumberPropertyValidationSchema"
title: "NumberPropertyValidationSchema"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / NumberPropertyValidationSchema

# Interface: NumberPropertyValidationSchema

Defined in: [types/properties.ts:715](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Validation rules for numbers

## Extends

- [`PropertyValidationSchema`](PropertyValidationSchema)

## Properties

### integer?

> `optional` **integer**: `boolean`

Defined in: [types/properties.ts:722](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

***

### lessThan?

> `optional` **lessThan**: `number`

Defined in: [types/properties.ts:718](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

***

### max?

> `optional` **max**: `number`

Defined in: [types/properties.ts:717](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

***

### min?

> `optional` **min**: `number`

Defined in: [types/properties.ts:716](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

***

### moreThan?

> `optional` **moreThan**: `number`

Defined in: [types/properties.ts:719](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

***

### negative?

> `optional` **negative**: `boolean`

Defined in: [types/properties.ts:721](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

***

### positive?

> `optional` **positive**: `boolean`

Defined in: [types/properties.ts:720](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

***

### required?

> `optional` **required**: `boolean`

Defined in: [types/properties.ts:689](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Is this field required

#### Inherited from

[`PropertyValidationSchema`](PropertyValidationSchema).[`required`](PropertyValidationSchema.md#required)

***

### requiredMessage?

> `optional` **requiredMessage**: `string`

Defined in: [types/properties.ts:694](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Customize the required message when the property is not set

#### Inherited from

[`PropertyValidationSchema`](PropertyValidationSchema).[`requiredMessage`](PropertyValidationSchema.md#requiredmessage)

***

### unique?

> `optional` **unique**: `boolean`

Defined in: [types/properties.ts:700](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

#### Inherited from

[`PropertyValidationSchema`](PropertyValidationSchema).[`unique`](PropertyValidationSchema.md#unique)

***

### uniqueInArray?

> `optional` **uniqueInArray**: `boolean`

Defined in: [types/properties.ts:708](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`

#### Inherited from

[`PropertyValidationSchema`](PropertyValidationSchema).[`uniqueInArray`](PropertyValidationSchema.md#uniqueinarray)
