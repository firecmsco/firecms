---
slug: "docs/api/interfaces/EntityOnDeleteProps"
title: "EntityOnDeleteProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityOnDeleteProps

# Interface: EntityOnDeleteProps\<M, USER\>

Defined in: [types/entity\_callbacks.ts:171](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Parameters passed to hooks when an entity is deleted

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### collection

> **collection**: [`ResolvedEntityCollection`](../type-aliases/ResolvedEntityCollection)\<`M`\>

Defined in: [types/entity\_callbacks.ts:176](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

collection of the entity being deleted

***

### context

> **context**: [`FireCMSContext`](../type-aliases/FireCMSContext)\<`USER`\>

Defined in: [types/entity\_callbacks.ts:196](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Context of the app status

***

### entity

> **entity**: [`Entity`](Entity)\<`M`\>

Defined in: [types/entity\_callbacks.ts:191](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Deleted entity

***

### entityId

> **entityId**: `string`

Defined in: [types/entity\_callbacks.ts:186](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Deleted entity id

***

### path

> **path**: `string`

Defined in: [types/entity\_callbacks.ts:181](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Path of the parent collection
