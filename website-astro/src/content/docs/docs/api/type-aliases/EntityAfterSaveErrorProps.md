---
slug: "docs/api/type-aliases/EntityAfterSaveErrorProps"
title: "EntityAfterSaveErrorProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityAfterSaveErrorProps

# Type Alias: EntityAfterSaveErrorProps\<M, USER\>

> **EntityAfterSaveErrorProps**\<`M`, `USER`\> = `Omit`\<[`EntityAfterSaveProps`](../interfaces/EntityAfterSaveProps)\<`M`, `USER`\>, `"entityId"`\> & `object`

Defined in: [types/src/types/entity\_callbacks.ts:105](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Parameters passed to hooks before an entity is saved

## Type Declaration

### entityId?

> `optional` **entityId**: `string` \| `number`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](User) = [`User`](User)
