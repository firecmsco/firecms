---
slug: "docs/api/type-aliases/SaveEntityWithCallbacksProps"
title: "SaveEntityWithCallbacksProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SaveEntityWithCallbacksProps

# Type Alias: SaveEntityWithCallbacksProps\<M\>

> **SaveEntityWithCallbacksProps**\<`M`\> = [`SaveEntityProps`](../interfaces/SaveEntityProps)\<`M`\> & `object`

Defined in: [hooks/data/save.ts:8](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/data/save.ts)

## Type Declaration

### onPreSaveHookError()?

> `optional` **onPreSaveHookError**: (`e`) => `void`

#### Parameters

##### e

`Error`

#### Returns

`void`

### afterSaveError()?

> `optional` **afterSaveError**: (`e`) => `void`

#### Parameters

##### e

`Error`

#### Returns

`void`

### afterSave()?

> `optional` **afterSave**: (`updatedEntity`) => `void`

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
