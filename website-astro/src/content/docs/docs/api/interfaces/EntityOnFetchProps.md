---
slug: "docs/api/interfaces/EntityAfterReadProps"
title: "EntityAfterReadProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityAfterReadProps

# Interface: EntityAfterReadProps\<M, USER\>

Defined in: [types/entity\_callbacks.ts:76](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Parameters passed to hooks when an entity is fetched

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`, `USER`\>

Defined in: [types/entity\_callbacks.ts:81](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Collection of the entity

***

### context

> **context**: [`RebaseContext`](../type-aliases/RebaseContext)\<`USER`\>

Defined in: [types/entity\_callbacks.ts:97](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Context of the app status

***

### entity

> **entity**: [`Entity`](Entity)\<`M`\>

Defined in: [types/entity\_callbacks.ts:92](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Fetched entity

***

### path

> **path**: `string`

Defined in: [types/entity\_callbacks.ts:87](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/entity_callbacks.ts)

Full path of the CMS where this collection is being fetched.
Might contain unresolved aliases.
