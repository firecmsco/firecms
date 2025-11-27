---
slug: "docs/api/type-aliases/EntityCallbacks"
title: "EntityCallbacks"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityCallbacks

# Type Alias: EntityCallbacks\<M, USER\>

> **EntityCallbacks**\<`M`, `USER`\> = `object`

Defined in: [types/entity\_callbacks.ts:13](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

This interface defines all the callbacks that can be used when an entity
is being created, updated or deleted.
Useful for adding your own logic or blocking the execution of the operation.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](User) = [`User`](User)

## Methods

### onDelete()?

> `optional` **onDelete**(`entityDeleteProps`): `void`

Defined in: [types/entity\_callbacks.ts:59](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Callback used after the entity is deleted.

#### Parameters

##### entityDeleteProps

[`EntityOnDeleteProps`](../interfaces/EntityOnDeleteProps)\<`M`, `USER`\>

#### Returns

`void`

***

### onFetch()?

> `optional` **onFetch**(`entityFetchProps`): [`Entity`](../interfaces/Entity)\<`M`\> \| `Promise`\<[`Entity`](../interfaces/Entity)\<`M`\>\>

Defined in: [types/entity\_callbacks.ts:19](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Callback used after fetching data

#### Parameters

##### entityFetchProps

[`EntityOnFetchProps`](../interfaces/EntityOnFetchProps)\<`M`, `USER`\>

#### Returns

[`Entity`](../interfaces/Entity)\<`M`\> \| `Promise`\<[`Entity`](../interfaces/Entity)\<`M`\>\>

***

### onIdUpdate()?

> `optional` **onIdUpdate**(`idUpdateProps`): `string` \| `Promise`\<`string`\>

Defined in: [types/entity\_callbacks.ts:68](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Callback fired when any value in the form changes. You can use it
to define the ID of a `new` entity based on the current values.
The returned string will be used as the ID of the entity.

#### Parameters

##### idUpdateProps

[`EntityIdUpdateProps`](../interfaces/EntityIdUpdateProps)\<`M`\>

#### Returns

`string` \| `Promise`\<`string`\>

***

### onPreDelete()?

> `optional` **onPreDelete**(`entityDeleteProps`): `void`

Defined in: [types/entity\_callbacks.ts:52](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Callback used after the entity is deleted.
If you throw an error in this method the process stops, and an
error snackbar gets displayed.

#### Parameters

##### entityDeleteProps

[`EntityOnDeleteProps`](../interfaces/EntityOnDeleteProps)\<`M`, `USER`\>

#### Returns

`void`

***

### onPreSave()?

> `optional` **onPreSave**(`entitySaveProps`): `Partial`\<`M`\> \| `Promise`\<`Partial`\<`M`\>\>

Defined in: [types/entity\_callbacks.ts:42](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Callback used before saving, you need to return the values that will get
saved. If you throw an error in this method the process stops, and an
error snackbar gets displayed.

#### Parameters

##### entitySaveProps

[`EntityOnPreSaveProps`](EntityOnPreSaveProps)\<`M`, `USER`\>

#### Returns

`Partial`\<`M`\> \| `Promise`\<`Partial`\<`M`\>\>

***

### onSaveFailure()?

> `optional` **onSaveFailure**(`entitySaveProps`): `void` \| `Promise`\<`void`\>

Defined in: [types/entity\_callbacks.ts:33](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Callback used when saving fails

#### Parameters

##### entitySaveProps

[`EntityOnSaveFailureProps`](EntityOnSaveFailureProps)\<`M`, `USER`\>

#### Returns

`void` \| `Promise`\<`void`\>

***

### onSaveSuccess()?

> `optional` **onSaveSuccess**(`entitySaveProps`): `void` \| `Promise`\<`void`\>

Defined in: [types/entity\_callbacks.ts:26](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_callbacks.ts)

Callback used when save is successful

#### Parameters

##### entitySaveProps

[`EntityOnSaveProps`](../interfaces/EntityOnSaveProps)\<`M`, `USER`\>

#### Returns

`void` \| `Promise`\<`void`\>
