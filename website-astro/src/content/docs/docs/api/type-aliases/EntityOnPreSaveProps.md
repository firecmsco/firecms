---
slug: "docs/api/type-aliases/EntityOnPreSaveProps"
title: "EntityOnPreSaveProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityOnPreSaveProps

# Type Alias: EntityOnPreSaveProps\<M, USER\>

> **EntityOnPreSaveProps**\<`M`, `USER`\> = `Omit`\<[`EntityOnSaveProps`](../interfaces/EntityOnSaveProps)\<`M`, `USER`\>, `"entityId"`\> & `object`

Defined in: [types/entity\_callbacks.ts:104](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Parameters passed to hooks before an entity is saved

## Type Declaration

### entityId?

> `optional` **entityId**: `string`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](User) = [`User`](User)
