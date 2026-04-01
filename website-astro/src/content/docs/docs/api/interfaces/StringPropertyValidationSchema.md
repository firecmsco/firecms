---
slug: "docs/api/interfaces/StringPropertyValidationSchema"
title: "StringPropertyValidationSchema"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / StringPropertyValidationSchema

# Interface: StringPropertyValidationSchema

Defined in: [types/src/types/properties.ts:759](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Validation rules for strings

## Extends

- [`PropertyValidationSchema`](PropertyValidationSchema)

## Properties

### length?

> `optional` **length**: `number`

Defined in: [types/src/types/properties.ts:760](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

***

### lowercase?

> `optional` **lowercase**: `boolean`

Defined in: [types/src/types/properties.ts:769](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

***

### matches?

> `optional` **matches**: `string` \| `RegExp`

Defined in: [types/src/types/properties.ts:763](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

***

### matchesMessage?

> `optional` **matchesMessage**: `string`

Defined in: [types/src/types/properties.ts:767](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Message displayed when the input does not satisfy the regex in `matches`

***

### max?

> `optional` **max**: `number`

Defined in: [types/src/types/properties.ts:762](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

***

### min?

> `optional` **min**: `number`

Defined in: [types/src/types/properties.ts:761](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

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

### trim?

> `optional` **trim**: `boolean`

Defined in: [types/src/types/properties.ts:768](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

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

***

### uppercase?

> `optional` **uppercase**: `boolean`

Defined in: [types/src/types/properties.ts:770](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)
