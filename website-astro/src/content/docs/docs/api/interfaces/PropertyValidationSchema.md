---
slug: "docs/api/interfaces/PropertyValidationSchema"
title: "PropertyValidationSchema"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / PropertyValidationSchema

# Interface: PropertyValidationSchema

Defined in: [types/properties.ts:685](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

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

Defined in: [types/properties.ts:689](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Is this field required

***

### requiredMessage?

> `optional` **requiredMessage**: `string`

Defined in: [types/properties.ts:694](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Customize the required message when the property is not set

***

### unique?

> `optional` **unique**: `boolean`

Defined in: [types/properties.ts:700](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

***

### uniqueInArray?

> `optional` **uniqueInArray**: `boolean`

Defined in: [types/properties.ts:708](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`
