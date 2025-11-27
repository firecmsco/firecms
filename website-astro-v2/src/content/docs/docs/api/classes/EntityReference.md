---
slug: "docs/api/classes/EntityReference"
title: "EntityReference"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityReference

# Class: EntityReference

Defined in: [types/entities.ts:42](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

Class used to create a reference to an entity in a different path

## Constructors

### Constructor

> **new EntityReference**(`id`, `path`, `databaseId?`): `EntityReference`

Defined in: [types/entities.ts:58](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

#### Parameters

##### id

`string`

##### path

`string`

##### databaseId?

`string`

#### Returns

`EntityReference`

## Properties

### databaseId?

> `readonly` `optional` **databaseId**: `string`

Defined in: [types/entities.ts:56](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

Optional database ID where the entity is stored (if multiple databases are used)

***

### id

> `readonly` **id**: `string`

Defined in: [types/entities.ts:46](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

ID of the entity

***

### path

> `readonly` **path**: `string`

Defined in: [types/entities.ts:51](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

A string representing the path of the referenced document (relative
to the root of the database).

## Accessors

### pathWithId

#### Get Signature

> **get** **pathWithId**(): `string`

Defined in: [types/entities.ts:64](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

##### Returns

`string`

## Methods

### isEntityReference()

> **isEntityReference**(): `boolean`

Defined in: [types/entities.ts:68](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entities.ts)

#### Returns

`boolean`
