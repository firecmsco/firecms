---
slug: "docs/api/functions/useDataSourceTableController"
title: "useDataSourceTableController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / useDataSourceTableController

# Function: useDataSourceTableController()

> **useDataSourceTableController**\<`M`, `USER`\>(`fullPath`): [`EntityTableController`](../type-aliases/EntityTableController)\<`M`\>

Defined in: [components/common/useDataSourceTableController.tsx:67](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/useDataSourceTableController.tsx)

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

### fullPath

[`DataSourceTableControllerProps`](../type-aliases/DataSourceTableControllerProps)\<`M`\>

## Returns

[`EntityTableController`](../type-aliases/EntityTableController)\<`M`\>
