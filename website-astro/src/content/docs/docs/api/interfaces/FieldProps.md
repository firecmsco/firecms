---
slug: "docs/api/interfaces/FieldProps"
title: "FieldProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / FieldProps

# Interface: FieldProps\<T, CustomProps, M\>

Defined in: [types/fields.tsx:12](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

When building a custom field you need to create a React component that takes
this interface as props.

## Type Parameters

### T

`T` *extends* [`CMSType`](../type-aliases/CMSType) = `any`

### CustomProps

`CustomProps` = `any`

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### autoFocus?

> `optional` **autoFocus**: `boolean`

Defined in: [types/fields.tsx:93](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Should this field autofocus on mount

***

### context

> **context**: [`FormContext`](FormContext)\<`M`\>

Defined in: [types/fields.tsx:103](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Additional values related to the state of the form or the entity

***

### customProps

> **customProps**: `CustomProps`

Defined in: [types/fields.tsx:98](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Additional properties set by the developer

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [types/fields.tsx:108](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Flag to indicate if this field should be disabled

***

### error?

> `optional` **error**: `any`

Defined in: [types/fields.tsx:56](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Is there an error in this field. The error field has the same shape as
the field, replacing values with a string containing the error.
It takes the value `null` if there is no error

***

### includeDescription?

> `optional` **includeDescription**: `boolean`

Defined in: [types/fields.tsx:71](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Should this field include a description

***

### isSubmitting?

> `optional` **isSubmitting**: `boolean`

Defined in: [types/fields.tsx:41](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Is the form currently submitting

***

### minimalistView?

> `optional` **minimalistView**: `boolean`

Defined in: [types/fields.tsx:88](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Display the child properties directly, without being wrapped in an
extendable panel. Note that this will also hide the title of this property.

***

### onPropertyChange()?

> `optional` **onPropertyChange**: (`property`) => `void`

Defined in: [types/fields.tsx:122](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Some properties might change internal state (like expanding a panel).
This function should be called when the internal state changes.
This is used to preserve state in array containers.

#### Parameters

##### property

`Partial`\<[`ArrayProperty`](ArrayProperty)\<`any`, `any`\> \| [`MapProperty`](MapProperty)\<`any`\> \| `AnyProperty`\>

#### Returns

`void`

***

### partOfArray?

> `optional` **partOfArray**: `boolean`

Defined in: [types/fields.tsx:82](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Is this field part of an array

***

### property

> **property**: [`Property`](../type-aliases/Property)\<`T`\> \| [`ResolvedProperty`](../type-aliases/ResolvedProperty)\<`T`\>

Defined in: [types/fields.tsx:66](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Property related to this field

***

### propertyKey

> **propertyKey**: `string`

Defined in: [types/fields.tsx:18](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Key of the property
E.g. "user.name" for a property with path "user.name"

***

### setFieldValue()

> **setFieldValue**: (`propertyKey`, `value`, `shouldValidate?`) => `void`

Defined in: [types/fields.tsx:36](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Set value of a different field directly

#### Parameters

##### propertyKey

`string`

##### value

[`CMSType`](../type-aliases/CMSType) | `null`

##### shouldValidate?

`boolean`

#### Returns

`void`

***

### setValue()

> **setValue**: (`value`, `shouldValidate?`) => `void`

Defined in: [types/fields.tsx:28](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Set value of field directly

#### Parameters

##### value

`T` | `null`

##### shouldValidate?

`boolean`

#### Returns

`void`

***

### showError?

> `optional` **showError**: `boolean`

Defined in: [types/fields.tsx:49](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Should this field show the error indicator.
Note that there might be an error (like an empty field that should be
filled) but we don't want to show the error until the user has tried
saving.

***

### size?

> `optional` **size**: `"small"` \| `"medium"` \| `"large"`

Defined in: [types/fields.tsx:113](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Size of the field

***

### touched?

> `optional` **touched**: `boolean`

Defined in: [types/fields.tsx:61](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Has this field been touched

***

### underlyingValueHasChanged?

> `optional` **underlyingValueHasChanged**: `boolean`

Defined in: [types/fields.tsx:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Flag to indicate that the underlying value has been updated in the
datasource

***

### value

> **value**: `T`

Defined in: [types/fields.tsx:23](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Current value of this field
