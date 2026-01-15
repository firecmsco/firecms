---
slug: "docs/api/type-aliases/SaveEntityWithCallbacksProps"
title: "SaveEntityWithCallbacksProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / SaveEntityWithCallbacksProps

# Type Alias: SaveEntityWithCallbacksProps\<M\>

> **SaveEntityWithCallbacksProps**\<`M`\> = [`SaveEntityProps`](../interfaces/SaveEntityProps)\<`M`\> & `object`

Defined in: [hooks/data/save.ts:8](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/save.ts)

## Type Declaration

### onPreSaveHookError()?

> `optional` **onPreSaveHookError**: (`e`) => `void`

#### Parameters

##### e

`Error`

#### Returns

`void`

### onSaveFailure()?

> `optional` **onSaveFailure**: (`e`) => `void`

#### Parameters

##### e

`Error`

#### Returns

`void`

### onSaveSuccess()?

> `optional` **onSaveSuccess**: (`updatedEntity`) => `void`

#### Parameters

##### updatedEntity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`void`

### onSaveSuccessHookError()?

> `optional` **onSaveSuccessHookError**: (`e`) => `void`

#### Parameters

##### e

`Error`

#### Returns

`void`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>
