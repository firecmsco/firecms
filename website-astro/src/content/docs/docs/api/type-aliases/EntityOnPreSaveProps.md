---
slug: "docs/api/type-aliases/EntityBeforeSaveProps"
title: "EntityBeforeSaveProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityBeforeSaveProps

# Type Alias: EntityBeforeSaveProps\<M, USER\>

> **EntityBeforeSaveProps**\<`M`, `USER`\> = `Omit`\<[`EntityAfterSaveProps`](../interfaces/EntityAfterSaveProps)\<`M`, `USER`\>, `"entityId"`\> & `object`

Defined in: [types/entity\_callbacks.ts:104](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Parameters passed to hooks before an entity is saved

## Type Declaration

### entityId?

> `optional` **entityId**: `string`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](User) = [`User`](User)
