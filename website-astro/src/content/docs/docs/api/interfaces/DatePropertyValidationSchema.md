---
slug: "docs/api/interfaces/DatePropertyValidationSchema"
title: "DatePropertyValidationSchema"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DatePropertyValidationSchema

# Interface: DatePropertyValidationSchema

Defined in: [types/src/types/properties.ts:777](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Validation rules for dates

## Extends

- [`PropertyValidationSchema`](PropertyValidationSchema)

## Properties

### max?

> `optional` **max**: `Date`

Defined in: [types/src/types/properties.ts:779](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

***

### min?

> `optional` **min**: `Date`

Defined in: [types/src/types/properties.ts:778](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

***

### required?

> `optional` **required**: `boolean`

Defined in: [types/src/types/properties.ts:719](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Is this field required

#### Inherited from

[`PropertyValidationSchema`](PropertyValidationSchema).[`required`](PropertyValidationSchema.md#required)

***

### requiredMessage?

> `optional` **requiredMessage**: `string`

Defined in: [types/src/types/properties.ts:724](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Customize the required message when the property is not set

#### Inherited from

[`PropertyValidationSchema`](PropertyValidationSchema).[`requiredMessage`](PropertyValidationSchema.md#requiredmessage)

***

### unique?

> `optional` **unique**: `boolean`

Defined in: [types/src/types/properties.ts:730](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

#### Inherited from

[`PropertyValidationSchema`](PropertyValidationSchema).[`unique`](PropertyValidationSchema.md#unique)

***

### uniqueInArray?

> `optional` **uniqueInArray**: `boolean`

Defined in: [types/src/types/properties.ts:738](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`

#### Inherited from

[`PropertyValidationSchema`](PropertyValidationSchema).[`uniqueInArray`](PropertyValidationSchema.md#uniqueinarray)
