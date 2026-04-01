---
slug: "docs/api/functions/useDataSourceTableController"
title: "useDataSourceTableController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useDataSourceTableController

# Function: useDataSourceTableController()

> **useDataSourceTableController**\<`M`, `USER`\>(`path`): [`EntityTableController`](../type-aliases/EntityTableController)\<`M`\>

Defined in: [core/src/components/common/useDataSourceTableController.tsx:68](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/common/useDataSourceTableController.tsx)

Use this hook to build a controller for the [EntityCollectionTable](EntityCollectionTable).
This controller is bound to data in a path in your specified datasource.

Note that you can build your own hook returning a [EntityTableController](../type-aliases/EntityTableController)
if you would like to display different data.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Parameters

### path

[`DataSourceTableControllerProps`](../type-aliases/DataSourceTableControllerProps)\<`M`\>

## Returns

[`EntityTableController`](../type-aliases/EntityTableController)\<`M`\>
