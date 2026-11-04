---
slug: "docs/api/type-aliases/ListenCollectionProps"
title: "ListenCollectionProps"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / ListenCollectionProps

# Type Alias: ListenCollectionProps\<M\>

> **ListenCollectionProps**\<`M`\> = [`FetchCollectionProps`](/docs/api/interfaces/FetchCollectionProps)\<`M`\> & `object`

Defined in: [types/datasource.ts:43](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/datasource.ts)

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

[`Entity`](/docs/api/interfaces/Entity)\<`M`\>[]

#### Returns

`void`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`
