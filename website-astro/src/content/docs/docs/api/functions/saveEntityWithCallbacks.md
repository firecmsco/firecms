---
slug: "docs/api/functions/saveEntityWithCallbacks"
title: "saveEntityWithCallbacks"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / saveEntityWithCallbacks

# Function: saveEntityWithCallbacks()

> **saveEntityWithCallbacks**\<`M`\>(`collection`): `Promise`\<[`Entity`](../interfaces/Entity)\<`M`\>\>

Defined in: [core/src/hooks/data/save.ts:33](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/data/save.ts)

This function is in charge of saving an entity.
It will run all the save callbacks specified in the collection.
It is also possible to attach callbacks on save success or error, and callback
errors.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### collection

[`SaveEntityProps`](../interfaces/SaveEntityProps)\<`M`\> & `object` & `object`

## Returns

`Promise`\<[`Entity`](../interfaces/Entity)\<`M`\>\>
