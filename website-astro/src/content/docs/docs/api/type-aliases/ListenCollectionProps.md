---
slug: "docs/api/type-aliases/ListenCollectionProps"
title: "ListenCollectionProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / ListenCollectionProps

# Type Alias: ListenCollectionProps\<M\>

> **ListenCollectionProps**\<`M`\> = [`FetchCollectionProps`](../interfaces/FetchCollectionProps)\<`M`\> & `object`

Defined in: [types/src/controllers/datasource.ts:42](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/datasource.ts)

## Type Declaration

### onError()?

> `optional` **onError**: (`error`) => `void`

#### Parameters

##### error

`Error`

#### Returns

`void`

### onUpdate()

> **onUpdate**: (`entities`) => `void`

#### Parameters

##### entities

[`Entity`](../interfaces/Entity)\<`M`\>[]

#### Returns

`void`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`
