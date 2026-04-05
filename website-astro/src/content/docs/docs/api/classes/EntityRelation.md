---
slug: "docs/api/classes/EntityRelation"
title: "EntityRelation"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityRelation

# Class: EntityRelation

Defined in: [types/src/types/entities.ts:153](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

Class used to create a reference to an entity in a different path

## Constructors

### Constructor

> **new EntityRelation**(`id`, `path`): `EntityRelation`

Defined in: [types/src/types/entities.ts:166](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

#### Parameters

##### id

`string` | `number`

##### path

`string`

#### Returns

`EntityRelation`

## Properties

### \_\_type

> `readonly` **\_\_type**: `"relation"` = `"relation"`

Defined in: [types/src/types/entities.ts:155](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

***

### id

> `readonly` **id**: `string` \| `number`

Defined in: [types/src/types/entities.ts:159](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

ID of the entity

***

### path

> `readonly` **path**: `string`

Defined in: [types/src/types/entities.ts:164](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

A string representing the path of the referenced document (relative
to the root of the database).

## Accessors

### pathWithId

#### Get Signature

> **get** **pathWithId**(): `string`

Defined in: [types/src/types/entities.ts:171](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

##### Returns

`string`

## Methods

### isEntityReference()

> **isEntityReference**(): `boolean`

Defined in: [types/src/types/entities.ts:175](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

#### Returns

`boolean`

***

### isEntityRelation()

> **isEntityRelation**(): `boolean`

Defined in: [types/src/types/entities.ts:179](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

#### Returns

`boolean`
