---
slug: "docs/api/interfaces/DatabaseAdmin"
title: "DatabaseAdmin"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DatabaseAdmin

# Interface: DatabaseAdmin

Defined in: [types/src/controllers/database\_admin.ts:10](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/database_admin.ts)

Administrative database operations.
These are used only by the studio/admin UI (SQL editor, schema browser, etc.)
and are NOT part of the public `data` API.

## Methods

### executeSql()?

> `optional` **executeSql**(`sql`, `options?`): `Promise`\<`Record`\<`string`, `unknown`\>[]\>

Defined in: [types/src/controllers/database\_admin.ts:14](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/database_admin.ts)

Execute raw SQL (if supported by the driver)

#### Parameters

##### sql

`string`

##### options?

###### database?

`string`

###### role?

`string`

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>[]\>

***

### fetchAvailableDatabases()?

> `optional` **fetchAvailableDatabases**(): `Promise`\<`string`[]\>

Defined in: [types/src/controllers/database\_admin.ts:19](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/database_admin.ts)

Fetch the available databases (if supported by the driver)

#### Returns

`Promise`\<`string`[]\>

***

### fetchAvailableRoles()?

> `optional` **fetchAvailableRoles**(): `Promise`\<`string`[]\>

Defined in: [types/src/controllers/database\_admin.ts:24](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/database_admin.ts)

Fetch the available roles (if supported by the driver)

#### Returns

`Promise`\<`string`[]\>

***

### fetchCurrentDatabase()?

> `optional` **fetchCurrentDatabase**(): `Promise`\<`string` \| `undefined`\>

Defined in: [types/src/controllers/database\_admin.ts:29](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/database_admin.ts)

Fetch the current database name (if supported by the driver)

#### Returns

`Promise`\<`string` \| `undefined`\>

***

### fetchTableColumns()?

> `optional` **fetchTableColumns**(`tableName`): `Promise`\<[`TableColumnInfo`](TableColumnInfo)[]\>

Defined in: [types/src/controllers/database\_admin.ts:39](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/database_admin.ts)

Fetch column metadata for a given table (if supported)

#### Parameters

##### tableName

`string`

#### Returns

`Promise`\<[`TableColumnInfo`](TableColumnInfo)[]\>

***

### fetchUnmappedTables()?

> `optional` **fetchUnmappedTables**(`mappedPaths?`): `Promise`\<`string`[]\>

Defined in: [types/src/controllers/database\_admin.ts:34](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/database_admin.ts)

Fetch database tables not yet mapped to a collection (if supported)

#### Parameters

##### mappedPaths?

`string`[]

#### Returns

`Promise`\<`string`[]\>
