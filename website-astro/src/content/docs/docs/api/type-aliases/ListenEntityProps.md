---
slug: "docs/api/type-aliases/ListenEntityProps"
title: "ListenEntityProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / ListenEntityProps

# Type Alias: ListenEntityProps\<M\>

> **ListenEntityProps**\<`M`\> = [`FetchEntityProps`](../interfaces/FetchEntityProps)\<`M`\> & `object`

Defined in: [types/src/controllers/data\_driver.ts:18](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data_driver.ts)

**`Internal`**

## Type Declaration

### onError()?

> `optional` **onError**: (`error`) => `void`

#### Parameters

##### error

`Error`

#### Returns

`void`

### onUpdate()

> **onUpdate**: (`entity`) => `void`

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`M`\> | `null`

#### Returns

`void`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`
