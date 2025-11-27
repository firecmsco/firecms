---
slug: "docs/api/interfaces/Entity"
title: "Entity"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / Entity

# Interface: Entity\<M\>

Defined in: [types/entities.ts:11](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

Representation of an entity fetched from the datasource

## Type Parameters

### M

`M` *extends* `object` = `any`

## Properties

### databaseId?

> `optional` **databaseId**: `string`

Defined in: [types/entities.ts:29](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

***

### id

> **id**: `string`

Defined in: [types/entities.ts:16](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

ID of the entity

***

### path

> **path**: `string`

Defined in: [types/entities.ts:22](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

A string representing the path of the referenced document (relative
to the root of the database).

***

### values

> **values**: `M`

Defined in: [types/entities.ts:27](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

Current values
