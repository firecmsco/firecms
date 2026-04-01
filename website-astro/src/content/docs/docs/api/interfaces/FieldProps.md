---
slug: "docs/api/interfaces/FieldProps"
title: "FieldProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / FieldProps

# Interface: FieldProps\<P, CustomProps, M\>

Defined in: [types/src/types/fields.tsx:38](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

When building a custom field you need to create a React component that takes
this interface as props.

## Type Parameters

### P

`P` *extends* [`Property`](../type-aliases/Property) = [`Property`](../type-aliases/Property)

### CustomProps

`CustomProps` = `any`

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### autoFocus?

> `optional` **autoFocus**: `boolean`

Defined in: [types/src/types/fields.tsx:127](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Should this field autofocus on mount

***

### context

> **context**: [`FormContext`](FormContext)\<`M`\>

Defined in: [types/src/types/fields.tsx:137](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Additional values related to the state of the form or the entity

***

### customProps

> **customProps**: `CustomProps`

Defined in: [types/src/types/fields.tsx:132](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Additional properties set by the developer

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [types/src/types/fields.tsx:142](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Flag to indicate if this field should be disabled

***

### error?

> `optional` **error**: `string`

Defined in: [types/src/types/fields.tsx:85](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Is there an error in this field. The error field has the same shape as
the field, replacing values with a string containing the error.
It takes the value `null` if there is no error

***

### includeDescription?

> `optional` **includeDescription**: `boolean`

Defined in: [types/src/types/fields.tsx:100](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Should this field include a description

***

### isSubmitting?

> `optional` **isSubmitting**: `boolean`

Defined in: [types/src/types/fields.tsx:70](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Is the form currently submitting

***

### minimalistView?

> `optional` **minimalistView**: `boolean`

Defined in: [types/src/types/fields.tsx:122](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Display the child properties directly, without being wrapped in an
extendable panel. Note that this will also hide the title of this property.

***

### onPropertyChange()?

> `optional` **onPropertyChange**: (`property`) => `void`

Defined in: [types/src/types/fields.tsx:156](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Some properties might change internal state (like expanding a panel).
This function should be called when the internal state changes.
This is used to preserve state in array containers.

#### Parameters

##### property

`Partial`\<[`Property`](../type-aliases/Property)\>

#### Returns

`void`

***

### partOfArray?

> `optional` **partOfArray**: `boolean`

Defined in: [types/src/types/fields.tsx:111](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Is this field part of an array

***

### partOfBlock?

> `optional` **partOfBlock**: `boolean`

Defined in: [types/src/types/fields.tsx:116](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Is this field part of a block

***

### property

> **property**: `P`

Defined in: [types/src/types/fields.tsx:95](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Property related to this field, now strongly typed to P

***

### propertyKey

> **propertyKey**: `string`

Defined in: [types/src/types/fields.tsx:47](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Key of the property
E.g. "user.name" for a property with path "user.name"

***

### setFieldValue()

> **setFieldValue**: (`propertyKey`, `value`, `shouldValidate?`) => `void`

Defined in: [types/src/types/fields.tsx:65](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Set value of a different field directly

#### Parameters

##### propertyKey

`string`

##### value

`unknown`

##### shouldValidate?

`boolean`

#### Returns

`void`

***

### setValue()

> **setValue**: (`value`, `shouldValidate?`) => `void`

Defined in: [types/src/types/fields.tsx:57](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Set value of field directly

#### Parameters

##### value

[`InferPropertyType`](../type-aliases/InferPropertyType)\<`P`\> | `null`

##### shouldValidate?

`boolean`

#### Returns

`void`

***

### showError?

> `optional` **showError**: `boolean`

Defined in: [types/src/types/fields.tsx:78](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Should this field show the error indicator.
Note that there might be an error (like an empty field that should be
filled) but we don't want to show the error until the user has tried
saving.

***

### size?

> `optional` **size**: `"small"` \| `"medium"` \| `"large"`

Defined in: [types/src/types/fields.tsx:147](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Size of the field

***

### touched?

> `optional` **touched**: `boolean`

Defined in: [types/src/types/fields.tsx:90](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Has this field been touched

***

### underlyingValueHasChanged?

> `optional` **underlyingValueHasChanged**: `boolean`

Defined in: [types/src/types/fields.tsx:106](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Flag to indicate that the underlying value has been updated in the
datasource

***

### value

> **value**: [`InferPropertyType`](../type-aliases/InferPropertyType)\<`P`\>

Defined in: [types/src/types/fields.tsx:52](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Current value of this field, inferred from the property type P
