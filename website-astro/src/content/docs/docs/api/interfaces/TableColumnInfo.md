---
slug: "docs/api/interfaces/TableColumnInfo"
title: "TableColumnInfo"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / TableColumnInfo

# Interface: TableColumnInfo

Defined in: [types/src/types/websockets.ts:34](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

Column metadata returned by table introspection.

## Properties

### character\_maximum\_length

> **character\_maximum\_length**: `number` \| `null`

Defined in: [types/src/types/websockets.ts:40](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### column\_default

> **column\_default**: `string` \| `null`

Defined in: [types/src/types/websockets.ts:39](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### column\_name

> **column\_name**: `string`

Defined in: [types/src/types/websockets.ts:35](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### data\_type

> **data\_type**: `string`

Defined in: [types/src/types/websockets.ts:36](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### enum\_values?

> `optional` **enum\_values**: `string`[]

Defined in: [types/src/types/websockets.ts:42](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

Enum values, populated for USER-DEFINED (enum) columns

***

### is\_nullable

> **is\_nullable**: `string`

Defined in: [types/src/types/websockets.ts:38](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)

***

### udt\_name

> **udt\_name**: `string`

Defined in: [types/src/types/websockets.ts:37](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/websockets.ts)
