---
slug: "docs/api/functions/useDataTableController"
title: "useDataTableController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useDataTableController

# Function: useDataTableController()

> **useDataTableController**\<`M`, `USER`\>(`path`): [`EntityTableController`](../type-aliases/EntityTableController)\<`M`\>

Defined in: [core/src/components/common/useDataTableController.tsx:69](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/common/useDataTableController.tsx)

Use this hook to build a controller for the [EntityCollectionTable](EntityCollectionTable).
This controller is bound to data in a path in your specified driver.

Note that you can build your own hook returning a [EntityTableController](../type-aliases/EntityTableController)
if you would like to display different data.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Parameters

### path

[`DataTableControllerProps`](../type-aliases/DataTableControllerProps)\<`M`\>

## Returns

[`EntityTableController`](../type-aliases/EntityTableController)\<`M`\>
