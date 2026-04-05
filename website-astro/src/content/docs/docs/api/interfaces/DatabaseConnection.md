---
slug: "docs/api/interfaces/DatabaseConnection"
title: "DatabaseConnection"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DatabaseConnection

# Interface: DatabaseConnection

Defined in: [types/src/types/backend.ts:11](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Abstract database connection interface.
Represents a connection to any database system.

## Properties

### isConnected?

> `readonly` `optional` **isConnected**: `boolean`

Defined in: [types/src/types/backend.ts:20](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Whether the connection is currently active

***

### type

> `readonly` **type**: `string`

Defined in: [types/src/types/backend.ts:15](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Type identifier for this database (e.g., 'postgres', 'mongodb', 'mysql')

## Methods

### close()?

> `optional` **close**(): `Promise`\<`void`\>

Defined in: [types/src/types/backend.ts:25](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Close the database connection

#### Returns

`Promise`\<`void`\>
