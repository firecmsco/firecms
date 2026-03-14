---
slug: "docs/api/interfaces/EntityIdUpdateProps"
title: "EntityIdUpdateProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityIdUpdateProps

# Interface: EntityIdUpdateProps\<M\>

Defined in: [types/entity\_callbacks.ts:203](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Parameters passed to hooks when an entity is deleted

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection

> **collection**: [`ResolvedEntityCollection`](../type-aliases/ResolvedEntityCollection)\<`M`\>

Defined in: [types/entity\_callbacks.ts:208](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

collection of the entity being deleted

***

### context

> **context**: [`RebaseContext`](../type-aliases/RebaseContext)

Defined in: [types/entity\_callbacks.ts:228](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Context of the app status

***

### entityId?

> `optional` **entityId**: `string`

Defined in: [types/entity\_callbacks.ts:218](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Current entity id

***

### path

> **path**: `string`

Defined in: [types/entity\_callbacks.ts:213](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Path of the parent collection

***

### values

> **values**: `M`

Defined in: [types/entity\_callbacks.ts:223](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Entity values
