---
slug: "docs/api/interfaces/EntityAfterDeleteProps"
title: "EntityAfterDeleteProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityAfterDeleteProps

# Interface: EntityAfterDeleteProps\<M, USER\>

Defined in: [types/src/types/entity\_callbacks.ts:190](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Parameters passed to hooks after an entity is deleted

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`\>

Defined in: [types/src/types/entity\_callbacks.ts:195](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

collection of the entity being deleted

***

### context

> **context**: [`RebaseCallContext`](../type-aliases/RebaseCallContext)\<`USER`\>

Defined in: [types/src/types/entity\_callbacks.ts:215](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Context of the app status

***

### entity

> **entity**: [`Entity`](Entity)\<`M`\>

Defined in: [types/src/types/entity\_callbacks.ts:210](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Deleted entity

***

### entityId

> **entityId**: `string` \| `number`

Defined in: [types/src/types/entity\_callbacks.ts:205](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Deleted entity id

***

### path

> **path**: `string`

Defined in: [types/src/types/entity\_callbacks.ts:200](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Path of the parent collection
