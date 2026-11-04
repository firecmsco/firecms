---
slug: "docs/api/type-aliases/DeleteEntityWithCallbacksProps"
title: "DeleteEntityWithCallbacksProps"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / DeleteEntityWithCallbacksProps

# Type Alias: DeleteEntityWithCallbacksProps\<M, USER\>

> **DeleteEntityWithCallbacksProps**\<`M`, `USER`\> = [`DeleteEntityProps`](/docs/api/interfaces/DeleteEntityProps)\<`M`\> & `object`

Defined in: [hooks/data/delete.ts:15](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/delete.ts)

## Type Declaration

### callbacks?

> `optional` **callbacks**: [`EntityCallbacks`](/docs/api/type-aliases/EntityCallbacks)\<`M`, `USER`\>

### onDeleteFailure()?

> `optional` **onDeleteFailure**: (`entity`, `e`) => `void`

#### Parameters

##### entity

[`Entity`](/docs/api/interfaces/Entity)\<`M`\>

##### e

`Error`

#### Returns

`void`

### onDeleteSuccess()?

> `optional` **onDeleteSuccess**: (`entity`) => `void`

#### Parameters

##### entity

[`Entity`](/docs/api/interfaces/Entity)\<`M`\>

#### Returns

`void`

### onDeleteSuccessHookError()?

> `optional` **onDeleteSuccessHookError**: (`entity`, `e`) => `void`

#### Parameters

##### entity

[`Entity`](/docs/api/interfaces/Entity)\<`M`\>

##### e

`Error`

#### Returns

`void`

### onPreDeleteHookError()?

> `optional` **onPreDeleteHookError**: (`entity`, `e`) => `void`

#### Parameters

##### entity

[`Entity`](/docs/api/interfaces/Entity)\<`M`\>

##### e

`Error`

#### Returns

`void`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User) = [`User`](/docs/api/type-aliases/User)
