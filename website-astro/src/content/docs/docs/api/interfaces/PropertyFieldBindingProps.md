---
slug: "docs/api/interfaces/PropertyFieldBindingProps"
title: "PropertyFieldBindingProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / PropertyFieldBindingProps

# Interface: PropertyFieldBindingProps\<M\>

Defined in: [types/src/types/fields.tsx:222](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

In case you need to render a field bound to a Property inside your
custom field you can use [PropertyFieldBinding](../variables/PropertyFieldBinding) with these props.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### autoFocus?

> `optional` **autoFocus**: `boolean`

Defined in: [types/src/types/fields.tsx:272](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Should the field take focus when rendered. When opening the popup view
in table mode, it makes sense to put the focus on the only field rendered.

***

### context

> **context**: [`FormContext`](FormContext)\<`M`\>

Defined in: [types/src/types/fields.tsx:239](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

The context where this field is being rendered. You get a context as a
prop when creating a custom field.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [types/src/types/fields.tsx:277](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Should this field be disabled

***

### includeDescription?

> `optional` **includeDescription**: `boolean`

Defined in: [types/src/types/fields.tsx:244](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Should the description be included in this field

***

### index?

> `optional` **index**: `number`

Defined in: [types/src/types/fields.tsx:283](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Index of the field in the array.
Only used when the field is part of an array.

***

### minimalistView?

> `optional` **minimalistView**: `boolean`

Defined in: [types/src/types/fields.tsx:266](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Display the child properties directly, without being wrapped in an
extendable panel. Note that this will also hide the title of this property.

***

### onPropertyChange()?

> `optional` **onPropertyChange**: (`property`) => `void`

Defined in: [types/src/types/fields.tsx:297](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

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

Defined in: [types/src/types/fields.tsx:255](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Is this field part of an array

***

### partOfBlock?

> `optional` **partOfBlock**: `boolean`

Defined in: [types/src/types/fields.tsx:260](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Is this field part of a block

***

### property

> **property**: [`Property`](../type-aliases/Property)

Defined in: [types/src/types/fields.tsx:233](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

The CMS property you are binding this field to

***

### propertyKey

> **propertyKey**: `string`

Defined in: [types/src/types/fields.tsx:228](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

The key/path of the property, such as `age`. You can use nested and array
indexed such as `address.street` or `people[3]`

***

### size?

> `optional` **size**: `"small"` \| `"medium"` \| `"large"`

Defined in: [types/src/types/fields.tsx:288](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

The size of the field

***

### underlyingValueHasChanged?

> `optional` **underlyingValueHasChanged**: `boolean`

Defined in: [types/src/types/fields.tsx:250](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/fields.tsx)

Has the value of this property been updated in the database while this
field is being edited
