---
slug: "docs/api/type-aliases/PropertyCallbacks"
title: "PropertyCallbacks"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / PropertyCallbacks

# Type Alias: PropertyCallbacks\<T, M, USER\>

> **PropertyCallbacks**\<`T`, `M`, `USER`\> = `object`

Defined in: [types/src/types/properties.ts:17](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Callbacks/Hooks for individual property fields

## Type Parameters

### T

`T` = `any`

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](User) = [`User`](User)

## Methods

### afterRead()?

> `optional` **afterRead**(`props`): `T` \| `Promise`\<`T`\>

Defined in: [types/src/types/properties.ts:21](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Callback used after fetching data, to transform the value before rendering

#### Parameters

##### props

`Omit`\<[`EntityAfterReadProps`](../interfaces/EntityAfterReadProps)\<`M`, `USER`\>, `"entity"`\> & `object`

#### Returns

`T` \| `Promise`\<`T`\>

***

### beforeSave()?

> `optional` **beforeSave**(`props`): `T` \| `Promise`\<`T`\>

Defined in: [types/src/types/properties.ts:31](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Callback used before saving, after validation.
You can modify the value before it's saved.

#### Parameters

##### props

`Omit`\<[`EntityBeforeSaveProps`](EntityBeforeSaveProps)\<`M`, `USER`\>, `"values"`\> & `object`

#### Returns

`T` \| `Promise`\<`T`\>
