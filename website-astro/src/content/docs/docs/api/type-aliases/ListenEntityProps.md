---
slug: "docs/api/type-aliases/ListenEntityProps"
title: "ListenEntityProps"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / ListenEntityProps

# Type Alias: ListenEntityProps\<M\>

> **ListenEntityProps**\<`M`\> = [`FetchEntityProps`](/docs/api/interfaces/FetchEntityProps)\<`M`\> & `object`

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

[`Entity`](/docs/api/interfaces/Entity)\<`M`\>

#### Returns

`void`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`
