---
slug: "docs/api/interfaces/AdditionalFieldDelegate"
title: "AdditionalFieldDelegate"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / AdditionalFieldDelegate

# Interface: AdditionalFieldDelegate\<M, USER\>

Defined in: [types/collections.ts:485](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Use this interface for adding additional fields to entity collection views.
If you need to do some async loading you can use [AsyncPreviewComponent](../variables/AsyncPreviewComponent)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Properties

### Builder?

> `optional` **Builder**: `ComponentType`\<[`AdditionalFieldDelegateProps`](../type-aliases/AdditionalFieldDelegateProps)\<`M`, `USER`\>\>

Defined in: [types/collections.ts:507](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Builder for the content of the cell for this column

***

### dependencies?

> `optional` **dependencies**: `Extract`\<keyof `M`, `string`\>[]

Defined in: [types/collections.ts:517](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

If this column needs to update dynamically based on other properties,
you can define an array of keys as strings with the
`dependencies` prop.
e.g. ["name", "surname"]
This is a performance optimization, if you don't define dependencies
it will be updated in every render.

***

### key

> **key**: `string`

Defined in: [types/collections.ts:492](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

ID of this column. You can use this id in the `properties` field of the
collection in any order you want

***

### name

> **name**: `string`

Defined in: [types/collections.ts:497](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Header of this column

***

### value()?

> `optional` **value**: (`props`) => `string` \| `number` \| `Promise`\<`string` \| `number`\> \| `undefined`

Defined in: [types/collections.ts:526](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Use this prop to define the value of the column as a string or number.
This is the value that will be used for exporting the collection.
If `Builder` is defined, this prop will be ignored in the collection
view.

#### Parameters

##### props

###### context

[`FireCMSContext`](../type-aliases/FireCMSContext)\<`any`\>

###### entity

[`Entity`](Entity)\<`M`\>

#### Returns

`string` \| `number` \| `Promise`\<`string` \| `number`\> \| `undefined`

***

### width?

> `optional` **width**: `number`

Defined in: [types/collections.ts:502](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Width of the generated column in pixels
