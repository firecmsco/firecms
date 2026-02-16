---
slug: "docs/api/interfaces/OnCellValueChangeParams"
title: "OnCellValueChangeParams"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / OnCellValueChangeParams

# Interface: OnCellValueChangeParams\<T, D\>

Defined in: [components/common/types.tsx:34](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)

Props passed in a callback when the content of a cell in a table has been edited

## Type Parameters

### T

`T` = `any`

### D

`D` = `any`

## Properties

### data?

> `optional` **data**: `D`

Defined in: [components/common/types.tsx:37](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)

***

### onValueUpdated()

> **onValueUpdated**: () => `void`

Defined in: [components/common/types.tsx:38](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)

#### Returns

`void`

***

### propertyKey

> **propertyKey**: `string`

Defined in: [components/common/types.tsx:36](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)

***

### setError()

> **setError**: (`e`) => `void`

Defined in: [components/common/types.tsx:39](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)

#### Parameters

##### e

`Error` | `undefined`

#### Returns

`void`

***

### value

> **value**: `T`

Defined in: [components/common/types.tsx:35](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/types.tsx)
