---
slug: "docs/api/type-aliases/DataSourceTableControllerProps"
title: "DataSourceTableControllerProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / DataSourceTableControllerProps

# Type Alias: DataSourceTableControllerProps\<M\>

> **DataSourceTableControllerProps**\<`M`\> = `object`

Defined in: [components/common/useDataSourceTableController.tsx:21](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/useDataSourceTableController.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection

> **collection**: [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

Defined in: [components/common/useDataSourceTableController.tsx:29](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/useDataSourceTableController.tsx)

The collection that is represented by this config.

***

### entitiesDisplayedFirst?

> `optional` **entitiesDisplayedFirst**: [`Entity`](../interfaces/Entity)\<`M`\>[]

Defined in: [components/common/useDataSourceTableController.tsx:34](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/useDataSourceTableController.tsx)

List of entities that will be displayed on top, no matter the ordering.
This is used for reference fields selection

***

### forceFilter?

> `optional` **forceFilter**: [`FilterValues`](FilterValues)\<`string`\>

Defined in: [components/common/useDataSourceTableController.tsx:41](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/useDataSourceTableController.tsx)

Force filter to be applied to the table.

***

### fullPath

> **fullPath**: `string`

Defined in: [components/common/useDataSourceTableController.tsx:25](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/useDataSourceTableController.tsx)

Full path where the data of this table is located

***

### lastDeleteTimestamp?

> `optional` **lastDeleteTimestamp**: `number`

Defined in: [components/common/useDataSourceTableController.tsx:36](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/useDataSourceTableController.tsx)

***

### scrollRestoration?

> `optional` **scrollRestoration**: `ScrollRestorationController`

Defined in: [components/common/useDataSourceTableController.tsx:43](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/useDataSourceTableController.tsx)

***

### updateUrl?

> `optional` **updateUrl**: `boolean`

Defined in: [components/common/useDataSourceTableController.tsx:48](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/common/useDataSourceTableController.tsx)

When set to true the filters and sort will be updated in the URL
