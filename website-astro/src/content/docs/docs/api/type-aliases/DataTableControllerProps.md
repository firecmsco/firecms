---
slug: "docs/api/type-aliases/DataTableControllerProps"
title: "DataTableControllerProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DataTableControllerProps

# Type Alias: DataTableControllerProps\<M\>

> **DataTableControllerProps**\<`M`\> = `object`

Defined in: [core/src/components/common/useDataTableController.tsx:23](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/common/useDataTableController.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection

> **collection**: [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

Defined in: [core/src/components/common/useDataTableController.tsx:31](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/common/useDataTableController.tsx)

The collection that is represented by this config.

***

### entitiesDisplayedFirst?

> `optional` **entitiesDisplayedFirst**: [`Entity`](../interfaces/Entity)\<`M`\>[]

Defined in: [core/src/components/common/useDataTableController.tsx:36](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/common/useDataTableController.tsx)

List of entities that will be displayed on top, no matter the ordering.
This is used for reference fields selection

***

### forceFilter?

> `optional` **forceFilter**: [`FilterValues`](FilterValues)\<`string`\>

Defined in: [core/src/components/common/useDataTableController.tsx:43](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/common/useDataTableController.tsx)

Force filter to be applied to the table.

***

### lastDeleteTimestamp?

> `optional` **lastDeleteTimestamp**: `number`

Defined in: [core/src/components/common/useDataTableController.tsx:38](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/common/useDataTableController.tsx)

***

### path

> **path**: `string`

Defined in: [core/src/components/common/useDataTableController.tsx:27](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/common/useDataTableController.tsx)

Full path where the data of this table is located

***

### scrollRestoration?

> `optional` **scrollRestoration**: `ScrollRestorationController`

Defined in: [core/src/components/common/useDataTableController.tsx:45](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/common/useDataTableController.tsx)

***

### updateUrl?

> `optional` **updateUrl**: `boolean`

Defined in: [core/src/components/common/useDataTableController.tsx:50](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/common/useDataTableController.tsx)

When set to true the filters and sort will be updated in the URL
