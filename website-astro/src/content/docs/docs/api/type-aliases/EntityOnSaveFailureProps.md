---
slug: "docs/api/type-aliases/EntityAfterSaveErrorProps"
title: "EntityAfterSaveErrorProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityAfterSaveErrorProps

# Type Alias: EntityAfterSaveErrorProps\<M, USER\>

> **EntityAfterSaveErrorProps**\<`M`, `USER`\> = `Omit`\<[`EntityAfterSaveProps`](../interfaces/EntityAfterSaveProps)\<`M`, `USER`\>, `"entityId"`\> & `object`

Defined in: [types/entity\_callbacks.ts:113](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Parameters passed to hooks before an entity is saved

## Type Declaration

### entityId?

> `optional` **entityId**: `string`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](User) = [`User`](User)
