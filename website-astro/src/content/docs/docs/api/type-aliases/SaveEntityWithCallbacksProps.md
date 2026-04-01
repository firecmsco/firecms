---
slug: "docs/api/type-aliases/SaveEntityWithCallbacksProps"
title: "SaveEntityWithCallbacksProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / SaveEntityWithCallbacksProps

# Type Alias: SaveEntityWithCallbacksProps\<M\>

> **SaveEntityWithCallbacksProps**\<`M`\> = [`SaveEntityProps`](../interfaces/SaveEntityProps)\<`M`\> & `object`

Defined in: [core/src/hooks/data/save.ts:7](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/data/save.ts)

## Type Declaration

### afterSave()?

> `optional` **afterSave**: (`updatedEntity`) => `void`

#### Parameters

##### updatedEntity

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`void`

### afterSaveError()?

> `optional` **afterSaveError**: (`e`) => `void`

#### Parameters

##### e

`Error`

#### Returns

`void`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>
