---
slug: "docs/api/type-aliases/EntityFormProps"
title: "EntityFormProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityFormProps

# Type Alias: EntityFormProps\<M\>

> **EntityFormProps**\<`M`\> = `object`

Defined in: [types/src/components/EntityFormProps.tsx:5](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Properties

### Builder?

> `optional` **Builder**: `React.ComponentType`\<[`EntityCustomViewParams`](../interfaces/EntityCustomViewParams)\<`M`\>\>

Defined in: [types/src/components/EntityFormProps.tsx:40](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### children?

> `optional` **children**: `React.ReactNode`

Defined in: [types/src/components/EntityFormProps.tsx:42](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### className?

> `optional` **className**: `string`

Defined in: [types/src/components/EntityFormProps.tsx:18](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### collection

> **collection**: [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

Defined in: [types/src/components/EntityFormProps.tsx:8](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### databaseId?

> `optional` **databaseId**: `string`

Defined in: [types/src/components/EntityFormProps.tsx:11](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [types/src/components/EntityFormProps.tsx:27](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

If true, the form will be disabled and no actions will be available

***

### entity?

> `optional` **entity**: [`Entity`](../interfaces/Entity)\<`M`\>

Defined in: [types/src/components/EntityFormProps.tsx:10](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### EntityFormActionsComponent?

> `optional` **EntityFormActionsComponent**: `React.FC`\<[`EntityFormActionsProps`](../interfaces/EntityFormActionsProps)\>

Defined in: [types/src/components/EntityFormProps.tsx:38](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### entityId?

> `optional` **entityId**: `string` \| `number`

Defined in: [types/src/components/EntityFormProps.tsx:9](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### forceActionsAtTheBottom?

> `optional` **forceActionsAtTheBottom**: `boolean`

Defined in: [types/src/components/EntityFormProps.tsx:17](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### formex?

> `optional` **formex**: `FormexController`\<`M`\>

Defined in: [types/src/components/EntityFormProps.tsx:22](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### fullIdPath?

> `optional` **fullIdPath**: `string`

Defined in: [types/src/components/EntityFormProps.tsx:7](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### initialDirtyValues?

> `optional` **initialDirtyValues**: `Partial`\<`M`\>

Defined in: [types/src/components/EntityFormProps.tsx:15](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### initialStatus

> **initialStatus**: [`EntityStatus`](EntityStatus)

Defined in: [types/src/components/EntityFormProps.tsx:19](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### onEntityChange()?

> `optional` **onEntityChange**: (`entity`) => `void`

Defined in: [types/src/components/EntityFormProps.tsx:21](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`void`

***

### onFormContextReady()?

> `optional` **onFormContextReady**: (`formContext`) => `void`

Defined in: [types/src/components/EntityFormProps.tsx:16](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

#### Parameters

##### formContext

[`FormContext`](../interfaces/FormContext)

#### Returns

`void`

***

### onIdChange()?

> `optional` **onIdChange**: (`id`) => `void`

Defined in: [types/src/components/EntityFormProps.tsx:12](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

#### Parameters

##### id

`string` | `number`

#### Returns

`void`

***

### onSaved()?

> `optional` **onSaved**: (`params`) => `void`

Defined in: [types/src/components/EntityFormProps.tsx:14](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

#### Parameters

##### params

[`OnUpdateParams`](OnUpdateParams)

#### Returns

`void`

***

### onStatusChange()?

> `optional` **onStatusChange**: (`status`) => `void`

Defined in: [types/src/components/EntityFormProps.tsx:20](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

#### Parameters

##### status

[`EntityStatus`](EntityStatus)

#### Returns

`void`

***

### onValuesModified()?

> `optional` **onValuesModified**: (`modified`, `values`) => `void`

Defined in: [types/src/components/EntityFormProps.tsx:13](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

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

Defined in: [types/src/components/EntityFormProps.tsx:23](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### path

> **path**: `string`

Defined in: [types/src/components/EntityFormProps.tsx:6](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

***

### showDefaultActions?

> `optional` **showDefaultActions**: `boolean`

Defined in: [types/src/components/EntityFormProps.tsx:31](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

Include the copy and delete actions in the form

***

### showEntityPath?

> `optional` **showEntityPath**: `boolean`

Defined in: [types/src/components/EntityFormProps.tsx:36](https://github.com/rebaseco/rebase/blob/main/packages/types/src/components/EntityFormProps.tsx)

Display the entity path in the form
