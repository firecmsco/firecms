---
slug: "docs/api/interfaces/EntityBeforeDeleteProps"
title: "EntityBeforeDeleteProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityBeforeDeleteProps

# Interface: EntityBeforeDeleteProps\<M, USER\>

Defined in: [types/entity\_callbacks.ts:171](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Parameters passed to hooks when an entity is deleted

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### collection

> **collection**: [`ResolvedEntityCollection`](../type-aliases/ResolvedEntityCollection)\<`M`\>

Defined in: [types/entity\_callbacks.ts:176](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

collection of the entity being deleted

***

### context

> **context**: [`RebaseContext`](../type-aliases/RebaseContext)\<`USER`\>

Defined in: [types/entity\_callbacks.ts:196](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Context of the app status

***

### entity

> **entity**: [`Entity`](Entity)\<`M`\>

Defined in: [types/entity\_callbacks.ts:191](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Deleted entity

***

### entityId

> **entityId**: `string`

Defined in: [types/entity\_callbacks.ts:186](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Deleted entity id

***

### path

> **path**: `string`

Defined in: [types/entity\_callbacks.ts:181](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Path of the parent collection
