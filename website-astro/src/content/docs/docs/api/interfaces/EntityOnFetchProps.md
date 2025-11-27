---
slug: "docs/api/interfaces/EntityOnFetchProps"
title: "EntityOnFetchProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityOnFetchProps

# Interface: EntityOnFetchProps\<M, USER\>

Defined in: [types/entity\_callbacks.ts:76](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Parameters passed to hooks when an entity is fetched

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`, `USER`\>

Defined in: [types/entity\_callbacks.ts:81](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Collection of the entity

***

### context

> **context**: [`FireCMSContext`](../type-aliases/FireCMSContext)\<`USER`\>

Defined in: [types/entity\_callbacks.ts:97](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Context of the app status

***

### entity

> **entity**: [`Entity`](Entity)\<`M`\>

Defined in: [types/entity\_callbacks.ts:92](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Fetched entity

***

### path

> **path**: `string`

Defined in: [types/entity\_callbacks.ts:87](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Full path of the CMS where this collection is being fetched.
Might contain unresolved aliases.
