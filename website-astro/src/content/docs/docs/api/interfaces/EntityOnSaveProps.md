---
slug: "docs/api/interfaces/EntityOnSaveProps"
title: "EntityOnSaveProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityOnSaveProps

# Interface: EntityOnSaveProps\<M, USER\>

Defined in: [types/entity\_callbacks.ts:123](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Parameters passed to hooks when an entity is saved

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### collection

> **collection**: [`ResolvedEntityCollection`](../type-aliases/ResolvedEntityCollection)\<`M`\>

Defined in: [types/entity\_callbacks.ts:128](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Resolved collection of the entity

***

### context

> **context**: [`FireCMSContext`](../type-aliases/FireCMSContext)\<`USER`\>

Defined in: [types/entity\_callbacks.ts:164](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Context of the app status

***

### entityId

> **entityId**: `string`

Defined in: [types/entity\_callbacks.ts:144](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

ID of the entity

***

### path

> **path**: `string`

Defined in: [types/entity\_callbacks.ts:134](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Full path of the CMS where this entity is being saved.
Might contain unresolved aliases.

***

### previousValues?

> `optional` **previousValues**: `Partial`\<`M`\>

Defined in: [types/entity\_callbacks.ts:154](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Previous values

***

### resolvedPath

> **resolvedPath**: `string`

Defined in: [types/entity\_callbacks.ts:139](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Full path where this entity is being saved, with alias resolved

***

### status

> **status**: [`EntityStatus`](../type-aliases/EntityStatus)

Defined in: [types/entity\_callbacks.ts:159](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

New or existing entity

***

### values

> **values**: `Partial`\<[`EntityValues`](../type-aliases/EntityValues)\<`M`\>\>

Defined in: [types/entity\_callbacks.ts:149](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Values being saved
