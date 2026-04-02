---
slug: "docs/api/interfaces/CollectionAccessor"
title: "CollectionAccessor"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CollectionAccessor

# Interface: CollectionAccessor\<M\>

Defined in: [types/src/controllers/data.ts:64](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

A single collection's CRUD accessor.

This is the unified API surface used in both:
- The generated SDK (`client.data.products.create(...)`)
- Framework callbacks (`context.data.products.create(...)`)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Methods

### count()?

> `optional` **count**(`params?`): `Promise`\<`number`\>

Defined in: [types/src/controllers/data.ts:109](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Count the number of records matching the given filter.

#### Parameters

##### params?

[`FindParams`](FindParams)

#### Returns

`Promise`\<`number`\>

***

### create()

> **create**(`data`, `id?`): `Promise`\<[`Entity`](Entity)\<`M`\>\>

Defined in: [types/src/controllers/data.ts:81](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Create a new record.

#### Parameters

##### data

`Partial`\<[`EntityValues`](../type-aliases/EntityValues)\<`M`\>\>

The entity data to create.

##### id?

Optional specific ID to use for the new record.

`string` | `number`

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>\>

The created entity

***

### delete()

> **delete**(`id`): `Promise`\<`void`\>

Defined in: [types/src/controllers/data.ts:92](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Delete a record by ID.

#### Parameters

##### id

`string` | `number`

#### Returns

`Promise`\<`void`\>

***

### find()

> **find**(`params?`): `Promise`\<[`FindResponse`](FindResponse)\<`M`\>\>

Defined in: [types/src/controllers/data.ts:68](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Find multiple records with optional filtering, pagination, and sorting.

#### Parameters

##### params?

[`FindParams`](FindParams)

#### Returns

`Promise`\<[`FindResponse`](FindResponse)\<`M`\>\>

***

### findById()

> **findById**(`id`): `Promise`\<[`Entity`](Entity)\<`M`\> \| `undefined`\>

Defined in: [types/src/controllers/data.ts:73](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Find a single record by its ID.

#### Parameters

##### id

`string` | `number`

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\> \| `undefined`\>

***

### listen()?

> `optional` **listen**(`params`, `onUpdate`, `onError?`): () => `void`

Defined in: [types/src/controllers/data.ts:98](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Subscribe to a collection for real-time updates.
Optional method, may not be supported by all implementations (like stateless HTTP clients).

#### Parameters

##### params

[`FindParams`](FindParams) | `undefined`

##### onUpdate

(`response`) => `void`

##### onError?

(`error`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### listenById()?

> `optional` **listenById**(`id`, `onUpdate`, `onError?`): () => `void`

Defined in: [types/src/controllers/data.ts:104](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Subscribe to a single record for real-time updates.
Optional method.

#### Parameters

##### id

`string` | `number`

##### onUpdate

(`entity`) => `void`

##### onError?

(`error`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### update()

> **update**(`id`, `data`): `Promise`\<[`Entity`](Entity)\<`M`\>\>

Defined in: [types/src/controllers/data.ts:87](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/data.ts)

Update an existing record by ID.

#### Parameters

##### id

`string` | `number`

##### data

`Partial`\<[`EntityValues`](../type-aliases/EntityValues)\<`M`\>\>

#### Returns

`Promise`\<[`Entity`](Entity)\<`M`\>\>

The updated entity
