---
slug: "docs/api/type-aliases/DataSourceTableControllerProps"
title: "DataSourceTableControllerProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DataSourceTableControllerProps

# Type Alias: DataSourceTableControllerProps\<M\>

> **DataSourceTableControllerProps**\<`M`\> = `object`

Defined in: [core/src/components/common/useDataSourceTableController.tsx:22](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/common/useDataSourceTableController.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection

> **collection**: [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

Defined in: [core/src/components/common/useDataSourceTableController.tsx:30](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/common/useDataSourceTableController.tsx)

The collection that is represented by this config.

***

### entitiesDisplayedFirst?

> `optional` **entitiesDisplayedFirst**: [`Entity`](../interfaces/Entity)\<`M`\>[]

Defined in: [core/src/components/common/useDataSourceTableController.tsx:35](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/common/useDataSourceTableController.tsx)

List of entities that will be displayed on top, no matter the ordering.
This is used for reference fields selection

***

### forceFilter?

> `optional` **forceFilter**: [`FilterValues`](FilterValues)\<`string`\>

Defined in: [core/src/components/common/useDataSourceTableController.tsx:42](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/common/useDataSourceTableController.tsx)

Force filter to be applied to the table.

***

### lastDeleteTimestamp?

> `optional` **lastDeleteTimestamp**: `number`

Defined in: [core/src/components/common/useDataSourceTableController.tsx:37](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/common/useDataSourceTableController.tsx)

***

### path

> **path**: `string`

Defined in: [core/src/components/common/useDataSourceTableController.tsx:26](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/common/useDataSourceTableController.tsx)

Full path where the data of this table is located

***

### scrollRestoration?

> `optional` **scrollRestoration**: `ScrollRestorationController`

Defined in: [core/src/components/common/useDataSourceTableController.tsx:44](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/common/useDataSourceTableController.tsx)

***

### updateUrl?

> `optional` **updateUrl**: `boolean`

Defined in: [core/src/components/common/useDataSourceTableController.tsx:49](https://github.com/rebaseco/rebase/blob/main/packages/core/src/components/common/useDataSourceTableController.tsx)

When set to true the filters and sort will be updated in the URL
