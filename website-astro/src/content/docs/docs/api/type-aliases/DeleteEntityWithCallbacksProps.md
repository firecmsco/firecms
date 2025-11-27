---
slug: "docs/api/type-aliases/DeleteEntityWithCallbacksProps"
title: "DeleteEntityWithCallbacksProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / DeleteEntityWithCallbacksProps

# Type Alias: DeleteEntityWithCallbacksProps\<M, USER\>

> **DeleteEntityWithCallbacksProps**\<`M`, `USER`\> = [`DeleteEntityProps`](../interfaces/DeleteEntityProps)\<`M`\> & `object`

Defined in: [hooks/data/delete.ts:15](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/delete.ts)

## Type Declaration

### callbacks?

> `optional` **callbacks**: [`EntityCallbacks`](EntityCallbacks)\<`M`, `USER`\>

### onDeleteFailure()?

> `optional` **onDeleteFailure**: (`entity`, `e`) => `void`

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

##### e

`Error`

#### Returns

`void`

### onDeleteSuccess()?

> `optional` **onDeleteSuccess**: (`entity`) => `void`

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`void`

### onDeleteSuccessHookError()?

> `optional` **onDeleteSuccessHookError**: (`entity`, `e`) => `void`

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

##### e

`Error`

#### Returns

`void`

### onPreDeleteHookError()?

> `optional` **onPreDeleteHookError**: (`entity`, `e`) => `void`

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\>

##### e

`Error`

#### Returns

`void`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](User) = [`User`](User)
