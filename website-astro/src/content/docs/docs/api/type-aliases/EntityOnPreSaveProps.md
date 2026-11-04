---
slug: "docs/api/type-aliases/EntityOnPreSaveProps"
title: "EntityOnPreSaveProps"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / EntityOnPreSaveProps

# Type Alias: EntityOnPreSaveProps\<M, USER\>

> **EntityOnPreSaveProps**\<`M`, `USER`\> = `Omit`\<[`EntityOnSaveProps`](/docs/api/interfaces/EntityOnSaveProps)\<`M`, `USER`\>, `"entityId"`\> & `object`

Defined in: [types/entity\_callbacks.ts:104](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Parameters passed to hooks before an entity is saved

## Type Declaration

### entityId?

> `optional` **entityId**: `string`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User) = [`User`](/docs/api/type-aliases/User)
