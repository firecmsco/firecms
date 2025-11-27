---
slug: "docs/api/type-aliases/EntityOnSaveFailureProps"
title: "EntityOnSaveFailureProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityOnSaveFailureProps

# Type Alias: EntityOnSaveFailureProps\<M, USER\>

> **EntityOnSaveFailureProps**\<`M`, `USER`\> = `Omit`\<[`EntityOnSaveProps`](../interfaces/EntityOnSaveProps)\<`M`, `USER`\>, `"entityId"`\> & `object`

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
