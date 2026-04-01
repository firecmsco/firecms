---
slug: "docs/api/interfaces/EntityAfterSaveProps"
title: "EntityAfterSaveProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityAfterSaveProps

# Interface: EntityAfterSaveProps\<M, USER\>

Defined in: [types/src/types/entity\_callbacks.ts:115](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Parameters passed to hooks when an entity is saved

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`\>

Defined in: [types/src/types/entity\_callbacks.ts:120](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Resolved collection of the entity

***

### context

> **context**: [`RebaseCallContext`](../type-aliases/RebaseCallContext)\<`USER`\>

Defined in: [types/src/types/entity\_callbacks.ts:151](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Context of the app status

***

### entityId

> **entityId**: `string` \| `number`

Defined in: [types/src/types/entity\_callbacks.ts:131](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

ID of the entity

***

### path

> **path**: `string`

Defined in: [types/src/types/entity\_callbacks.ts:126](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Full path of the CMS where this entity is being saved.
Might contain unresolved aliases.

***

### previousValues?

> `optional` **previousValues**: `Partial`\<`M`\>

Defined in: [types/src/types/entity\_callbacks.ts:141](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Previous values

***

### status

> **status**: [`EntityStatus`](../type-aliases/EntityStatus)

Defined in: [types/src/types/entity\_callbacks.ts:146](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

New or existing entity

***

### values

> **values**: `Partial`\<[`EntityValues`](../type-aliases/EntityValues)\<`M`\>\>

Defined in: [types/src/types/entity\_callbacks.ts:136](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Values being saved
