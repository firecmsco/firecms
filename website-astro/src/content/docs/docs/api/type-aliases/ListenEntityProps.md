---
slug: "docs/api/type-aliases/ListenEntityProps"
title: "ListenEntityProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / ListenEntityProps

# Type Alias: ListenEntityProps\<M\>

> **ListenEntityProps**\<`M`\> = [`FetchEntityProps`](../interfaces/FetchEntityProps)\<`M`\> & `object`

Defined in: [types/datasource.ts:19](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

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

[`Entity`](../interfaces/Entity)\<`M`\>

#### Returns

`void`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`
