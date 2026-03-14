---
slug: "docs/api/functions/saveEntityWithCallbacks"
title: "saveEntityWithCallbacks"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / saveEntityWithCallbacks

# Function: saveEntityWithCallbacks()

> **saveEntityWithCallbacks**\<`M`, `USER`\>(`collection`): `Promise`\<`void`\>

Defined in: [hooks/data/save.ts:43](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/data/save.ts)

This function is in charge of saving an entity to the datasource.
It will run all the save callbacks specified in the collection.
It is also possible to attach callbacks on save success or error, and callback
errors.

If you just want to save the data without running the `afterSave`,
`afterSaveError` and `beforeSave` callbacks, you can use the `saveEntity` method
in the datasource ([useDataSource](useDataSource)).

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### collection

[`SaveEntityProps`](../interfaces/SaveEntityProps)\<`M`\> & `object` & `object`

## Returns

`Promise`\<`void`\>

## See

useDataSource
