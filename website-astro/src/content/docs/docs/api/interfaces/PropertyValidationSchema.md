---
slug: "docs/api/interfaces/PropertyValidationSchema"
title: "PropertyValidationSchema"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / PropertyValidationSchema

# Interface: PropertyValidationSchema

Defined in: [types/src/types/properties.ts:715](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Rules to validate any property. Some properties have specific rules
additionally to these.

## Extended by

- [`NumberPropertyValidationSchema`](NumberPropertyValidationSchema)
- [`StringPropertyValidationSchema`](StringPropertyValidationSchema)
- [`DatePropertyValidationSchema`](DatePropertyValidationSchema)
- [`ArrayPropertyValidationSchema`](ArrayPropertyValidationSchema)

## Properties

### required?

> `optional` **required**: `boolean`

Defined in: [types/src/types/properties.ts:719](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Is this field required

***

### requiredMessage?

> `optional` **requiredMessage**: `string`

Defined in: [types/src/types/properties.ts:724](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Customize the required message when the property is not set

***

### unique?

> `optional` **unique**: `boolean`

Defined in: [types/src/types/properties.ts:730](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

***

### uniqueInArray?

> `optional` **uniqueInArray**: `boolean`

Defined in: [types/src/types/properties.ts:738](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`
