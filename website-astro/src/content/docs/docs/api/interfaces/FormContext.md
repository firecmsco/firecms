---
slug: "docs/api/interfaces/FormContext"
title: "FormContext"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / FormContext

# Interface: FormContext\<M\>

Defined in: [types/fields.tsx:130](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Context passed to custom fields

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection?

> `optional` **collection**: [`ResolvedEntityCollection`](../type-aliases/ResolvedEntityCollection)\<`M`\>

Defined in: [types/fields.tsx:153](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Collection of the entity being modified

***

### disabled

> **disabled**: `boolean`

Defined in: [types/fields.tsx:180](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

***

### entity?

> `optional` **entity**: [`Entity`](Entity)\<`M`\>

Defined in: [types/fields.tsx:167](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

***

### entityId

> **entityId**: `string`

Defined in: [types/fields.tsx:158](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Entity id, it can be null if it's a new entity

***

### formex

> **formex**: `FormexController`\<`M`\>

Defined in: [types/fields.tsx:178](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

This is the underlying formex controller that powers the form.
If you are in a red only mode, the formex controller is there, but you can't
operate with it

***

### openEntityMode

> **openEntityMode**: `"side_panel"` \| `"full_screen"`

Defined in: [types/fields.tsx:171](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

***

### path?

> `optional` **path**: `string`

Defined in: [types/fields.tsx:163](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Path this entity is located at

***

### save()

> **save**: (`values`) => `void`

Defined in: [types/fields.tsx:148](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Save the entity.

#### Parameters

##### values

`M`

#### Returns

`void`

***

### savingError?

> `optional` **savingError**: `Error`

Defined in: [types/fields.tsx:169](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

***

### setFieldValue()

> **setFieldValue**: (`key`, `value`, `shouldValidate?`) => `void`

Defined in: [types/fields.tsx:143](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Update the value of a field

#### Parameters

##### key

`string`

##### value

`any`

##### shouldValidate?

`boolean`

#### Returns

`void`

***

### status

> **status**: `"copy"` \| `"new"` \| `"existing"`

Defined in: [types/fields.tsx:165](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

***

### values

> **values**: `M`

Defined in: [types/fields.tsx:135](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/fields.tsx)

Current values of the entity
