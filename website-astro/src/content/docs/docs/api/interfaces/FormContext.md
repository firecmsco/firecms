---
slug: "docs/api/interfaces/FormContext"
title: "FormContext"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / FormContext

# Interface: FormContext\<M\>

Defined in: [types/src/types/fields.tsx:164](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

Context passed to custom fields

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection?

> `optional` **collection**: [`EntityCollection`](EntityCollection)\<`M`, `any`\>

Defined in: [types/src/types/fields.tsx:187](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

Collection of the entity being modified

***

### disabled

> **disabled**: `boolean`

Defined in: [types/src/types/fields.tsx:214](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

***

### entity?

> `optional` **entity**: [`Entity`](Entity)\<`M`\>

Defined in: [types/src/types/fields.tsx:201](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

***

### entityId?

> `optional` **entityId**: `string` \| `number`

Defined in: [types/src/types/fields.tsx:192](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

Entity id, it can be undefined if it's a new entity

***

### formex

> **formex**: `FormexController`\<`M`\>

Defined in: [types/src/types/fields.tsx:212](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

This is the underlying formex controller that powers the form.
If you are in a red only mode, the formex controller is there, but you can't
operate with it

***

### openEntityMode

> **openEntityMode**: `"side_panel"` \| `"full_screen"`

Defined in: [types/src/types/fields.tsx:205](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

***

### path?

> `optional` **path**: `string`

Defined in: [types/src/types/fields.tsx:197](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

Path this entity is located at

***

### save()

> **save**: (`values`) => `void`

Defined in: [types/src/types/fields.tsx:182](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

Save the entity.

#### Parameters

##### values

`M`

#### Returns

`void`

***

### savingError?

> `optional` **savingError**: `Error`

Defined in: [types/src/types/fields.tsx:203](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

***

### setFieldValue()

> **setFieldValue**: (`key`, `value`, `shouldValidate?`) => `void`

Defined in: [types/src/types/fields.tsx:177](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

Update the value of a field

#### Parameters

##### key

`string`

##### value

`unknown`

##### shouldValidate?

`boolean`

#### Returns

`void`

***

### status

> **status**: `"copy"` \| `"new"` \| `"existing"`

Defined in: [types/src/types/fields.tsx:199](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

***

### values

> **values**: `M`

Defined in: [types/src/types/fields.tsx:169](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/fields.tsx)

Current values of the entity
