---
slug: "docs/api/interfaces/BackendConfig"
title: "BackendConfig"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / BackendConfig

# Interface: BackendConfig

Defined in: [types/src/types/backend.ts:339](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Configuration for creating a database backend

## Properties

### connection

> **connection**: `unknown`

Defined in: [types/src/types/backend.ts:348](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Database connection (implementation-specific)

***

### schema?

> `optional` **schema**: `unknown`

Defined in: [types/src/types/backend.ts:353](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Schema definition (implementation-specific, e.g., Drizzle schema for PostgreSQL)

***

### type

> **type**: `string`

Defined in: [types/src/types/backend.ts:343](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Type of database backend
