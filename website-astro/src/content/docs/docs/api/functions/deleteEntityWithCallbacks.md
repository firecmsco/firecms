---
slug: "docs/api/functions/deleteEntityWithCallbacks"
title: "deleteEntityWithCallbacks"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / deleteEntityWithCallbacks

# Function: deleteEntityWithCallbacks()

> **deleteEntityWithCallbacks**\<`M`, `USER`\>(`data`): `Promise`\<`boolean`\>

Defined in: [core/src/hooks/data/delete.ts:38](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/delete.ts)

This function is in charge of deleting an entity.
It will run all the delete callbacks specified in the collection.
It is also possible to attach callbacks on save success or error, and callback
errors.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### data

[`DeleteEntityProps`](../interfaces/DeleteEntityProps)\<`M`\> & `object` & `object`

## Returns

`Promise`\<`boolean`\>
