---
slug: "docs/api/interfaces/PropertyDisabledConfig"
title: "PropertyDisabledConfig"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / PropertyDisabledConfig

# Interface: PropertyDisabledConfig

Defined in: [types/properties.ts:171](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Properties

### clearOnDisabled?

> `optional` **clearOnDisabled**: `boolean`

Defined in: [types/properties.ts:180](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Enable this flag if you would like to clear the value of the field
when the corresponding property gets disabled.

This is useful for keeping data consistency when you have conditional
properties.

***

### disabledMessage?

> `optional` **disabledMessage**: `string`

Defined in: [types/properties.ts:186](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Explanation of why this property is disabled (e.g. a different field
needs to be enabled)

***

### hidden?

> `optional` **hidden**: `boolean`

Defined in: [types/properties.ts:191](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Set this flag to true if you want to hide this field when disabled
