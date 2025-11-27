---
slug: "docs/api/type-aliases/EntityFormProps"
title: "EntityFormProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityFormProps

# Type Alias: EntityFormProps\<M\>

> **EntityFormProps**\<`M`\> = `object`

Defined in: [form/EntityForm.tsx:67](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Properties

### Builder?

> `optional` **Builder**: `React.ComponentType`\<[`EntityCustomViewParams`](../interfaces/EntityCustomViewParams)\<`M`\>\>

Defined in: [form/EntityForm.tsx:102](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### children?

> `optional` **children**: `React.ReactNode`

Defined in: [form/EntityForm.tsx:104](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### className?

> `optional` **className**: `string`

Defined in: [form/EntityForm.tsx:80](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### collection

> **collection**: [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

Defined in: [form/EntityForm.tsx:70](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### databaseId?

> `optional` **databaseId**: `string`

Defined in: [form/EntityForm.tsx:73](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [form/EntityForm.tsx:89](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

If true, the form will be disabled and no actions will be available

***

### entity?

> `optional` **entity**: [`Entity`](../interfaces/Entity)\<`M`\>

Defined in: [form/EntityForm.tsx:72](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### EntityFormActionsComponent?

> `optional` **EntityFormActionsComponent**: `React.FC`\<`EntityFormActionsProps`\>

Defined in: [form/EntityForm.tsx:100](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### entityId?

> `optional` **entityId**: `string`

Defined in: [form/EntityForm.tsx:71](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### forceActionsAtTheBottom?

> `optional` **forceActionsAtTheBottom**: `boolean`

Defined in: [form/EntityForm.tsx:79](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### formex?

> `optional` **formex**: `FormexController`\<`M`\>

Defined in: [form/EntityForm.tsx:84](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### fullIdPath?

> `optional` **fullIdPath**: `string`

Defined in: [form/EntityForm.tsx:69](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### initialDirtyValues?

> `optional` **initialDirtyValues**: `Partial`\<`M`\>

Defined in: [form/EntityForm.tsx:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### initialStatus

> **initialStatus**: [`EntityStatus`](EntityStatus)

Defined in: [form/EntityForm.tsx:81](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### onEntityChange()?

> `optional` **onEntityChange**: (`entity`) => `void`

Defined in: [form/EntityForm.tsx:83](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`void`

***

### onFormContextReady()?

> `optional` **onFormContextReady**: (`formContext`) => `void`

Defined in: [form/EntityForm.tsx:78](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

#### Parameters

##### formContext

[`FormContext`](../interfaces/FormContext)

#### Returns

`void`

***

### onIdChange()?

> `optional` **onIdChange**: (`id`) => `void`

Defined in: [form/EntityForm.tsx:74](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### onSaved()?

> `optional` **onSaved**: (`params`) => `void`

Defined in: [form/EntityForm.tsx:76](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

#### Parameters

##### params

`OnUpdateParams`

#### Returns

`void`

***

### onStatusChange()?

> `optional` **onStatusChange**: (`status`) => `void`

Defined in: [form/EntityForm.tsx:82](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

#### Parameters

##### status

[`EntityStatus`](EntityStatus)

#### Returns

`void`

***

### onValuesModified()?

> `optional` **onValuesModified**: (`modified`, `values`) => `void`

Defined in: [form/EntityForm.tsx:75](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

#### Parameters

##### modified

`boolean`

##### values

`M`

#### Returns

`void`

***

### openEntityMode?

> `optional` **openEntityMode**: `"side_panel"` \| `"full_screen"`

Defined in: [form/EntityForm.tsx:85](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### path

> **path**: `string`

Defined in: [form/EntityForm.tsx:68](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

***

### showDefaultActions?

> `optional` **showDefaultActions**: `boolean`

Defined in: [form/EntityForm.tsx:93](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

Include the copy and delete actions in the form

***

### showEntityPath?

> `optional` **showEntityPath**: `boolean`

Defined in: [form/EntityForm.tsx:98](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/EntityForm.tsx)

Display the entity path in the form
