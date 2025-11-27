---
slug: "docs/api/functions/deleteEntityWithCallbacks"
title: "deleteEntityWithCallbacks"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / deleteEntityWithCallbacks

# Function: deleteEntityWithCallbacks()

> **deleteEntityWithCallbacks**\<`M`, `USER`\>(`dataSource`): `Promise`\<`boolean`\>

Defined in: [hooks/data/delete.ts:46](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/data/delete.ts)

This function is in charge of deleting an entity in the datasource.
It will run all the delete callbacks specified in the collection.
It is also possible to attach callbacks on save success or error, and callback
errors.

If you just want to delete any data without running the `onPreDelete`,
and `onDelete` callbacks, you can use the `deleteEntity` method
in the datasource ([useDataSource](useDataSource)).

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### dataSource

[`DeleteEntityProps`](../interfaces/DeleteEntityProps)\<`M`\> & `object` & `object`

## Returns

`Promise`\<`boolean`\>
