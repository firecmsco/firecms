---
slug: "docs/api/type-aliases/ConditionBuilderStatic"
title: "ConditionBuilderStatic"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / ConditionBuilderStatic

# Type Alias: ConditionBuilderStatic\<T\>

> **ConditionBuilderStatic**\<`T`\> = `object`

Defined in: [types/src/types/backend.ts:120](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

Static condition builder type for implementations using static methods.
Use this type when the class provides static methods rather than instance methods.

## Example

```ts
// DrizzleConditionBuilder satisfies this type
const builder: ConditionBuilderStatic<SQL> = DrizzleConditionBuilder;
```

## Type Parameters

### T

`T` = `any`

## Methods

### buildFilterConditions()

> **buildFilterConditions**\<`M`\>(`filter`, ...`args`): `T`[]

Defined in: [types/src/types/backend.ts:121](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### filter

[`FilterValues`](FilterValues)\<`Extract`\<keyof `M`, `string`\>\>

##### args

...`unknown`[]

#### Returns

`T`[]

***

### buildSearchConditions()

> **buildSearchConditions**(`searchString`, `properties`, ...`args`): `T`[]

Defined in: [types/src/types/backend.ts:125](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

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

Defined in: [types/src/types/backend.ts:130](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

#### Parameters

##### conditions

`T`[]

#### Returns

`T` \| `undefined`

***

### combineConditionsWithOr()

> **combineConditionsWithOr**(`conditions`): `T` \| `undefined`

Defined in: [types/src/types/backend.ts:131](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/backend.ts)

#### Parameters

##### conditions

`T`[]

#### Returns

`T` \| `undefined`
