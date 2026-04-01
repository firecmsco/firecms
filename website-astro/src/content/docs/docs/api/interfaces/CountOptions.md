---
slug: "docs/api/interfaces/CountOptions"
title: "CountOptions"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CountOptions

# Interface: CountOptions\<M\>

Defined in: [types/src/types/backend.ts:68](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Options for counting entities

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### databaseId?

> `optional` **databaseId**: `string`

Defined in: [types/src/types/backend.ts:70](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

***

### filter?

> `optional` **filter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/src/types/backend.ts:69](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)
