---
slug: "docs/api/interfaces/EntityBeforeDeleteProps"
title: "EntityBeforeDeleteProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityBeforeDeleteProps

# Interface: EntityBeforeDeleteProps\<M, USER\>

Defined in: [types/src/types/entity\_callbacks.ts:158](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Parameters passed to hooks when an entity is deleted

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`\>

Defined in: [types/src/types/entity\_callbacks.ts:163](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

collection of the entity being deleted

***

### context

> **context**: [`RebaseCallContext`](../type-aliases/RebaseCallContext)\<`USER`\>

Defined in: [types/src/types/entity\_callbacks.ts:183](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Context of the app status

***

### entity

> **entity**: [`Entity`](Entity)\<`M`\>

Defined in: [types/src/types/entity\_callbacks.ts:178](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Deleted entity

***

### entityId

> **entityId**: `string` \| `number`

Defined in: [types/src/types/entity\_callbacks.ts:173](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Deleted entity id

***

### path

> **path**: `string`

Defined in: [types/src/types/entity\_callbacks.ts:168](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Path of the parent collection
