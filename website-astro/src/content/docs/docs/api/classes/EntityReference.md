---
slug: "docs/api/classes/EntityReference"
title: "EntityReference"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityReference

# Class: EntityReference

Defined in: [types/src/types/entities.ts:76](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

Class used to create a reference to an entity in a different path.

## Example

```ts
// Simple reference (most common case - single driver, single db)
new EntityReference({ id: "123", path: "users" })

// Reference to a different driver (e.g., Firestore)
new EntityReference({ id: "123", path: "analytics", driver: "firestore" })

// Reference to a specific database within a driver
new EntityReference({ id: "123", path: "orders", driver: "postgres", databaseId: "orders_db" })
```

## Constructors

### Constructor

> **new EntityReference**(`props`): `EntityReference`

Defined in: [types/src/types/entities.ts:111](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

Create a reference to an entity.

#### Parameters

##### props

[`EntityReferenceProps`](../interfaces/EntityReferenceProps)

#### Returns

`EntityReference`

#### Example

```ts
// Simple reference (most common case)
new EntityReference({ id: "123", path: "users" })

// With driver
new EntityReference({ id: "123", path: "analytics", driver: "firestore" })
```

## Properties

### \_\_type

> `readonly` **\_\_type**: `"reference"` = `"reference"`

Defined in: [types/src/types/entities.ts:78](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

***

### databaseId?

> `readonly` `optional` **databaseId**: `string`

Defined in: [types/src/types/entities.ts:99](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

Which database within the driver.
Defaults to "(default)" if not specified.

***

### driver?

> `readonly` `optional` **driver**: `string`

Defined in: [types/src/types/entities.ts:93](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

Which driver (e.g., 'postgres', 'firestore').
Defaults to "(default)" if not specified.

***

### id

> `readonly` **id**: `string`

Defined in: [types/src/types/entities.ts:82](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

ID of the entity

***

### path

> `readonly` **path**: `string`

Defined in: [types/src/types/entities.ts:87](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

A string representing the path of the referenced document (relative
to the root of the database).

## Accessors

### fullPath

#### Get Signature

> **get** **fullPath**(): `string`

Defined in: [types/src/types/entities.ts:126](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

Get the full path including driver and database prefixes if specified.
For the common case (single driver, single db), this just returns pathWithId.

##### Returns

`string`

***

### pathWithId

#### Get Signature

> **get** **pathWithId**(): `string`

Defined in: [types/src/types/entities.ts:118](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

##### Returns

`string`

## Methods

### isEntityReference()

> **isEntityReference**(): `boolean`

Defined in: [types/src/types/entities.ts:145](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/entities.ts)

#### Returns

`boolean`
