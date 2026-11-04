---
slug: "docs/api/interfaces/DatePropertyValidationSchema"
title: "DatePropertyValidationSchema"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / DatePropertyValidationSchema

# Interface: DatePropertyValidationSchema

Defined in: [types/properties.ts:747](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Validation rules for dates

## Extends

- [`PropertyValidationSchema`](/docs/api/interfaces/PropertyValidationSchema)

## Properties

### max?

> `optional` **max**: `Date`

Defined in: [types/properties.ts:749](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

***

### min?

> `optional` **min**: `Date`

Defined in: [types/properties.ts:748](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

***

### required?

> `optional` **required**: `boolean`

Defined in: [types/properties.ts:689](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Is this field required

#### Inherited from

[`PropertyValidationSchema`](/docs/api/interfaces/PropertyValidationSchema).[`required`](/docs/api/interfaces/PropertyValidationSchema#required)

***

### requiredMessage?

> `optional` **requiredMessage**: `string`

Defined in: [types/properties.ts:694](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Customize the required message when the property is not set

#### Inherited from

[`PropertyValidationSchema`](/docs/api/interfaces/PropertyValidationSchema).[`requiredMessage`](/docs/api/interfaces/PropertyValidationSchema#requiredmessage)

***

### unique?

> `optional` **unique**: `boolean`

Defined in: [types/properties.ts:700](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

#### Inherited from

[`PropertyValidationSchema`](/docs/api/interfaces/PropertyValidationSchema).[`unique`](/docs/api/interfaces/PropertyValidationSchema#unique)

***

### uniqueInArray?

> `optional` **uniqueInArray**: `boolean`

Defined in: [types/properties.ts:708](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`

#### Inherited from

[`PropertyValidationSchema`](/docs/api/interfaces/PropertyValidationSchema).[`uniqueInArray`](/docs/api/interfaces/PropertyValidationSchema#uniqueinarray)
