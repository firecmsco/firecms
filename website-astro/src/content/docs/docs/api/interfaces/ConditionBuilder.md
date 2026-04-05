---
slug: "docs/api/interfaces/ConditionBuilder"
title: "ConditionBuilder"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / ConditionBuilder

# Interface: ConditionBuilder\<T\>

Defined in: [types/src/types/backend.ts:82](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Abstract condition builder interface.
Implementations translate Rebase filter conditions to database-specific queries.

Note: This interface can be implemented as instance methods or as a class with static methods.
For static implementations (like DrizzleConditionBuilder), use the ConditionBuilderStatic type.

## Type Parameters

### T

`T` = `any`

The type of condition returned by the builder (e.g., SQL for PostgreSQL, Filter<Document> for MongoDB)

## Methods

### buildFilterConditions()

> **buildFilterConditions**\<`M`\>(`filter`, `collectionPath`, ...`args`): `T`[]

Defined in: [types/src/types/backend.ts:86](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Build filter conditions from Rebase FilterValues

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### filter

[`FilterValues`](../type-aliases/FilterValues)\<`Extract`\<keyof `M`, `string`\>\>

##### collectionPath

`string`

##### args

...`unknown`[]

#### Returns

`T`[]

***

### buildSearchConditions()

> **buildSearchConditions**(`searchString`, `properties`, ...`args`): `T`[]

Defined in: [types/src/types/backend.ts:95](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Build search conditions for text search

#### Parameters

##### searchString

`string`

##### properties

`Record`\<`string`, `unknown`\>

##### args

...`unknown`[]

#### Returns

`T`[]

***

### combineConditionsWithAnd()

> **combineConditionsWithAnd**(`conditions`): `T` \| `undefined`

Defined in: [types/src/types/backend.ts:104](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Combine multiple conditions with AND operator

#### Parameters

##### conditions

`T`[]

#### Returns

`T` \| `undefined`

***

### combineConditionsWithOr()

> **combineConditionsWithOr**(`conditions`): `T` \| `undefined`

Defined in: [types/src/types/backend.ts:109](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/backend.ts)

Combine multiple conditions with OR operator

#### Parameters

##### conditions

`T`[]

#### Returns

`T` \| `undefined`
