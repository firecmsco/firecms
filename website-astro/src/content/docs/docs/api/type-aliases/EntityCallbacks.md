---
slug: "docs/api/type-aliases/EntityCallbacks"
title: "EntityCallbacks"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityCallbacks

# Type Alias: EntityCallbacks\<M, USER\>

> **EntityCallbacks**\<`M`, `USER`\> = `object`

Defined in: [types/src/types/entity\_callbacks.ts:12](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

This interface defines all the callbacks that can be used when an entity
is being created, updated or deleted.
Useful for adding your own logic or blocking the execution of the operation.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](User) = [`User`](User)

## Methods

### afterDelete()?

> `optional` **afterDelete**(`props`): `void`

Defined in: [types/src/types/entity\_callbacks.ts:60](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Callback used after the entity is deleted.

#### Parameters

##### props

[`EntityAfterDeleteProps`](../interfaces/EntityAfterDeleteProps)\<`M`, `USER`\>

#### Returns

`void`

***

### afterRead()?

> `optional` **afterRead**(`props`): [`Entity`](../interfaces/Entity)\<`M`\> \| `Promise`\<[`Entity`](../interfaces/Entity)\<`M`\>\>

Defined in: [types/src/types/entity\_callbacks.ts:18](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Callback used after fetching data

#### Parameters

##### props

[`EntityAfterReadProps`](../interfaces/EntityAfterReadProps)\<`M`, `USER`\>

#### Returns

[`Entity`](../interfaces/Entity)\<`M`\> \| `Promise`\<[`Entity`](../interfaces/Entity)\<`M`\>\>

***

### afterSave()?

> `optional` **afterSave**(`props`): `void` \| `Promise`\<`void`\>

Defined in: [types/src/types/entity\_callbacks.ts:36](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Callback used when save is successful

#### Parameters

##### props

[`EntityAfterSaveProps`](../interfaces/EntityAfterSaveProps)\<`M`, `USER`\>

#### Returns

`void` \| `Promise`\<`void`\>

***

### afterSaveError()?

> `optional` **afterSaveError**(`props`): `void` \| `Promise`\<`void`\>

Defined in: [types/src/types/entity\_callbacks.ts:43](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Callback used when saving fails

#### Parameters

##### props

[`EntityAfterSaveErrorProps`](EntityAfterSaveErrorProps)\<`M`, `USER`\>

#### Returns

`void` \| `Promise`\<`void`\>

***

### beforeDelete()?

> `optional` **beforeDelete**(`props`): `void`

Defined in: [types/src/types/entity\_callbacks.ts:53](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Callback used before the entity is deleted.
If you throw an error in this method the process stops, and an
error snackbar gets displayed.

#### Parameters

##### props

[`EntityBeforeDeleteProps`](../interfaces/EntityBeforeDeleteProps)\<`M`, `USER`\>

#### Returns

`void`

***

### beforeSave()?

> `optional` **beforeSave**(`props`): `Partial`\<`M`\> \| `Promise`\<`Partial`\<`M`\>\>

Defined in: [types/src/types/entity\_callbacks.ts:29](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_callbacks.ts)

Callback used before saving, you need to return the values that will get
saved. If you throw an error in this method the process stops, and an
error snackbar gets displayed.
This runs after schema validation.

#### Parameters

##### props

[`EntityBeforeSaveProps`](EntityBeforeSaveProps)\<`M`, `USER`\>

#### Returns

`Partial`\<`M`\> \| `Promise`\<`Partial`\<`M`\>\>
