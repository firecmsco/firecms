---
slug: "docs/api/interfaces/EntityAfterReadProps"
title: "EntityAfterReadProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityAfterReadProps

# Interface: EntityAfterReadProps\<M, USER\>

Defined in: [types/src/types/entity\_callbacks.ts:68](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Parameters passed to hooks when an entity is fetched

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`, `USER`\>

Defined in: [types/src/types/entity\_callbacks.ts:73](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Collection of the entity

***

### context

> **context**: [`RebaseCallContext`](../type-aliases/RebaseCallContext)\<`USER`\>

Defined in: [types/src/types/entity\_callbacks.ts:89](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Context of the app status

***

### entity

> **entity**: [`Entity`](Entity)\<`M`\>

Defined in: [types/src/types/entity\_callbacks.ts:84](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Fetched entity

***

### path

> **path**: `string`

Defined in: [types/src/types/entity\_callbacks.ts:79](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Full path of the CMS where this collection is being fetched.
Might contain unresolved aliases.
